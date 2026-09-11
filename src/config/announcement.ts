import { angebot } from "./angebot";

/**
 * Inhalt des Ankuendigungsbalkens ganz oben.
 *
 * Bewusst als eigene Datei: der Balken ist die prominenteste Zeile der Seite.
 * Er wird haeufiger geaendert als alles andere und soll dafuer nicht in eine
 * Layout-Komponente hineingegriffen werden muessen.
 *
 * Steht `announcement` auf `null`, verschwindet der Balken vollstaendig — die
 * Kopfzeile rueckt dann nach oben, ohne dass sonst etwas angepasst werden muss.
 *
 * **Stand 17.08.2026: der Balken fuehrt mit einer Frage, nicht mit dem
 * Produktnamen.** Vorher stand dort "1:1-KI-Check 2026" — eine datierte
 * Ankuendigung, wie die Design-Vorlage sie loest ("2026 Scaling Workshop Dates
 * Announced"). Auf Ansage geaendert: "bitte schreib stattdessen sowas wie
 * 'find heraus …', z. B. ob du KI gut nutzt". Ein Produktname sagt jemandem,
 * der die Seite zum ersten Mal sieht, nichts; "Find heraus, ob …" gibt ihm
 * einen Grund zu klicken. Wer hier wieder den Angebotsnamen einsetzt, nimmt
 * dem Balken genau das.
 *
 * **Stand 11.09.2026: nur noch der Satz.** Dahinter stand bis dahin die
 * Platzangabe aus `angebot.ts` ("Jeden Donnerstag 5 Plätze — diese Woche noch
 * 2 Plätze frei", schmal die Kurzfassung). Ansage Ayham: „Das kann weg. Das
 * zieht nicht. Find heraus, ob du KI richtig nutzt, mehr nicht."
 *
 * Der Balken traegt seither **eine** Aussage und den Pfeil. Wer hier wieder
 * einen Nachsatz einzieht, teilt die Aufmerksamkeit der Zeile, die als erstes
 * gelesen wird — und wenn der Nachsatz eine Verfuegbarkeit behauptet, gilt
 * wieder die Auflage aus `angebot.ts`: Sie muss mit dem Kalender
 * uebereinstimmen (Anhang zu § 3 Abs. 3 UWG Nr. 7).
 */
export interface Announcement {
  /** Kurzes Label in der weissen Pille, z. B. "NEU". Optional. */
  badge?: string;
  /**
   * Die ganze Zeile. Ohne Satzzeichen am Ende — dahinter kommt der Pfeil.
   *
   * ⚠️ Frueher war das nur der fette Teil vor einem Doppelpunkt, und der
   * Nachsatz stand in `text`/`textKurz`. Beide Felder sind am 11.09.2026
   * entfallen; der Doppelpunkt in der Komponente mit ihnen.
   */
  lead: string;
  href: string;
}

export const announcement: Announcement | null = {
  /* **Kein Badge.** "NEU" kuendigte das Produkt an ("NEU: 1:1-KI-Check
     2026") — vor einer Aufforderung liest es sich schief, und auf dem Handy
     kostete es die entscheidenden 52 px: mit Badge lief die Zeile auf drei
     Zeilen aus (108 px), ohne bleibt der Balken bei den vorgesehenen zwei
     (87 px, bei 360 px gemessen). Wer ihn zurueckholen will, setzt hier
     `badge: "NEU"` und sieht sich den Balken bei 360 px an. */
  /* "richtig" statt "gut" greift die Hero-Aussage auf ("Falsche KI kostet mehr
     als keine KI") — Balken und Hero sagen dann dasselbe, einmal als Frage und
     einmal als Behauptung. Wer lieber die woertliche Fassung will: "gut" hier
     einsetzen, sonst aendert sich nichts. */
  lead: "Find heraus, ob du KI richtig nutzt",
  href: angebot.href,
};
