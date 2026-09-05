import { angebot } from "@/config/angebot";

/**
 * Der Abschlussblock der Startseite — unter der FAQ.
 *
 * **Auf Ansage (17.08.2026):** „Mach unter den FAQ noch so einen coolen Bereich,
 * überleg dir was richtig geiles salestechnisch."
 *
 * **Was hier vorher fehlte:** Die Startseite endete nach der FAQ und ging direkt
 * in die Fußzeile — ohne einen einzigen Aufruf. Der letzte Knopf stand im Hero,
 * fünf Bildschirme weiter oben. Wer bis zur letzten Frage gelesen hatte, war der
 * am besten vorbereitete Besucher der ganzen Seite und wurde dann nicht gefragt.
 *
 * **Warum dieser Block und nicht der vorhandene `CtaBanner`:** Der Banner ist
 * eine Aussage plus Pille — richtig als Fußnote einer Unterseite, zu wenig als
 * Schluss der Startseite. Hier fehlt nicht der Knopf, sondern die Antwort auf
 * die Frage, die nach der FAQ übrig bleibt: was passiert in dieser halben
 * Stunde eigentlich, und was habe ich davon, wenn nichts daraus wird?
 *
 * Drei Entscheidungen tragen den Block:
 *
 *   1. **Die Überschrift löst den Hero ein.** Oben steht „Falsche KI kostet mehr
 *      als keine KI." Unten steht die Gegenrechnung dazu — dieselbe Aussage, nur
 *      als Preisvergleich. Deshalb steht die Dauer aus `angebot.ts` darin und
 *      keine ausgeschriebene Zahl: ändert sich das Angebot, ändert sich der Satz
 *      mit.
 *   2. **Der Ablauf steht sichtbar da.** Wer nicht klickt, hat oft keinen
 *      Einwand, sondern eine Unklarheit: „Was will der von mir?" Drei Zeilen
 *      lösen das billiger als jedes Argument.
 *   3. **Schritt 3 ist das eigentliche Angebot** und wörtlich von Ayham
 *      (`src/data/call-popup.ts`): „ich geb dir sofort drei, vier Tipps
 *      kostenlos zum Mitnehmen." Dieses Versprechen stand bisher **nur im
 *      Popup** — wer es wegklickt oder nie zu sehen bekommt, erfuhr auf der
 *      ganzen Seite nicht, dass er auch ohne Zusammenarbeit etwas mitnimmt.
 *      Genau dieser Satz macht den Termin billig. Nicht streichen.
 *
 * **Belegbasis** — hier steht nichts, was das Repo nicht hergibt:
 *
 *   | Aussage | Beleg |
 *   |---|---|
 *   | Dauer, kostenlos, Verknappung | `src/config/angebot.ts` |
 *   | „drei bis vier Tipps zum Mitnehmen" | `src/data/call-popup.ts` (Ayham, wörtlich) |
 *   | „wo es sich lohnt — und wo nicht" | `src/data/faq.ts`, `src/data/principles.ts` |
 *   | „kein Verkaufsgespräch, keine Präsentation" | `src/data/segments.ts` |
 *
 * ⚠️ **Keine Garantie, kein Countdown, keine neue Zahl.** Die ROI-Garantie ist
 * am 12.08.2026 von der ganzen Website genommen worden; ein Abschlussblock ist
 * die Stelle, an der sie am ehesten wieder hineinrutscht. Und die
 * Verknappungszeile kommt aus `angebot.ts` — sie wird hier nicht verschärft.
 */

export interface CheckSchritt {
  /** Kurz, in Ich-/Du-Form. Die Nummer setzt die Komponente. */
  titel: string;
  text: string;
}

export interface CheckEinladung {
  /**
   * Die H2. Zweiteilig gedacht: erst was eine Fehlentscheidung kostet, dann was
   * das hier kostet. Die Asymmetrie ist das ganze Argument.
   *
   * Die Dauer kommt aus `angebot.ts` — die Zahl steht nirgends doppelt.
   */
  ueberschrift: string;
  /** Der Ablauf. Drei Zeilen, nicht vier — die vierte liest keiner mehr. */
  schritte: CheckSchritt[];
  /** Steht klein unter dem Knopf. Räumt die letzten zwei Befürchtungen ab. */
  fussnote: string;
}

export const checkEinladung: CheckEinladung = {
  ueberschrift: `Eine falsche Entscheidung merkst du nach Monaten. Das hier dauert ${angebot.dauer}.`,

  schritte: [
    {
      titel: "Du erzählst",
      text: "Wie deine Abläufe heute laufen, womit du arbeitest, was dich aufhält.",
    },
    {
      titel: "Ich ordne es ein",
      text: "Wo sich Automatisierung rechnet — und wo eine einfachere Lösung reicht.",
    },
    {
      titel: "Du nimmst etwas mit",
      text: "Drei bis vier konkrete Tipps. Auch wenn wir nie zusammenarbeiten.",
    },
  ],

  fussnote: "Kostenlos. Kein Verkaufsgespräch, keine Präsentation.",
};
