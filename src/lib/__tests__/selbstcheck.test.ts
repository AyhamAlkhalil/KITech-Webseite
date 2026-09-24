import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
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
   * Zeichen ausserhalb davon. Referrer und Kampagnenkennung sind fremde
   * Eingabe: Ein Emoji in einer UTM-Kennung würde sonst den Versand abbrechen
   * — und mit ihm den einzigen Weg, auf dem die Antworten ankommen.
   */
  it("verträgt Zeichen, die keine Standardschrift setzen kann", async () => {
    const antworten = ALLE_JA;
    const bytes = await erzeugeSelbstcheckPdf({
      ...basis,
      antworten,
      auswertung: werteAus(antworten),
      herkunft: "example.com/ü?x=Θεοδώρα · utm_campaign=🚀株式会社✓",
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

  it("lässt den Empfänger ohne Deploy ändern", () => {
    const quelle = readFileSync("src/app/api/selbstcheck/route.ts", "utf-8");
    expect(quelle).toContain("SELBSTCHECK_MAIL_AN");
  });

  /**
   * Name und Unternehmen sind seit dem 24.09.2026 Pflicht („wir wissen nicht
   * wer den Selbstcheck macht"), eine E-Mail-Adresse bleibt draußen. Wer das
   * dritte Feld ergänzt, ergänzt auch den Datenschutztext und die Frage, ob
   * die Seite dann eine Rückmeldung verspricht.
   */
  it("verlangt Name und Unternehmen, aber keine E-Mail-Adresse", () => {
    const quelle = ohneKommentare(readFileSync("src/app/api/selbstcheck/route.ts", "utf-8"));
    expect(quelle).toMatch(/name:\s*z\.string\(\)/);
    expect(quelle).toMatch(/firma:\s*z\.string\(\)/);
    expect(quelle).not.toMatch(/\bemail\s*:/);
    expect(quelle).not.toMatch(/antwortAn/);
  });

  /**
   * ⚠️ Beide Adressen zusammen sind die Lehre aus dem 18.–22.09.2026: Graph
   * nahm drei Auswertungen an, zugestellt wurde keine, und es gab keine
   * Unzustellbarkeitsmeldung. `jk@sipenti.de` liegt außerhalb des Mandanten
   * und hängt deshalb nicht an derselben Störung.
   */
  it("schickt an zwei Empfänger über zwei Wege", async () => {
    const { STANDARD_EMPFAENGER, empfaengerAus } = await import("../selbstcheck-empfaenger");
    expect([...STANDARD_EMPFAENGER]).toEqual([
      "joerg.kratzat@kitech-software.de",
      "jk@sipenti.de",
    ]);
    /* ⚠️ Der Standard sind zwei Adressen. Wird er nicht am Komma geteilt,
       entsteht daraus eine einzige, ungültige Adresse — und nichts kommt an. */
    expect(empfaengerAus(undefined)).toHaveLength(2);
    expect(empfaengerAus("")).toEqual([...STANDARD_EMPFAENGER]);
    expect(empfaengerAus("  ,  , ")).toEqual([...STANDARD_EMPFAENGER]);
    expect(empfaengerAus("kein-at-zeichen")).toEqual([...STANDARD_EMPFAENGER]);
    expect(empfaengerAus(" a@b.de , c@d.de ")).toEqual(["a@b.de", "c@d.de"]);
    for (const adresse of empfaengerAus(undefined)) expect(adresse).toContain("@");
  });

  it("legt eine Kopie im Gesendet-Ordner ab", () => {
    const graph = ohneKommentare(readFileSync("src/lib/graph-mail.ts", "utf-8"));
    expect(graph).toMatch(/saveToSentItems:\s*true/);
  });

  it("hält die Zugangsdaten aus dem Client-Bündel heraus", () => {
    const graph = ohneKommentare(readFileSync("src/lib/graph-mail.ts", "utf-8"));
    expect(graph).not.toMatch(/NEXT_PUBLIC_/);
    const view = ohneKommentare(readFileSync("src/views/EuAiActSelbstcheck.tsx", "utf-8"));
    expect(view).not.toMatch(/AZURE_|MAIL_VON|graph\.microsoft\.com/);
  });
});

describe("Wer die Ergebnisse bekommt", () => {
  /**
   * Die Bestätigung nennt Jörg und zeigt sein Foto; die Mail geht an ihn.
   * Beides muss dieselbe Person bleiben — und das Foto muss es geben, sonst
   * entfällt der Block still (`BERATER?.photo`).
   */
  it("findet Jörg samt Foto im Team und schickt die Mail an ihn", async () => {
    const { teamRoster } = await import("../../data/team");
    const berater = teamRoster.find((m) => m.name === "Jörg Kratzat");
    expect(berater?.photo).toBeTruthy();
    expect(existsSync(`public${berater!.photo}`)).toBe(true);

    const { STANDARD_EMPFAENGER } = await import("../selbstcheck-empfaenger");
    expect(STANDARD_EMPFAENGER).toContain("joerg.kratzat@kitech-software.de");
  });
});

describe("Was die Seite verspricht", () => {
  /**
   * Die Zusagen „nichts wird übertragen“ und „die Auswertung sehen Sie sofort
   * auf dieser Seite" standen wörtlich in der View, solange der Check im
   * Browser blieb. Seit dem Versand sind sie die Unwahrheit — auf der Seite,
   * die Sorgfalt im Umgang mit Regeln verkauft. Dasselbe gilt für jede Zusage
   * einer Rückmeldung: Ohne Kontaktdaten kann sich niemand melden.
   */
  const view = ohneKommentare(readFileSync("src/views/EuAiActSelbstcheck.tsx", "utf-8"));

  it("verspricht keine Auswertung auf dem Bildschirm mehr", () => {
    expect(view).not.toMatch(/sehen Sie sofort auf dieser Seite/);
    expect(view).not.toMatch(/Ergebnis direkt im Anschluss/);
    expect(view).not.toMatch(/kein Datenversand/);
    expect(view).not.toMatch(/Antworten bleiben in Ihrem Browser/);
  });

  it("verspricht keine Rückmeldung, die ohne Adresse nicht kommen kann", () => {
    expect(view).not.toMatch(/melden uns (per E-Mail|bei Ihnen)/);
    expect(view).not.toMatch(/Auswertung kommt von uns/);
  });

  it("sagt vor dem ersten Klick, dass das Ergebnis nicht angezeigt wird", () => {
    const intro = view.slice(view.indexOf("function Intro"), view.indexOf("function Fragen"));
    expect(intro).toMatch(/Auf dem Bildschirm sehen Sie sie nicht/);
    expect(intro).toMatch(/Namen und Unternehmen/);
  });

  it("fragt Name und Unternehmen ab, sonst nichts", () => {
    expect(view).toContain('id="selbstcheck-name"');
    expect(view).toContain('id="selbstcheck-firma"');
    expect(view).not.toMatch(/type="email"/);
    expect(view).not.toMatch(/selbstcheck-email/);
  });

  it("wird vom Datenschutz gedeckt", () => {
    const datenschutz = readFileSync("src/views/Datenschutz.tsx", "utf-8");
    expect(datenschutz).toMatch(/Selbstcheck/);
    expect(datenschutz).toMatch(/Art\. 6 Abs\. 1\s+lit\. b DSGVO/);
    expect(datenschutz).toMatch(/Art\. 6 Abs\. 1\s+lit\. f DSGVO/);
    expect(datenschutz).toMatch(/Namen und Unternehmen/);
    /* Der Empfänger außerhalb des Hauses gehört ausdrücklich benannt. */
    expect(datenschutz).toMatch(/Sipenti/);
    /* Der auffälligste Teil der Ansage gehört ausdrücklich in die Erklärung. */
    expect(datenschutz).toMatch(/nicht\s*\n?\s*angezeigt|nicht angezeigt/);
  });
});
