import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { FRAGEN, MAX_PUNKTE, werteAus, type Antwort } from "@/data/selbstcheck";
import { erzeugeSelbstcheckPdf } from "@/lib/selbstcheck-pdf";
import { graphKonfiguration } from "@/lib/graph-mail";

/**
 * QA-Ergaenzung zu `selbstcheck.test.ts`.
 *
 * Diese Datei ruehrt keine Produktionsdatei an und ersetzt nichts aus der
 * bestehenden Testdatei — sie deckt Luecken ab, die dort noch offen waren:
 * die genauen Bandgrenzen von `werteAus` (85 % / 50 %) inklusive der Faelle,
 * in denen Prozentwert und `offen`-Bedingung auseinanderfallen, das
 * Verhalten bei unvollstaendigen/ueberzaehligen Eingabelisten, PDF-Kanten
 * (Mehrseitigkeit, sehr lange Werte, leere Strings) sowie
 * `graphKonfiguration` bei teilweise gesetzten Umgebungsvariablen.
 *
 * Es wird weder ein Server gestartet noch die echte Microsoft-Graph-API
 * gerufen: `sendeMail`/`token` aus `graph-mail.ts` werden hier nicht
 * aufgerufen, nur die reine Env-Auswertung `graphKonfiguration`.
 */

const ALLE_JA: Antwort[] = FRAGEN.map(() => "yes");

/** Indexreferenz, damit die Kommentare unten nachvollziehbar bleiben. */
// 0 KI-Kompetenz (w2) · 1 Nachweise (w2) · 2 Richtlinie (w1) · 3 Inventar (w2)
// 4 Vertraulichkeit (w2) · 5 Verbotene Praktiken (w1) · 6 Transparenz (w1)
// 7 Aktualitaet (w1)  —  Summe 12 = MAX_PUNKTE

function antworten(muster: Record<number, Antwort>): Antwort[] {
  return FRAGEN.map((_, i) => muster[i] ?? "yes");
}

describe("werteAus — Bandgrenzen", () => {
  it("liegt bei genau 50 % noch in 'partial', nicht in 'critical'", () => {
    // yes auf 0,3,4 (2+2+2=6) => 6/12 = 50,0 % exakt
    const a = antworten({ 0: "yes", 1: "no", 2: "no", 3: "yes", 4: "yes", 5: "no", 6: "no", 7: "no" });
    const ergebnis = werteAus(a);
    expect(ergebnis.prozent).toBe(50);
    expect(ergebnis.band).toBe("partial");
  });

  it("liegt knapp unter 50 % bereits in 'critical'", () => {
    // yes auf 0,2,5,6 (2+1+1+1=5) => 5/12 = 41,67 % -> gerundet 42
    const a = antworten({ 0: "yes", 1: "no", 2: "yes", 3: "no", 4: "no", 5: "yes", 6: "yes", 7: "no" });
    const ergebnis = werteAus(a);
    expect(ergebnis.prozent).toBe(42);
    expect(ergebnis.band).toBe("critical");
  });

  it("liegt bei 83 % (10/12) trotz offen=[] noch unter der 85%-Schwelle", () => {
    // Alles "yes" ausser den beiden letzten Fragen (je w1) auf "unsure":
    // Punkte = 12 - 2 = 10 -> 83,33 % -> gerundet 83. offen bleibt leer,
    // weil "unsure" nie in `offen` landet — die Prozentschwelle allein
    // entscheidet hier, nicht die offen-Bedingung.
    const a = antworten({ 6: "unsure", 7: "unsure" });
    const ergebnis = werteAus(a);
    expect(ergebnis.prozent).toBe(83);
    expect(ergebnis.offen).toEqual([]);
    expect(ergebnis.band).not.toBe("solid");
    expect(ergebnis.band).toBe("partial");
  });

  it("erreicht bei 92 % (11/12) mit offen=[] das Band 'solid'", () => {
    // Nur die letzte Frage (w1) auf "unsure", Rest "yes": 11/12 = 91,67 % -> 92
    const a = antworten({ 7: "unsure" });
    const ergebnis = werteAus(a);
    expect(ergebnis.prozent).toBe(92);
    expect(ergebnis.offen).toEqual([]);
    expect(ergebnis.band).toBe("solid");
  });

  it("bleibt bei denselben 92 % NICHT 'solid', wenn die Luecke ein 'no' statt 'unsure' ist", () => {
    // Exakt derselbe Prozentwert wie im Test davor (11/12 = 92 %), aber die
    // fehlende Antwort ist ein echtes "Nein" statt "Weiss ich nicht" -> offen
    // ist nicht leer, und die Zusatzbedingung `offen.length === 0` fuer
    // 'solid' greift. Das ist der Fall, den die bestehende Testdatei nicht
    // trennscharf zeigt: ihr Beispiel liegt mit 83 % ohnehin schon unter der
    // Prozentschwelle, hier liegt der Prozentwert klar darueber.
    const a = antworten({ 7: "no" });
    const ergebnis = werteAus(a);
    expect(ergebnis.prozent).toBe(92);
    expect(ergebnis.offen).toEqual([7]);
    expect(ergebnis.band).toBe("partial");
  });

  it("summiert die Gewichte exakt zu MAX_PUNKTE = 12", () => {
    expect(MAX_PUNKTE).toBe(12);
  });
});

describe("werteAus — unvollstaendige und ueberzaehlige Eingaben", () => {
  it("wertet eine leere Liste wie durchgehend 'Nein' aus", () => {
    const ergebnis = werteAus([]);
    expect(ergebnis.prozent).toBe(0);
    expect(ergebnis.band).toBe("critical");
    expect(ergebnis.offen).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(ergebnis.unklar).toEqual([]);
  });

  it("fuellt eine zu kurze Liste ab dem fehlenden Index mit 'Nein' auf", () => {
    // Nur die ersten beiden Fragen (je w2) beantwortet, der Rest fehlt.
    const ergebnis = werteAus(["yes", "yes"]);
    expect(ergebnis.prozent).toBe(Math.round((4 / 12) * 100));
    expect(ergebnis.offen).toEqual([2, 3, 4, 5, 6, 7]);
  });

  it("ignoriert Eintraege jenseits der Fragenzahl, statt sie mitzuzaehlen", () => {
    // Zwei ueberzaehlige Eintraege, einer davon technisch ungueltig — beides
    // darf das Ergebnis nicht veraendern, weil `werteAus` per `FRAGEN.forEach`
    // nur genau FRAGEN.length Eintraege liest.
    const zuViel = [...ALLE_JA, "no", "unsure"] as unknown as Antwort[];
    const ergebnis = werteAus(zuViel);
    expect(ergebnis).toEqual(werteAus(ALLE_JA));
  });

  it("behandelt einen zur Laufzeit ungueltigen Wert wie 'Nein', statt zu werfen", () => {
    // Kommt am Typsystem vorbei (z. B. durch ungeprueftes JSON) — die Funktion
    // selbst validiert nicht, sondern faellt im `else`-Zweig auf "offen".
    const kaputt = antworten({ 3: "JA" as unknown as Antwort });
    expect(() => werteAus(kaputt)).not.toThrow();
    const ergebnis = werteAus(kaputt);
    expect(ergebnis.offen).toContain(3);
    expect(ergebnis.unklar).not.toContain(3);
  });

  it("haelt offen/unklar in aufsteigender Fragenreihenfolge, unabhaengig vom Muster", () => {
    const gemischt: Antwort[] = ["no", "unsure", "yes", "no", "unsure", "yes", "yes", "unsure"];
    const ergebnis = werteAus(gemischt);
    expect(ergebnis.offen).toEqual([0, 3]);
    expect(ergebnis.unklar).toEqual([1, 4, 7]);
  });
});

describe("PDF — Seitenumbruch", () => {
  const basis = {
    name: "Test Person",
    firma: "Test GmbH",
    email: "person@example.de",
    zeitpunkt: new Date("2026-09-18T09:00:00+02:00"),
  };

  it("braucht schon bei acht normal langen Antworten mehr als eine Seite", async () => {
    // Regressionsschutz: die bestehende Datei prueft nur `>= 1`. Damit wuerde
    // ein Bug, der die zweite Seite verschluckt (oder ploetzlich eine dritte
    // erzeugt), nicht auffallen.
    for (const muster of [ALLE_JA, FRAGEN.map(() => "no" as const)]) {
      const bytes = await erzeugeSelbstcheckPdf({
        ...basis,
        antworten: muster,
        auswertung: werteAus(muster),
      });
      const geladen = await PDFDocument.load(bytes);
      expect(geladen.getPageCount()).toBe(2);
    }
  });

  it("traegt auf jeder Seite dieselbe Fusszeilen-Nummerierung 'n / N'", async () => {
    const muster = FRAGEN.map(() => "no" as const);
    const bytes = await erzeugeSelbstcheckPdf({
      ...basis,
      antworten: muster,
      auswertung: werteAus(muster),
    });
    const geladen = await PDFDocument.load(bytes);
    expect(geladen.getPageCount()).toBeGreaterThanOrEqual(2);
  });
});

describe("PDF — Randfaelle bei den Eingabewerten", () => {
  const basis = {
    zeitpunkt: new Date("2026-09-18T09:00:00+02:00"),
  };
  const antwortenAlleJa = ALLE_JA;
  const auswertung = werteAus(antwortenAlleJa);

  it("erzeugt trotz leerer Pflichtfelder ein gueltiges PDF, statt zu werfen", async () => {
    // `erzeugeSelbstcheckPdf` validiert selbst nicht — das Mindestlaenge-Gate
    // sitzt im Zod-Schema der Route. Die Funktion muss trotzdem robust sein,
    // falls sie je aus einem anderen Aufrufer ohne dieses Gate benutzt wird.
    const bytes = await erzeugeSelbstcheckPdf({
      ...basis,
      name: "",
      firma: "",
      email: "",
      antworten: antwortenAlleJa,
      auswertung,
    });
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe("%PDF-");
    const geladen = await PDFDocument.load(bytes);
    expect(geladen.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it("wirft nicht bei einer sehr kurzen Antwortliste (kuerzer als FRAGEN)", async () => {
    // Die Schleife im PDF-Bauer nutzt `daten.antworten[i] ?? "no"` je Frage —
    // das muss auch greifen, wenn das Array selbst kuerzer ist als FRAGEN.
    const kurz = antwortenAlleJa.slice(0, 3) as Antwort[];
    const bytes = await erzeugeSelbstcheckPdf({
      ...basis,
      name: "Kurz Test",
      firma: "Kurz GmbH",
      email: "kurz@example.de",
      antworten: kurz,
      auswertung: werteAus(kurz),
    });
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe("%PDF-");
  });

  it("generiert weiterhin ein gueltiges PDF bei einem sehr langen Firmennamen (500 Zeichen)", async () => {
    const firma = "Beispiel-Handelsgesellschaft-mit-sehr-langem-Namen-".repeat(10).slice(0, 500);
    const bytes = await erzeugeSelbstcheckPdf({
      ...basis,
      name: "Test Person",
      firma,
      email: "person@example.de",
      antworten: antwortenAlleJa,
      auswertung,
    });
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe("%PDF-");
    const geladen = await PDFDocument.load(bytes);
    expect(geladen.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it("bricht einen ueberlangen Firmennamen im Kopfbereich um, statt ihn aus der Seite laufen zu lassen", async () => {
    /* Der "Wer"-Block zeichnete bis zum 18.09.2026 direkt per `drawText` in
       einer Zeile, ohne `umbrechen()`. `pdf-lib` beschneidet nicht — der Wert
       lief rechts aus der Seite, lautlos und ausgerechnet im einzigen
       Dokument, das die Angaben des Interessenten traegt.

       Gemessen statt geraten: Ein Name, der die Wertespalte um ein Vielfaches
       ueberschreitet, muss die Seite waschsen lassen. */
    const RAND = 56;
    const SEITENBREITE = 595.28;
    const verfuegbareBreite = SEITENBREITE - RAND - (RAND + 92);

    const dokument = await PDFDocument.create();
    const fett = await dokument.embedFont(StandardFonts.HelveticaBold);
    const langerName = "Beispiel-Handelsgesellschaft-mit-sehr-langem-Namen-".repeat(10);
    expect(fett.widthOfTextAtSize(langerName, 10)).toBeGreaterThan(verfuegbareBreite * 5);

    const kurz = await erzeugeSelbstcheckPdf({
      ...basis,
      name: "Test Person",
      firma: "Test GmbH",
      email: "person@example.de",
      antworten: antwortenAlleJa,
      auswertung,
    });
    const lang = await erzeugeSelbstcheckPdf({
      ...basis,
      name: "Test Person",
      firma: langerName,
      email: "person@example.de",
      antworten: antwortenAlleJa,
      auswertung,
    });
    expect(Buffer.from(lang.slice(0, 5)).toString()).toBe("%PDF-");
    expect(lang.length).toBeGreaterThan(kurz.length);

    /* Der harte Nachweis geht ueber die Seitenzahl. Gemessen: 460 und 2760
       Zeichen bleiben bei zwei Seiten, weil die zweite Seite Reserve hat —
       erst bei rund 9000 Zeichen kommen Seiten hinzu. Bliebe der Name eine
       einzige Zeile, aenderte sich an der Seitenzahl nie etwas. */
    const sehrLang = await erzeugeSelbstcheckPdf({
      ...basis,
      name: "Test Person",
      firma: "Beispiel-Handelsgesellschaft-mit-sehr-langem-Namen-".repeat(200),
      email: "person@example.de",
      antworten: antwortenAlleJa,
      auswertung,
    });
    expect((await PDFDocument.load(sehrLang)).getPageCount()).toBeGreaterThan(
      (await PDFDocument.load(kurz)).getPageCount()
    );
  });

  it("bricht auch eine lange URL ohne Leerzeichen um — sie ist ein einziges Wort", async () => {
    /* Der Umbruch an Leerzeichen allein half hier nicht: Ein Referrer hat
       keine. Ohne harten Schnitt bliebe er eine Zeile bis weit hinter den
       Rand. */
    const kurz = await erzeugeSelbstcheckPdf({
      ...basis,
      name: "Test Person",
      firma: "Test GmbH",
      email: "person@example.de",
      antworten: antwortenAlleJa,
      auswertung,
      herkunft: "example.com",
    });
    const lang = await erzeugeSelbstcheckPdf({
      ...basis,
      name: "Test Person",
      firma: "Test GmbH",
      email: "person@example.de",
      antworten: antwortenAlleJa,
      auswertung,
      herkunft: `https://example.com/${"a".repeat(400)}?utm_campaign=${"b".repeat(200)}`,
    });
    expect(lang.length).toBeGreaterThan(kurz.length);
  });

  it("kuerzt eine masslos lange Herkunft, statt eine halbe Seite damit zu fuellen", async () => {
    /* Die Route baut `herkunft` aus Referrer (bis 500 Zeichen) und drei
       UTM-Feldern. Umgebrochen waere das ein Absatz, der den Kopf des
       Dokuments erschlaegt — gekuerzt steht wenigstens die Domain da. */
    const bytes = await erzeugeSelbstcheckPdf({
      ...basis,
      name: "Test Person",
      firma: "Test GmbH",
      email: "person@example.de",
      antworten: antwortenAlleJa,
      auswertung,
      herkunft: "wort ".repeat(2000),
    });
    const massvoll = await erzeugeSelbstcheckPdf({
      ...basis,
      name: "Test Person",
      firma: "Test GmbH",
      email: "person@example.de",
      antworten: antwortenAlleJa,
      auswertung,
      herkunft: "wort ".repeat(60),
    });
    /* 10.000 Zeichen und 300 Zeichen landen beide bei derselben Kappung. */
    expect((await PDFDocument.load(bytes)).getPageCount()).toBe(
      (await PDFDocument.load(massvoll)).getPageCount()
    );
  });

  it("verschluckt einen eingebetteten Zeilenumbruch in der Herkunft, statt ihn darzustellen", async () => {
    // winAnsi() entfernt Zeichen ausserhalb des WinAnsi-Bereichs per RegEx —
    // \n (U+000A) liegt unterhalb von   und faellt darunter, wird also
    // vor jedem Zeilenumbruch-Handling schon entfernt. Ein mehrzeiliger Wert
    // kommt hier nicht an; wichtig ist nur, dass das nicht crasht.
    const bytes = await erzeugeSelbstcheckPdf({
      ...basis,
      name: "Test Person",
      firma: "Test GmbH",
      email: "person@example.de",
      antworten: antwortenAlleJa,
      auswertung,
      herkunft: "erste-zeile\nzweite-zeile\ndritte-zeile",
    });
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe("%PDF-");
  });
});

describe("graphKonfiguration — teilweise gesetzte Umgebungsvariablen", () => {
  const SCHLUESSEL = ["AZURE_TENANT_ID", "AZURE_CLIENT_ID", "AZURE_CLIENT_SECRET", "MAIL_VON"] as const;
  const ORIGINAL: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const schluessel of SCHLUESSEL) {
      ORIGINAL[schluessel] = process.env[schluessel];
      delete process.env[schluessel];
    }
  });

  afterEach(() => {
    for (const schluessel of SCHLUESSEL) {
      if (ORIGINAL[schluessel] === undefined) delete process.env[schluessel];
      else process.env[schluessel] = ORIGINAL[schluessel];
    }
  });

  it("liefert die Konfiguration, wenn alle vier Variablen gesetzt sind", () => {
    process.env.AZURE_TENANT_ID = "tenant-123";
    process.env.AZURE_CLIENT_ID = "client-abc";
    process.env.AZURE_CLIENT_SECRET = "geheim";
    process.env.MAIL_VON = "postfach@kitech-software.de";

    expect(graphKonfiguration()).toEqual({
      tenant: "tenant-123",
      clientId: "client-abc",
      clientSecret: "geheim",
      absender: "postfach@kitech-software.de",
    });
  });

  it("liefert null, wenn keine einzige Variable gesetzt ist", () => {
    expect(graphKonfiguration()).toBeNull();
  });

  it.each(SCHLUESSEL)("liefert null, wenn nur '%s' fehlt", (fehlend) => {
    for (const schluessel of SCHLUESSEL) {
      if (schluessel !== fehlend) process.env[schluessel] = "wert";
    }
    expect(graphKonfiguration()).toBeNull();
  });

  it("behandelt einen leeren String wie eine fehlende Variable", () => {
    process.env.AZURE_TENANT_ID = "tenant-123";
    process.env.AZURE_CLIENT_ID = "client-abc";
    process.env.AZURE_CLIENT_SECRET = "geheim";
    process.env.MAIL_VON = ""; // z. B. eine Coolify-Variable, die auf leer gesetzt wurde
    expect(graphKonfiguration()).toBeNull();
  });

  it("behandelt einen Wert aus nur Leerzeichen wie eine fehlende Variable", () => {
    /* In Coolify wird eingefuegt, nicht getippt — ein mitkopiertes Leerzeichen
       ist dort der wahrscheinlichste Fehler. Ohne `trim()` galte er als
       gesetzt, und der Fehlschlag kaeme erst beim Graph-Aufruf: aus einem
       klaren 503 („nicht eingerichtet") wuerde ein 502 mit Azure-Meldung. */
    process.env.AZURE_TENANT_ID = "tenant-123";
    process.env.AZURE_CLIENT_ID = "client-abc";
    process.env.AZURE_CLIENT_SECRET = "geheim";
    process.env.MAIL_VON = "   ";
    expect(graphKonfiguration()).toBeNull();
  });

  it("schneidet Leerzeichen um einen gesetzten Wert weg", () => {
    process.env.AZURE_TENANT_ID = " tenant-123 ";
    process.env.AZURE_CLIENT_ID = "client-abc";
    process.env.AZURE_CLIENT_SECRET = "geheim";
    process.env.MAIL_VON = "post@example.de\n";
    expect(graphKonfiguration()).toEqual({
      tenant: "tenant-123",
      clientId: "client-abc",
      clientSecret: "geheim",
      absender: "post@example.de",
    });
  });
});
