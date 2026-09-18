import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { PDFDocument } from "pdf-lib";
import { ohneKommentare } from "./quelltext";
import { FRAGEN, MAX_PUNKTE, werteAus, type Antwort } from "../../data/selbstcheck";
import { erzeugeSelbstcheckPdf } from "../selbstcheck-pdf";

/**
 * Der Selbstcheck schickt seine Auswertung seit dem 18.09.2026 als PDF an ein
 * internes Postfach — und zeigt sie dem Ausfüllenden **nicht** mehr an.
 *
 * Das ist der Grund für diese Datei. Solange das Ergebnis auf dem Bildschirm
 * stand, korrigierte sich ein Fehler von selbst: Wer 100 von 100 erreicht und
 * „Kritisch“ liest, meldet sich. Jetzt sieht die Zahl zuerst jemand, der die
 * Antworten nicht kennt, und ein verschobener Index oder eine kaputte
 * Auswertung fiele niemandem mehr auf.
 */

const ALLE_JA: Antwort[] = FRAGEN.map(() => "yes");
const ALLE_NEIN: Antwort[] = FRAGEN.map(() => "no");

describe("Auswertung", () => {
  it("rechnet die Ränder korrekt", () => {
    expect(werteAus(ALLE_JA)).toMatchObject({ prozent: 100, band: "solid", offen: [], unklar: [] });
    expect(werteAus(ALLE_NEIN)).toMatchObject({ prozent: 0, band: "critical" });
    expect(werteAus(ALLE_NEIN).offen).toHaveLength(FRAGEN.length);
  });

  it("zählt „Weiß ich nicht“ als Lücke, nicht als Punkt", () => {
    const unsicher: Antwort[] = FRAGEN.map(() => "unsure");
    const ergebnis = werteAus(unsicher);
    expect(ergebnis.prozent).toBe(0);
    expect(ergebnis.unklar).toHaveLength(FRAGEN.length);
    expect(ergebnis.offen).toEqual([]);
  });

  it("stuft nur ohne offenen Punkt als tragfähig ein", () => {
    /* Eine einzelne Kernpflicht auf „Nein“ kostet zwei von zwölf Punkten —
       83 % liegen unter der Schwelle, und `offen` ist nicht leer. */
    const fastAlles: Antwort[] = [...ALLE_JA];
    fastAlles[0] = "no";
    expect(werteAus(fastAlles).band).not.toBe("solid");
  });

  it("behandelt eine fehlende Antwort wie „Nein“, statt NaN zu liefern", () => {
    const ergebnis = werteAus([undefined, ...ALLE_JA.slice(1)]);
    expect(Number.isFinite(ergebnis.prozent)).toBe(true);
    expect(ergebnis.offen).toContain(0);
  });

  it("hält die Gewichtung im Rahmen", () => {
    expect(MAX_PUNKTE).toBe(FRAGEN.reduce((summe, frage) => summe + frage.weight, 0));
    expect(FRAGEN.every((frage) => frage.weight === 1 || frage.weight === 2)).toBe(true);
  });
});

describe("Fragen als Datenvertrag", () => {
  /**
   * ⚠️ Der Client schickt nur eine Liste von Antworten, kein Frage-Label. Wer
   * eine Frage einschiebt oder umstellt, verschiebt die Zuordnung in jeder PDF,
   * die danach entsteht — und niemand sieht es, weil der Ausfüllende sein
   * Ergebnis nicht mehr zu Gesicht bekommt. Neue Fragen gehören ans Ende.
   */
  it("trägt die acht bekannten Punkte in unveränderter Reihenfolge", () => {
    expect(FRAGEN.map((frage) => frage.label)).toEqual([
      "KI-Kompetenz",
      "Nachweise",
      "Richtlinie",
      "Inventar",
      "Vertraulichkeit",
      "Verbotene Praktiken",
      "Transparenz",
      "Aktualität",
    ]);
  });

  it("hat zu jeder Frage einen Text und eine Fundstelle", () => {
    for (const frage of FRAGEN) {
      expect(frage.text.length).toBeGreaterThan(20);
      expect(frage.note.length).toBeGreaterThan(20);
    }
  });
});

describe("PDF", () => {
  const basis = {
    name: "Änne Müller",
    firma: "Mustermann & Söhne GmbH",
    email: "aenne@example.de",
    zeitpunkt: new Date("2026-09-18T09:41:00+02:00"),
  };

  it("entsteht für jedes Band und ist ein lesbares PDF", async () => {
    for (const antworten of [ALLE_JA, ALLE_NEIN]) {
      const bytes = await erzeugeSelbstcheckPdf({
        ...basis,
        antworten,
        auswertung: werteAus(antworten),
      });
      expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe("%PDF-");
      const geladen = await PDFDocument.load(bytes);
      expect(geladen.getPageCount()).toBeGreaterThanOrEqual(1);
    }
  });

  /**
   * Die Standardschriften können nur WinAnsi, und `pdf-lib` **wirft** bei einem
   * Zeichen ausserhalb davon. Firmenname und Name sind fremde Eingabe: Ein
   * Emoji in der Signatur eines Interessenten würde sonst den Versand
   * abbrechen — und mit ihm den einzigen Weg, auf dem seine Antworten ankommen.
   */
  it("verträgt Zeichen, die keine Standardschrift setzen kann", async () => {
    const antworten = ALLE_JA;
    const bytes = await erzeugeSelbstcheckPdf({
      ...basis,
      name: "Θεοδώρα 🙂 Şahin",
      firma: "株式会社テスト ✓ GmbH",
      antworten,
      auswertung: werteAus(antworten),
      herkunft: "example.com/ü?x=1 · utm_campaign=🚀",
    });
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe("%PDF-");
  });
});

describe("Versandweg", () => {
  /**
   * ⚠️ `/api/ereignis` antwortet bei jedem Fehlschlag mit 204, weil dort nur
   * eine Benachrichtigung verloren geht. Hier ist die Mail das einzige
   * Exemplar der Antworten. Eine Route, die „gesendet“ meldet, ohne gesendet
   * zu haben, verliert einen Interessenten lautlos — genau der Fehler, der
   * schon zweimal Tage gekostet hat.
   */
  it("meldet Fehlschläge, statt sie zu verschlucken", () => {
    const quelle = ohneKommentare(readFileSync("src/app/api/selbstcheck/route.ts", "utf-8"));
    expect(quelle).toMatch(/status:\s*503/);
    expect(quelle).toMatch(/status:\s*502/);
    expect(quelle).not.toMatch(/status:\s*204/);
  });

  it("schickt an die festgelegte Adresse, solange nichts anderes gesetzt ist", () => {
    const quelle = readFileSync("src/app/api/selbstcheck/route.ts", "utf-8");
    expect(quelle).toContain("joerg.kratzat@kitech-software.de");
    expect(quelle).toContain("SELBSTCHECK_MAIL_AN");
  });

  it("hält die Zugangsdaten aus dem Client-Bündel heraus", () => {
    const graph = ohneKommentare(readFileSync("src/lib/graph-mail.ts", "utf-8"));
    expect(graph).not.toMatch(/NEXT_PUBLIC_/);
    const view = ohneKommentare(readFileSync("src/views/EuAiActSelbstcheck.tsx", "utf-8"));
    expect(view).not.toMatch(/AZURE_|MAIL_VON|graph\.microsoft\.com/);
  });
});

describe("Was die Seite verspricht", () => {
  /**
   * Die Zusagen „nichts wird übertragen“ und „die Auswertung sehen Sie sofort
   * auf dieser Seite" standen wörtlich in der View, solange der Check im
   * Browser blieb. Seit dem Versand sind sie die Unwahrheit — auf der Seite,
   * die Sorgfalt im Umgang mit Regeln verkauft.
   */
  const view = ohneKommentare(readFileSync("src/views/EuAiActSelbstcheck.tsx", "utf-8"));

  it("verspricht keine Auswertung auf dem Bildschirm mehr", () => {
    expect(view).not.toMatch(/sehen Sie sofort auf dieser Seite/);
    expect(view).not.toMatch(/Ergebnis direkt im Anschluss/);
    expect(view).not.toMatch(/kein Datenversand/);
    expect(view).not.toMatch(/Antworten bleiben in Ihrem Browser/);
  });

  it("sagt vor dem ersten Klick, dass das Ergebnis nicht angezeigt wird", () => {
    const intro = view.slice(view.indexOf("function Intro"), view.indexOf("function Fragen"));
    expect(intro).toMatch(/sehen Sie sie nicht/);
  });

  it("holt die Einwilligung ein und verlinkt den Datenschutz", () => {
    expect(view).toContain('href="/datenschutz"');
    expect(view).toMatch(/einverstanden/);
  });

  it("wird vom Datenschutz gedeckt", () => {
    const datenschutz = readFileSync("src/views/Datenschutz.tsx", "utf-8");
    expect(datenschutz).toMatch(/Selbstcheck/);
    expect(datenschutz).toMatch(/Art\. 6 Abs\. 1 lit\. a DSGVO/);
    /* Der auffälligste Teil der Ansage gehört ausdrücklich in die Erklärung. */
    expect(datenschutz).toMatch(/nicht\s*\n?\s*angezeigt|nicht angezeigt/);
  });
});
