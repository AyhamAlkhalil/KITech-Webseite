import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import {
  ANTWORT_LABEL,
  BAENDER,
  FRAGEN,
  MAX_PUNKTE,
  type Antwort,
  type Auswertung,
} from "@/data/selbstcheck";

/**
 * Baut die Auswertung des EU-AI-Act-Selbstchecks als PDF.
 *
 * Reines `pdf-lib`, **kein Chrome**: Das Standalone-Image ist `node:22-alpine`
 * und bringt keinen Browser mit (siehe `Dockerfile`). Ein HTML-nach-PDF-Weg
 * haette entweder Chromium ins Image geholt — dreistellige Megabyte fuer acht
 * Fragen — oder einen Fremddienst, der die Antworten eines Interessenten zu
 * sehen bekommt. Beides steht ausser Verhaeltnis.
 *
 * Gesetzt wird in Helvetica aus den 14 Standardschriften. Die liegen in jedem
 * PDF-Betrachter vor und muessen nicht eingebettet werden; Poppins koennte man
 * einbetten, kostet aber eine Schriftdatei im Build fuer ein Dokument, das
 * niemand als Marketingstueck liest.
 */

/* --------------------------------------------------------------- Rahmen -- */

const SEITE = { breite: 595.28, hoehe: 841.89 } as const;
const RAND = 56;
const SPALTE = SEITE.breite - RAND * 2;
/** Ab hier beginnt eine neue Seite — Platz fuer die Fusszeile. */
const UNTERKANTE = 72;

/** Dieselben Werte wie `src/index.css`, damit das PDF nicht eigene Farben erfindet. */
function hsl(h: number, s: number, l: number): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0]
    : h < 120 ? [x, c, 0]
    : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c]
    : h < 300 ? [x, 0, c]
    : [c, 0, x];
  return rgb(r + m, g + m, b + m);
}

const FARBE = {
  text: hsl(231, 0.36, 0.12),
  gedaempft: hsl(231, 0.12, 0.42),
  akzent: hsl(224, 0.76, 0.44),
  linie: hsl(0, 0, 0.82),
  erfuellt: hsl(152, 0.55, 0.38),
  unklar: hsl(224, 0.76, 0.44),
  offen: hsl(0, 0.72, 0.48),
} as const;

const ANTWORT_FARBE: Record<Antwort, RGB> = {
  yes: FARBE.erfuellt,
  unsure: FARBE.unklar,
  no: FARBE.offen,
};

/**
 * Macht einen Text fuer WinAnsi setzbar.
 *
 * Die Standardschriften koennen nur diese Kodierung, und `pdf-lib` **wirft**
 * bei einem Zeichen ausserhalb davon. Umlaute, Anfuehrungszeichen und
 * Gedankenstriche sind enthalten; alles andere — ein Emoji im Firmennamen, ein
 * kyrillischer Buchstabe — wuerde den Versand sonst mit einer Ausnahme
 * abbrechen. Fremde Eingabe landet hier, also wird ersetzt statt gehofft.
 */
/**
 * Was WinAnsi setzen kann, als Negation: ASCII, Latin-1 und die Handvoll
 * Zeichen, die WinAnsi zusaetzlich auf den Plaetzen 0x80-0x9f fuehrt —
 * darunter Euro, Gedankenstrich und die deutschen Anfuehrungszeichen.
 */
const WINANSI_ERLAUBT =
  /[^\u0020-\u007e\u00a0-\u00ff\u20ac\u201a\u0192\u201e\u2026\u2020\u2021\u02c6\u2030\u0160\u2039\u0152\u017d\u2018\u2019\u201c\u201d\u2022\u2013\u2014\u02dc\u2122\u0161\u203a\u0153\u017e\u0178]/g;

function winAnsi(text: string): string {
  return text
    .replace(/[\u00a0\u2007\u2009\u202f]/g, " ")
    .replace(/[\u2010\u2011\u2012\u2212]/g, "-")
    .replace(/[\u2018\u2019\u2032]/g, "'")
    .replace(/[\u201c\u201d\u2033]/g, '"')
    /* Alles, was WinAnsi nicht kann, faellt heraus statt als "?" stehen zu
       bleiben: ein Emoji im Firmennamen soll das Dokument nicht aussehen
       lassen, als haette es einen Fehler. */
    .replace(WINANSI_ERLAUBT, "")
    .replace(/ {2,}/g, " ")
    .trim();
}

/**
 * Bricht Text auf die verfuegbare Breite um.
 *
 * ⚠️ Der Umbruch an Leerzeichen allein reicht nicht: Eine Referrer-URL ist ein
 * einziges „Wort" und kann breiter sein als die ganze Spalte. Ohne den harten
 * Schnitt weiter unten laeuft sie stumm aus der Seite — `pdf-lib` beschneidet
 * nicht, es zeichnet einfach jenseits des Rands.
 */
function umbrechen(text: string, font: PDFFont, groesse: number, breite: number): string[] {
  const zeilen: string[] = [];
  for (const absatz of winAnsi(text).split("\n")) {
    let zeile = "";
    for (const wort of absatz.split(/\s+/).filter(Boolean)) {
      const versuch = zeile ? `${zeile} ${wort}` : wort;
      if (font.widthOfTextAtSize(versuch, groesse) <= breite) {
        zeile = versuch;
        continue;
      }
      if (zeile) {
        zeilen.push(zeile);
        zeile = "";
      }
      let rest = wort;
      while (font.widthOfTextAtSize(rest, groesse) > breite) {
        const schnitt = passendeLaenge(rest, font, groesse, breite);
        zeilen.push(rest.slice(0, schnitt));
        rest = rest.slice(schnitt);
      }
      zeile = rest;
    }
    zeilen.push(zeile);
  }
  return zeilen;
}

/** Wie viele Zeichen von `wort` noch in `breite` passen — binaer gesucht. */
function passendeLaenge(wort: string, font: PDFFont, groesse: number, breite: number): number {
  let unten = 1;
  let oben = wort.length;
  while (unten < oben) {
    const mitte = Math.ceil((unten + oben) / 2);
    if (font.widthOfTextAtSize(wort.slice(0, mitte), groesse) <= breite) unten = mitte;
    else oben = mitte - 1;
  }
  return unten;
}

/**
 * Schneidet einen Wert auf eine Laenge, die als Hinweis noch taugt.
 *
 * Gedacht fuer die Herkunft: Ein Referrer darf laut Schema 500 Zeichen haben,
 * und niemand liest 500 Zeichen Kampagnen-URL. Gekuerzt steht wenigstens die
 * Domain da, wo sie hingehoert.
 */
function kuerzen(wert: string, laenge: number): string {
  return wert.length <= laenge ? wert : `${wert.slice(0, laenge - 1).trimEnd()}...`;
}

/* ---------------------------------------------------------------- Inhalt -- */

export interface SelbstcheckPdfDaten {
  name: string;
  firma: string;
  email: string;
  antworten: Antwort[];
  auswertung: Auswertung;
  zeitpunkt: Date;
  /** Woher der Besucher kam. Leer, wenn unbekannt. */
  herkunft?: string;
}

export async function erzeugeSelbstcheckPdf(daten: SelbstcheckPdfDaten): Promise<Uint8Array> {
  const dokument = await PDFDocument.create();
  const normal = await dokument.embedFont(StandardFonts.Helvetica);
  const fett = await dokument.embedFont(StandardFonts.HelveticaBold);

  dokument.setTitle(`EU-AI-Act-Selbstcheck - ${winAnsi(daten.firma)}`);
  dokument.setSubject("Auswertung eines ausgefuellten Selbstchecks");
  dokument.setCreationDate(daten.zeitpunkt);

  let seite = dokument.addPage([SEITE.breite, SEITE.hoehe]);
  let y = SEITE.hoehe - RAND;

  /** Legt bei Bedarf eine neue Seite an und gibt die aktuelle zurueck. */
  function platz(hoehe: number): PDFPage {
    if (y - hoehe < UNTERKANTE) {
      seite = dokument.addPage([SEITE.breite, SEITE.hoehe]);
      y = SEITE.hoehe - RAND;
    }
    return seite;
  }

  function text(
    inhalt: string,
    { groesse = 10, font = normal, farbe = FARBE.text, abstand = 1.45, breite = SPALTE, x = RAND } = {}
  ): void {
    for (const zeile of umbrechen(inhalt, font, groesse, breite)) {
      const ziel = platz(groesse * abstand);
      y -= groesse * abstand;
      ziel.drawText(zeile, { x, y, size: groesse, font, color: farbe });
    }
  }

  function linie(luft = 10): void {
    const ziel = platz(luft + 1);
    y -= luft;
    ziel.drawLine({
      start: { x: RAND, y },
      end: { x: RAND + SPALTE, y },
      thickness: 0.75,
      color: FARBE.linie,
    });
  }

  function luft(hoehe: number): void {
    platz(hoehe);
    y -= hoehe;
  }

  /* -- Kopf ------------------------------------------------------------- */

  text("EU AI ACT - SELBSTCHECK", { groesse: 9, font: fett, farbe: FARBE.akzent });
  luft(6);
  text("Auswertung", { groesse: 24, font: fett });
  luft(4);
  text(
    `Ausgefüllt am ${daten.zeitpunkt.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Europe/Berlin",
    })} um ${daten.zeitpunkt.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Berlin",
    })} Uhr`,
    { groesse: 10, farbe: FARBE.gedaempft }
  );
  linie(16);
  luft(18);

  /* -- Wer ------------------------------------------------------------- */

  /* ⚠️ Auch hier umbrechen, nicht nur zeichnen. Die Werte sind fremde Eingabe
     und duerfen lang sein: `firma` bis 160 Zeichen, `herkunft` setzt sich aus
     Referrer und drei UTM-Feldern zusammen. Eine einzige `drawText`-Zeile lief
     bei so etwas rechts aus der Seite — und zwar lautlos. */
  const WERT_X = RAND + 92;
  for (const [beschriftung, wert] of [
    ["Name", daten.name],
    ["Unternehmen", daten.firma],
    ["E-Mail", daten.email],
    ...(daten.herkunft ? [["Herkunft", kuerzen(daten.herkunft, 240)]] : []),
  ] as [string, string][]) {
    const zeilen = umbrechen(wert, fett, 10, SPALTE - 92);
    zeilen.forEach((zeile, i) => {
      const ziel = platz(15);
      y -= 15;
      if (i === 0) {
        ziel.drawText(winAnsi(beschriftung), {
          x: RAND,
          y,
          size: 9,
          font: normal,
          color: FARBE.gedaempft,
        });
      }
      ziel.drawText(zeile, { x: WERT_X, y, size: 10, font: fett, color: FARBE.text });
    });
  }

  linie(16);
  luft(22);

  /* -- Ergebnis --------------------------------------------------------- */

  const band = BAENDER[daten.auswertung.band];
  const ziel = platz(46);
  y -= 40;
  ziel.drawText(`${daten.auswertung.prozent}`, {
    x: RAND,
    y,
    size: 40,
    font: fett,
    color: FARBE.text,
  });
  const zahlBreite = fett.widthOfTextAtSize(`${daten.auswertung.prozent}`, 40);
  ziel.drawText("von 100", {
    x: RAND + zahlBreite + 10,
    y: y + 4,
    size: 10,
    font: normal,
    color: FARBE.gedaempft,
  });
  ziel.drawText(winAnsi(band.label.toUpperCase()), {
    x: RAND + zahlBreite + 10,
    y: y + 20,
    size: 10,
    font: fett,
    color:
      daten.auswertung.band === "solid" ? FARBE.erfuellt
      : daten.auswertung.band === "partial" ? FARBE.unklar
      : FARBE.offen,
  });

  luft(18);
  text(band.headline, { groesse: 14, font: fett });
  luft(6);
  text(band.body, { groesse: 10, farbe: FARBE.gedaempft, abstand: 1.5 });

  luft(8);
  const zaehlung = (["yes", "unsure", "no"] as Antwort[])
    .map((wert) => {
      const anzahl = daten.antworten.filter((a) => a === wert).length;
      return anzahl > 0 ? `${anzahl}x ${ANTWORT_LABEL[wert]}` : null;
    })
    .filter(Boolean)
    .join("   ·   ");
  text(`${zaehlung}   ·   ${MAX_PUNKTE} erreichbare Punkte`, { groesse: 9, farbe: FARBE.gedaempft });

  linie(18);
  luft(24);

  /* -- Die acht Antworten ------------------------------------------------ */

  text("Alle acht Punkte im Einzelnen", { groesse: 12, font: fett });
  luft(12);

  FRAGEN.forEach((frage, i) => {
    const antwort = daten.antworten[i] ?? "no";
    /* Kopfzeile und erste Textzeile duerfen nicht getrennt umbrechen. */
    platz(46);
    luft(4);

    const zeile = platz(14);
    y -= 14;
    zeile.drawText(winAnsi(`${i + 1}. ${frage.label}`), {
      x: RAND,
      y,
      size: 10.5,
      font: fett,
      color: FARBE.text,
    });
    const status = winAnsi(ANTWORT_LABEL[antwort]);
    zeile.drawText(status, {
      x: RAND + SPALTE - normal.widthOfTextAtSize(status, 10),
      y,
      size: 10,
      font: fett,
      color: ANTWORT_FARBE[antwort],
    });
    if (frage.weight === 2) {
      zeile.drawText("Kernpflicht", {
        x: RAND + SPALTE - 118,
        y,
        size: 8,
        font: normal,
        color: FARBE.gedaempft,
      });
    }

    luft(3);
    text(frage.text, { groesse: 9.5, abstand: 1.4 });
    luft(2);
    text(frage.note, { groesse: 8.5, farbe: FARBE.gedaempft, abstand: 1.4 });
    luft(6);
  });

  /* -- Was zuerst ansteht ------------------------------------------------ */

  const todo = [...daten.auswertung.offen, ...daten.auswertung.unklar].sort((a, b) => a - b);
  if (todo.length > 0) {
    linie(14);
    luft(22);
    text(todo.length === 1 ? "Ein offener Punkt" : `${todo.length} offene Punkte`, {
      groesse: 12,
      font: fett,
    });
    luft(10);
    text(
      todo.map((i) => `${FRAGEN[i].label} (${ANTWORT_LABEL[daten.antworten[i] ?? "no"]})`).join(", "),
      { groesse: 10, abstand: 1.5 }
    );
  }

  /* -- Fusszeile auf jeder Seite ----------------------------------------- */

  const hinweis = winAnsi(
    "Orientierung auf Basis der Angaben des Ausfüllenden, keine Rechtsberatung und keine Aussage " +
      "über die Rechtskonformität im Einzelfall."
  );
  const seiten = dokument.getPages();
  seiten.forEach((blatt, i) => {
    blatt.drawLine({
      start: { x: RAND, y: 52 },
      end: { x: RAND + SPALTE, y: 52 },
      thickness: 0.75,
      color: FARBE.linie,
    });
    for (const [versatz, zeile] of umbrechen(hinweis, normal, 7.5, SPALTE - 60).entries()) {
      blatt.drawText(zeile, {
        x: RAND,
        y: 38 - versatz * 10,
        size: 7.5,
        font: normal,
        color: FARBE.gedaempft,
      });
    }
    const nummer = `${i + 1} / ${seiten.length}`;
    blatt.drawText(nummer, {
      x: RAND + SPALTE - normal.widthOfTextAtSize(nummer, 8),
      y: 38,
      size: 8,
      font: normal,
      color: FARBE.gedaempft,
    });
  });

  return dokument.save();
}
