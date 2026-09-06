import { company } from "@/config/company";

/**
 * Womit wir belegen, dass hier nach europäischen Regeln gearbeitet wird —
 * gezeigt von `components/sections/Konformitaet.tsx` am Seitenende.
 *
 * Angelegt am 04.09.2026 auf Ansage: „Füg noch unten irgendwo Zertifikate und
 * Siegel ein, dass wir EU-konform arbeiten."
 *
 * ## Die eine Regel: Jede Zeile hat einen Beleg auf dieser Website
 *
 * Ein Konformitätsversprechen ist eine geschäftliche Angabe wie jede andere.
 * Steht es ohne Grundlage da, ist es nach § 5 Abs. 1 UWG irreführend — und
 * ausgerechnet auf der Fläche, die Sorgfalt belegen soll, fällt das am meisten
 * auf. Deshalb trägt jeder Eintrag ein `beleg`: eine Seite, auf der dieselbe
 * Angabe ausführlich und rechtsverbindlich steht. Wer eine Zeile ergänzt, ohne
 * den Beleg vorher geschrieben zu haben, dreht die Reihenfolge um.
 *
 * ⚠️ **Was hier NICHT hingehört:** „100 % DSGVO-konform" (kein Zustand, den
 * jemand zusichern kann), „ISO-zertifiziert" ohne Zertifikat, „TÜV-geprüft"
 * ohne Prüfung — und **kein pauschales „Ihre Daten bleiben in der EU".** Das
 * wäre falsch: Die Firmenerkennung läuft über ipinfo.io auf US-Servern, auf
 * Grundlage der Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO). Die
 * Datenschutzerklärung benennt das; eine Zeile hier, die es überdeckt, wäre
 * genau der Widerspruch, den ein aufmerksamer Leser findet.
 *
 * ## Echte Siegel
 *
 * `siegel` ist die Liste der Prüfzeichen, die tatsächlich verliehen wurden —
 * Logo, Aussteller, Link zum Nachweis. Sie ist **leer**, bis Ayham die Dateien
 * liefert (angekündigt am 04.09.2026: „Die ganzen Siegel werde ich dir geben").
 * Solange sie leer ist, rendert die Komponente den Bereich gar nicht.
 *
 * Ein Siegel darf hier nur stehen, wenn es
 *   1. dieser Gesellschaft verliehen wurde — nicht einem Werkzeug, das wir
 *      einsetzen, und nicht Ayham persönlich,
 *   2. noch gültig ist (`gueltigBis` eintragen, wenn es abläuft), und
 *   3. über `nachweisUrl` beim Aussteller nachprüfbar ist.
 *
 * Das ist keine Förmlichkeit: Ein fremdes Prüfzeichen ohne Berechtigung zu
 * führen, ist zugleich Markenverletzung und Irreführung — und Aussteller
 * prüfen das, weil ihr Zeichen sonst wertlos wird.
 *
 * Logos gehören nach `public/images/siegel/` (siehe README dort).
 */

export interface KonformitaetsPunkt {
  /** Die Aussage, kurz. Steht als Überschrift der Spalte. */
  titel: string;
  /** Ein Satz, der sie konkret macht. */
  text: string;
  /** Interne Seite, auf der dieselbe Angabe verbindlich steht. */
  beleg: { label: string; href: string };
}

export interface Siegel {
  /** Name des Prüfzeichens. */
  name: string;
  /** Wer es vergibt. */
  aussteller: string;
  /** Pfad unter /public, vorzugsweise SVG. */
  logo: string;
  /** Seite des Ausstellers, auf der die Gültigkeit nachprüfbar ist. */
  nachweisUrl: string;
  /** Ablaufdatum als Klartext, falls es eines gibt. */
  gueltigBis?: string;
}

export const konformitaetsPunkte: KonformitaetsPunkt[] = [
  {
    titel: "Server in Deutschland",
    text: "Website und Besuchermessung laufen auf unserem eigenen Server, nicht bei einem Dienst im Ausland.",
    beleg: { label: "Datenschutz", href: "/datenschutz" },
  },
  {
    titel: "Messung ohne Cookies",
    text: "Plausible statt Google Analytics: keine Profile, keine Wiedererkennung, keine Weitergabe an Dritte.",
    beleg: { label: "Datenschutz", href: "/datenschutz" },
  },
  {
    titel: "Nichts lädt ohne dein Ja",
    text: "Besuchermessung und Terminkalender starten erst nach deiner Einwilligung — § 25 TDDDG, jederzeit widerrufbar.",
    beleg: { label: "Datenschutz", href: "/datenschutz" },
  },
  {
    titel: "EU AI Act im Blick",
    text: "Welche Pflichten für euren KI-Einsatz gelten, klären wir vorher — im Selbstcheck kostenlos und ohne Anmeldung.",
    beleg: { label: "Selbstcheck", href: "/selbstcheck" },
  },
  {
    titel: "Eingetragene Gesellschaft",
    text: `${company.legalName}, ${company.registry.number} beim ${company.registry.court}, USt-IdNr. ${company.registry.vatId}.`,
    beleg: { label: "Impressum", href: "/impressum" },
  },
];

/**
 * Verliehene Prüfzeichen. Leer, bis die Nachweise vorliegen — siehe Kopf dieser
 * Datei für die drei Bedingungen, die ein Eintrag erfüllen muss.
 */
export const siegel: Siegel[] = [];
