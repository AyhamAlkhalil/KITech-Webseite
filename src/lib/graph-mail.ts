/**
 * Mailversand über Microsoft Graph, Client-Credentials-Flow.
 *
 * Derselbe Weg, den `scripts/tagesbericht/sende_tagesbericht.py` seit dem
 * 14.08.2026 nimmt — dieselbe App-Registrierung, dieselbe Anwendungsrolle
 * `Mail.Send`, nur in TypeScript und ohne den Umweg über den Cron. Ein
 * zweiter Zugang wäre ein zweites Geheimnis, das irgendwann abläuft, ohne
 * dass jemand davon weiß.
 *
 * ⚠️ **Diese Funktion schluckt keine Fehler.** Der Meldeweg über
 * `/api/ereignis` darf das, weil dort nur eine Benachrichtigung verloren geht.
 * Hier hängt der ganze Zweck daran: Der Besucher bekommt seine Auswertung
 * nicht mehr angezeigt, also ist eine Mail, die nicht ankommt, die einzige
 * Spur eines verlorenen Interessenten. Wer den Fehler wegfängt, baut genau
 * den lautlosen Ausfall, der uns zweimal Tage gekostet hat.
 *
 * ## Einrichtung (Coolify, Runtime-Variablen, kein Rebuild nötig)
 *
 * | Variable | Wirkung |
 * |---|---|
 * | `AZURE_TENANT_ID` | Verzeichnis der App-Registrierung |
 * | `AZURE_CLIENT_ID` | die App |
 * | `AZURE_CLIENT_SECRET` | ihr Geheimnis — läuft ab, Ablaufdatum im Portal |
 * | `MAIL_VON` | Postfach, aus dem gesendet wird (Mail.Send gilt je Postfach) |
 *
 * Keine trägt `NEXT_PUBLIC_`; alle vier bleiben serverseitig.
 */

const TOKEN_ENDPUNKT = (tenant: string) =>
  `https://login.microsoftonline.com/${encodeURIComponent(tenant)}/oauth2/v2.0/token`;

export interface Anhang {
  name: string;
  /** MIME-Typ, z. B. `application/pdf`. */
  typ: string;
  inhalt: Uint8Array;
}

export interface MailAuftrag {
  an: string[];
  betreff: string;
  /** Reiner Text; Graph bekommt ihn als `Text`, nicht als HTML. */
  text: string;
  anhaenge?: Anhang[];
  /** Worauf eine Antwort gehen soll — hier die Adresse des Interessenten. */
  antwortAn?: string;
}

interface GraphKonfiguration {
  tenant: string;
  clientId: string;
  clientSecret: string;
  absender: string;
}

/**
 * Liest die vier Variablen. Gibt `null` zurück, wenn eine fehlt — der
 * Aufrufer entscheidet, ob das ein Fehler ist oder ein abgeschalteter Weg.
 */
export function graphKonfiguration(): GraphKonfiguration | null {
  /* `trim()`, weil ein Wert aus Leerzeichen sonst als gesetzt gälte. In einer
     Oberfläche wie Coolify wird eingefügt, nicht getippt — ein mitkopiertes
     Leerzeichen ist dort der wahrscheinlichste Fehler. */
  const tenant = process.env.AZURE_TENANT_ID?.trim();
  const clientId = process.env.AZURE_CLIENT_ID?.trim();
  const clientSecret = process.env.AZURE_CLIENT_SECRET?.trim();
  const absender = process.env.MAIL_VON?.trim();
  if (!tenant || !clientId || !clientSecret || !absender) return null;
  return { tenant, clientId, clientSecret, absender };
}

/**
 * Das Zugriffstoken gilt rund eine Stunde. Es im Prozess zu halten spart bei
 * jedem Versand einen Netzaufruf; der Container läuft als ein Node-Prozess
 * (`output: "standalone"`), mehr Zustand braucht es dafür nicht.
 */
let gemerktesToken: { wert: string; gueltigBis: number } | null = null;

async function token(konfig: GraphKonfiguration): Promise<string> {
  if (gemerktesToken && gemerktesToken.gueltigBis > Date.now()) return gemerktesToken.wert;

  const antwort = await fetch(TOKEN_ENDPUNKT(konfig.tenant), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: konfig.clientId,
      client_secret: konfig.clientSecret,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!antwort.ok) {
    /* Der Fehlerkörper von Azure nennt die `client_id`, aber nie das Secret.
       Er ist der einzige Hinweis darauf, ob das Geheimnis abgelaufen ist. */
    throw new Error(`Azure gibt kein Token (${antwort.status}): ${(await antwort.text()).slice(0, 300)}`);
  }

  const rumpf = (await antwort.json()) as { access_token?: string; expires_in?: number };
  if (!rumpf.access_token) throw new Error("Azure antwortet ohne access_token");

  /* 60 Sekunden Sicherheitsabzug, damit kein Versand in ein Token läuft, das
     zwischen Prüfung und Aufruf abläuft. */
  gemerktesToken = {
    wert: rumpf.access_token,
    gueltigBis: Date.now() + Math.max(0, (rumpf.expires_in ?? 3600) - 60) * 1000,
  };
  return rumpf.access_token;
}

/** Verschickt die Mail. Wirft, wenn Graph sie nicht annimmt. */
export async function sendeMail(konfig: GraphKonfiguration, auftrag: MailAuftrag): Promise<void> {
  const zugriff = await token(konfig);

  const antwort = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(konfig.absender)}/sendMail`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${zugriff}` },
      body: JSON.stringify({
        message: {
          subject: auftrag.betreff,
          body: { contentType: "Text", content: auftrag.text },
          toRecipients: auftrag.an.map((adresse) => ({ emailAddress: { address: adresse } })),
          ...(auftrag.antwortAn
            ? { replyTo: [{ emailAddress: { address: auftrag.antwortAn } }] }
            : {}),
          attachments: (auftrag.anhaenge ?? []).map((anhang) => ({
            "@odata.type": "#microsoft.graph.fileAttachment",
            name: anhang.name,
            contentType: anhang.typ,
            contentBytes: Buffer.from(anhang.inhalt).toString("base64"),
          })),
        },
        saveToSentItems: false,
      }),
      signal: AbortSignal.timeout(20000),
    }
  );

  if (!antwort.ok) {
    throw new Error(`Graph nimmt die Mail nicht an (${antwort.status}): ${(await antwort.text()).slice(0, 300)}`);
  }
}
