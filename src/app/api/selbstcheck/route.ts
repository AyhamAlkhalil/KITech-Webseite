import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { darfMelden, kennungVon } from "@/lib/melde-sperre";
import { graphKonfiguration, sendeMail } from "@/lib/graph-mail";
import { erzeugeSelbstcheckPdf } from "@/lib/selbstcheck-pdf";
import { empfaengerAus } from "@/lib/selbstcheck-empfaenger";
import { ANTWORT_LABEL, BAENDER, FRAGEN, werteAus } from "@/data/selbstcheck";

/**
 * Nimmt einen ausgefüllten EU-AI-Act-Selbstcheck entgegen und schickt die
 * Auswertung als PDF an das Postfach, das sie bearbeitet.
 *
 * **Auf Ansage (18.09.2026):** Das Ergebnis geht an einen Berater, und der
 * Ausfüllende bekommt es nicht zu sehen.
 *
 * **Nachgeschärft am 24.09.2026:** „Wir wissen nicht, wer den Selbstcheck
 * macht — ein Name + Firma reicht." Beide sind wieder Pflicht und stehen im
 * **Betreff**, damit die Liste im Postfach schon alles sagt: wer und wie viel.
 * Die E-Mail-Adresse des Ausfüllenden bleibt draußen (Ansage 18.09.2026), also
 * führt der Weg zum Gespräch weiter über den Termin-Knopf und nicht über eine
 * Antwort auf diese Mail.
 *
 * ⚠️ **Der Unterschied zu `/api/ereignis` ist der Grund für jede Entscheidung
 * in dieser Datei.** Dort bestätigt die Route immer mit 204, weil eine
 * verlorene Benachrichtigung niemandem wehtut. Hier ist die Mail das einzige
 * Exemplar: Der Besucher hat acht Fragen beantwortet und sieht nichts davon.
 * Kommt die Mail nicht an, ist die Eingabe weg und niemand erfährt es.
 * Deshalb antwortet diese Route bei jedem Fehlschlag mit einem Fehlercode, der
 * Client zeigt ihn an und lässt es erneut versuchen.
 *
 * ## Was übertragen wird
 *
 * Die acht Antworten, der Referrer und die Kampagnenkennung. **Keine IP** in
 * Mail oder PDF — die Sperre gegen Dauerfeuer hält sie wenige Minuten im
 * Speicher (`lib/melde-sperre.ts`), das benennt `/datenschutz`.
 *
 * ## Einrichtung
 *
 * `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET` und `MAIL_VON`
 * in Coolify (siehe `src/lib/graph-mail.ts`). Fehlt eine davon, antwortet die
 * Route mit 503 — **nicht** mit 204: eine Seite, die „eingegangen" sagt, ohne
 * dass etwas gesendet wurde, ist schlimmer als eine sichtbare Störung.
 * `SELBSTCHECK_MAIL_AN` ändert den Empfänger ohne Deploy.
 */

export const dynamic = "force-dynamic";

/** Wer mehr als das schafft, füllt keinen Check aus. */
const MAX_PRO_FENSTER = 5;


/* eslint-disable-next-line no-control-regex --
   Die Regel warnt vor Steuerzeichen im Muster, weil sie dort meist ein
   Versehen sind. Hier sind sie der Zweck: Genau diese Zeichen sollen weg. */
const sauber = (wert: string) => wert.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();

/** Referrer und UTM-Felder: fremde Eingabe, landet in Mail und PDF. */
const freitext = (laenge: number) => z.string().max(laenge).transform(sauber).nullable().optional();

const EingabeSchema = z.object({
  /** Wer geantwortet hat. Ohne die beiden ist die Auswertung ein Blatt ohne Absender. */
  name: z.string().trim().min(2).max(120).transform(sauber),
  firma: z.string().trim().min(2).max(160).transform(sauber),
  /** Genau so viele Antworten wie Fragen, in der Reihenfolge von `FRAGEN`. */
  antworten: z.array(z.enum(["yes", "no", "unsure"])).length(FRAGEN.length),
  referrer: freitext(500),
  utmSource: freitext(120),
  utmMedium: freitext(120),
  utmCampaign: freitext(120),
});

/** Macht aus dem Firmennamen einen Dateinamen, der jedes Postfach überlebt. */
function dateiname(firma: string): string {
  return (
    firma
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "unbekannt"
  );
}

export async function POST(request: NextRequest) {
  if (!darfMelden("selbstcheck", kennungVon(request), MAX_PRO_FENSTER)) {
    return NextResponse.json(
      { fehler: "Zu viele Versuche. Bitte in einigen Minuten noch einmal." },
      { status: 429 }
    );
  }

  let daten: z.infer<typeof EingabeSchema>;
  try {
    daten = EingabeSchema.parse(await request.json());
  } catch {
    /* Ohne Feldliste: eine Fehlermeldung, die verrät, was erwartet wird, ist
       eine Anleitung zum Missbrauch. */
    return NextResponse.json({ fehler: "Ungültige Angaben." }, { status: 400 });
  }

  const konfig = graphKonfiguration();
  if (!konfig) {
    console.error("[selbstcheck] Graph nicht eingerichtet — AZURE_*/MAIL_VON fehlen.");
    return NextResponse.json(
      { fehler: "Der Versand ist gerade nicht erreichbar. Bitte später noch einmal." },
      { status: 503 }
    );
  }

  const zeitpunkt = new Date();
  const auswertung = werteAus(daten.antworten);
  const herkunft = [
    daten.referrer || null,
    daten.utmSource ? `utm_source=${daten.utmSource}` : null,
    daten.utmMedium ? `utm_medium=${daten.utmMedium}` : null,
    daten.utmCampaign ? `utm_campaign=${daten.utmCampaign}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const empfaenger = empfaengerAus(process.env.SELBSTCHECK_MAIL_AN);

  const berlin = { timeZone: "Europe/Berlin" } as const;
  const band = BAENDER[auswertung.band].label;

  try {
    const pdf = await erzeugeSelbstcheckPdf({
      name: daten.name,
      firma: daten.firma,
      antworten: daten.antworten,
      auswertung,
      zeitpunkt,
      herkunft: herkunft || undefined,
    });

    const offen = [...auswertung.offen, ...auswertung.unklar].sort((a, b) => a - b);

    await sendeMail(konfig, {
      an: empfaenger,
      /* Ergebnis im Betreff, damit die Liste im Postfach schon sortierbar ist,
         ohne das PDF zu öffnen. Keine Nutzereingabe darin. */
      betreff: `Selbstcheck EU AI Act: ${daten.firma} — ${auswertung.prozent}/100 (${band})`,
      text: [
        `${daten.name}, ${daten.firma}`,
        "",
        `Ergebnis: ${auswertung.prozent} von 100 — ${band}`,
        offen.length > 0
          ? `Offen: ${offen.map((i) => `${FRAGEN[i].label} (${ANTWORT_LABEL[daten.antworten[i]]})`).join(", ")}`
          : "Offene Punkte: keine",
        "",
        herkunft ? `Herkunft: ${herkunft}` : "Herkunft: unbekannt",
        `Ausgefüllt: ${zeitpunkt.toLocaleString("de-DE", berlin)} Uhr`,
        "",
        "Die vollständige Auswertung steht im PDF im Anhang.",
        "Eine E-Mail-Adresse wird nicht abgefragt; der Ausfüllende hat das Ergebnis nicht gesehen.",
      ].join("\n"),
      anhaenge: [
        {
          /* Firma plus Datum: So heißt die Datei im Postfach wie der Fall, um
             den es geht. Die Uhrzeit trennt zwei Checks derselben Firma. */
          name: `selbstcheck-${dateiname(daten.firma)}-${zeitpunkt.toLocaleDateString("sv-SE", berlin)}-${zeitpunkt
            .toLocaleTimeString("de-DE", { ...berlin, hour: "2-digit", minute: "2-digit" })
            .replace(":", "")}.pdf`,
          typ: "application/pdf",
          inhalt: pdf,
        },
      ],
    });
  } catch (fehler) {
    /* Serverseitig mit Grund — im Log steht, ob Azure das Token verweigert
       oder Graph die Mail. Zum Client geht nur, dass es nicht geklappt hat. */
    console.error("[selbstcheck] Versand fehlgeschlagen:", fehler);
    return NextResponse.json(
      { fehler: "Die Übermittlung hat nicht geklappt. Bitte noch einmal versuchen." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
