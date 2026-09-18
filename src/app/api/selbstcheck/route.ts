import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { darfMelden, kennungVon } from "@/lib/melde-sperre";
import { graphKonfiguration, sendeMail } from "@/lib/graph-mail";
import { erzeugeSelbstcheckPdf } from "@/lib/selbstcheck-pdf";
import { ANTWORT_LABEL, BAENDER, FRAGEN, werteAus } from "@/data/selbstcheck";

/**
 * Nimmt einen ausgefüllten EU-AI-Act-Selbstcheck entgegen und schickt die
 * Auswertung als PDF an das Postfach, das sie bearbeitet.
 *
 * **Auf Ansage (18.09.2026):** Das Ergebnis geht an
 * `joerg.kratzat@kitech-software.de`, und der Ausfüllende bekommt es nicht
 * mehr zu sehen. Vorher lief der Check vollständig im Browser: keine
 * Übertragung, Auswertung sofort auf der Seite, optional ein `mailto:`-Entwurf.
 *
 * ⚠️ **Das ist der Unterschied zu `/api/ereignis`, und er ist der Grund für
 * jede Entscheidung in dieser Datei.** Dort bestätigt die Route immer mit 204,
 * weil eine verlorene Benachrichtigung niemandem wehtut. Hier ist die Mail das
 * einzige Exemplar: Der Besucher hat acht Fragen beantwortet und sieht nichts
 * davon. Kommt die Mail nicht an, ist die Eingabe weg und niemand erfährt es.
 * Deshalb antwortet diese Route bei jedem Fehlschlag mit einem Fehlercode, der
 * Client zeigt ihn an und lässt es erneut versuchen.
 *
 * ## Was übertragen wird
 *
 * Name, Unternehmen, E-Mail — alle drei Pflicht, sonst kann niemand antworten
 * — dazu die acht Antworten sowie Referrer und Kampagne. **Keine IP** und
 * keine Firmenerkennung über `ipinfo.io`: Die Firma steht jetzt im Formular,
 * der Umweg über einen US-Dienst wäre eine Weitergabe ohne Zweck.
 *
 * Rechtsgrundlage ist die Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die das
 * Formular ausdrücklich einholt; `/datenschutz` benennt Verarbeitung und
 * Empfänger.
 *
 * ## Einrichtung
 *
 * `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET` und `MAIL_VON`
 * in Coolify (siehe `src/lib/graph-mail.ts`). Fehlt eine davon, antwortet die
 * Route mit 503 — **nicht** mit 204: eine Seite, die „gesendet" sagt, ohne
 * dass etwas gesendet wurde, ist schlimmer als eine sichtbare Störung.
 * `SELBSTCHECK_MAIL_AN` ändert den Empfänger ohne Deploy.
 */

export const dynamic = "force-dynamic";

/** Wer mehr als das schafft, füllt keinen Check aus. */
const MAX_PRO_FENSTER = 5;

const STANDARD_EMPFAENGER = "joerg.kratzat@kitech-software.de";

const AntwortWert = z.enum(["yes", "no", "unsure"]);

/**
 * Nimmt fremder Eingabe die Steuerzeichen.
 *
 * Name und Firma landen im **Betreff** der Mail und in den PDF-Metadaten. Ein
 * eingebettetes `\r` oder `\n` ist dort der klassische Injection-Vektor für
 * Kopfzeilen. Graph baut die Nachricht zwar aus JSON zusammen und dürfte das
 * neutralisieren — aber „dürfte" ist keine Zusicherung, auf die man eine
 * Eingabegrenze stützt.
 */
/* eslint-disable-next-line no-control-regex --
   Die Regel warnt vor Steuerzeichen im Muster, weil sie dort meist ein
   Versehen sind. Hier sind sie der Zweck: Genau diese Zeichen sollen weg. */
const sauber = (wert: string) => wert.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();

const EingabeSchema = z.object({
  name: z.string().trim().min(2).max(120).transform(sauber),
  firma: z.string().trim().min(2).max(160).transform(sauber),
  email: z.string().trim().email().max(200),
  /** Genau so viele Antworten wie Fragen, in der Reihenfolge von `FRAGEN`. */
  antworten: z.array(AntwortWert).length(FRAGEN.length),
  /** Muss gesetzt sein — ohne Einwilligung keine Verarbeitung. */
  einwilligung: z.literal(true),
  referrer: z.string().trim().max(500).nullable().optional(),
  utmSource: z.string().trim().max(120).nullable().optional(),
  utmMedium: z.string().trim().max(120).nullable().optional(),
  utmCampaign: z.string().trim().max(120).nullable().optional(),
  /* Honigtopf: ein Feld, das kein Mensch sieht und jedes Formular-Skript
     ausfüllt. Kostet nichts und hält das Grundrauschen draußen. */
  webseite: z.string().max(0).optional(),
});

/** Macht aus dem Firmennamen einen Dateinamen, der jedes Postfach überlebt. */
function dateiname(firma: string, zeitpunkt: Date): string {
  const kern =
    firma
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "unbekannt";
  return `selbstcheck-${kern}-${zeitpunkt.toISOString().slice(0, 10)}.pdf`;
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

  /* Ein `SELBSTCHECK_MAIL_AN`, das nur aus Kommas oder Leerzeichen besteht,
     ergäbe sonst eine leere Empfängerliste — ein Tippfehler in Coolify wäre
     damit ein stiller Totalausfall. */
  const eingetragen = (process.env.SELBSTCHECK_MAIL_AN ?? "")
    .split(",")
    .map((adresse) => adresse.trim())
    .filter(Boolean);
  const empfaenger = eingetragen.length > 0 ? eingetragen : [STANDARD_EMPFAENGER];

  try {
    const pdf = await erzeugeSelbstcheckPdf({
      name: daten.name,
      firma: daten.firma,
      email: daten.email,
      antworten: daten.antworten,
      auswertung,
      zeitpunkt,
      herkunft: herkunft || undefined,
    });

    const offen = [...auswertung.offen, ...auswertung.unklar].sort((a, b) => a - b);

    await sendeMail(konfig, {
      an: empfaenger,
      /* Der Betreff trägt das Ergebnis, damit die Liste im Postfach schon
         sortierbar ist, ohne das PDF zu öffnen. */
      betreff: `Selbstcheck EU AI Act: ${daten.firma} — ${auswertung.prozent}/100 (${BAENDER[auswertung.band].label})`,
      text: [
        `${daten.name}, ${daten.firma}`,
        daten.email,
        "",
        `Ergebnis: ${auswertung.prozent} von 100 — ${BAENDER[auswertung.band].label}`,
        offen.length > 0
          ? `Offen: ${offen.map((i) => `${FRAGEN[i].label} (${ANTWORT_LABEL[daten.antworten[i]]})`).join(", ")}`
          : "Offene Punkte: keine",
        "",
        herkunft ? `Herkunft: ${herkunft}` : "Herkunft: unbekannt",
        `Ausgefüllt: ${zeitpunkt.toLocaleString("de-DE", { timeZone: "Europe/Berlin" })} Uhr`,
        "",
        "Die vollständige Auswertung steht im PDF im Anhang.",
        "Der Ausfüllende hat das Ergebnis nicht gesehen — er erwartet eine Rückmeldung.",
      ].join("\n"),
      antwortAn: daten.email,
      anhaenge: [
        { name: dateiname(daten.firma, zeitpunkt), typ: "application/pdf", inhalt: pdf },
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
