/**
 * Das Angebot, auf das jeder Knopf der Website führt — der Lead-Magnet.
 *
 * **Eine Quelle für alle Stellen.** Vorher stand „Kostenloses Erstgespräch"
 * an 31 Stellen im Code, verteilt über 25 Dateien: in Knopfbeschriftungen, in
 * Fließtexten, in JSON-LD, in Stellenanzeigen. Wer das Angebot ändern wollte,
 * musste sie alle finden. Ab jetzt steht hier, was angeboten wird, und die
 * Seiten holen es sich.
 *
 * Stand 12.08.2026: aus dem 30-minütigen Erstgespräch ist der **1:1-KI-Check**
 * geworden. Der Name ist auf Ansage gewählt worden — "1:1" gehört hinein, weil
 * genau das den Unterschied zu einem Webinar oder einer Sprechstunde ausmacht.
 *
 * **Stand 14.08.2026: wieder eine halbe Stunde** ("die Meetings bei
 * /lass-uns-reden auf halbe Stunde begrenzen"). Die Dauer steht an *einer*
 * Stelle — `dauer` — und wird von Hero, Popup, Terminseite und Selbstcheck
 * gelesen.
 *
 * ⚠️ **Calendly muss dazu passen.** Der Termintyp unter
 * `calendly.com/kitech-software/roi-analyse` ist in Calendly selbst auf 30
 * Minuten zu stellen; das kann diese Datei nicht. Steht dort weiter eine
 * Stunde, widerspricht die Buchungsstrecke der Angabe auf der Seite.
 *
 * ## Die Verknappung ist raus (11.09.2026, auf Ansage)
 *
 * Bis hierher trug jeder Knopf, der Ankündigungsbalken, das Popup und die
 * Terminseite eine Platzangabe: „Jeden Donnerstag 5 Plätze — diese Woche noch
 * 2 Plätze frei", kurz „Donnerstags — noch 2 von 5 Plätzen". Sie kam aus drei
 * Konstanten und zwei Formatierungsfunktionen, die genau hier standen.
 *
 * Ansage Ayham: „Das kann weg. Das zieht nicht." Übrig bleibt `konditionen()` —
 * kostenlos und die Dauer, beides nachprüfbar.
 *
 * **Der Betriebsfakt bleibt wahr, er wird nur nicht mehr beworben:** Die Checks
 * finden donnerstags statt, fünf pro Woche, so ist Calendly eingestellt. Wer
 * die Angabe zurückholen will, holt damit auch ihre Auflage zurück — eine
 * dauerhaft gleiche Restzahl ist eine Tatsachenbehauptung über die
 * Verfügbarkeit und fällt, wenn sie nicht stimmt, unter Anhang zu § 3 Abs. 3
 * UWG Nr. 7 (ohne Interessenabwägung).
 *
 * ⚠️ Ein Artikel unter `/gratis-wissen` beschreibt den Ablauf weiterhin mit
 * Donnerstag und fünf Plätzen — dort als Beschreibung, nicht als Druckmittel.
 * Wer den Tag oder die Zahl ändert, ändert ihn auch dort.
 */

export interface Angebot {
  /** Kurzname für Knöpfe und Navigation. */
  kurz: string;
  /** Vollständiger Name für Überschriften und Metadaten. */
  name: string;
  /** Ein Satz, was in der halben Stunde passiert. */
  beschreibung: string;
  /** Dauer als fertiger String. */
  dauer: string;
  /** Beschriftung des Haupt-Knopfes. */
  cta: string;
  /** Zielseite. */
  href: string;
}

export const angebot: Angebot = {
  kurz: "1:1-KI-Check",
  name: "Dein 1:1-KI-Check",
  beschreibung:
    "Eine halbe Stunde mit mir, allein auf dein Unternehmen: Wir gehen deine KI- und Automatisierungsaufstellung durch — was läuft, was fehlt, was sich zuerst lohnt.",
  dauer: "30 Minuten",
  cta: "Kostenlosen 1:1-KI-Check sichern",
  href: "/lass-uns-reden",
};

/**
 * Die Zeile unter dem Knopf: was es kostet und wie lange es dauert.
 *
 * Steht überall dort, wo bis zum 11.09.2026 die Platzangabe stand — unter dem
 * Hero-Knopf, im Popup, im Abschlussblock der Startseite, im CTA-Banner jeder
 * Unterseite und auf der Terminseite. Beide Angaben sind nachprüfbar: die
 * Buchungsstrecke verlangt nichts, und die Dauer steht in Calendly.
 */
export const konditionen = (): string => `Kostenlos · ${angebot.dauer}`;
