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
  /** Name des Prüfzeichens, z. B. „Microsoft Solutions Partner". */
  name: string;
  /** Wer es vergibt. */
  aussteller: string;
  /**
   * Die **unveränderte** Datei des Ausstellers unter `public/images/siegel/`.
   *
   * ⚠️ Nicht nachbauen, auch nicht „nachgezeichnet" oder aus einem Screenshot
   * geschnitten. Microsoft erzeugt jedes Badge im **Logo Builder des Partner
   * Center** (Farb- und Schwarzweißfassung); andere Aussteller liefern es mit
   * dem Zertifikat. Diese Dateien tragen die geprüften Proportionen, den
   * Schutzraum und teils eine Kennung — ein selbst gebautes Abbild ist auch
   * mit vorhandenem Status eine Markenverletzung.
   *
   * Daraus folgt für die Darstellung: **kein eigener Rahmen, kein eigener
   * Fußbalken, keine Einfärbung.** Die Kachel mit dem schwarzen Balken, die
   * man von Microsoft-Badges kennt, ist Teil der gelieferten Datei.
   */
  logo: string;
  /**
   * Die Ausprägung, falls das Zeichen mehrere kennt — bei Microsoft die
   * Designation („Digital & App Innovation", „Infrastructure Azure", „Data & AI
   * Azure"). Steht im Alternativtext, damit ein Screenreader die drei Badges
   * auseinanderhalten kann; sichtbar ist sie bereits in der Datei.
   */
  designation?: string;
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
 * Verliehene Prüfzeichen. Leer, bis die Dateien vorliegen — siehe Kopf dieser
 * Datei für die drei Bedingungen, die ein Eintrag erfüllen muss.
 *
 * **Stand 07.09.2026 (Ansage Ayham):**
 *
 *   - **Microsoft Solutions Partner — vorhanden.** Es fehlt nur die Datei aus
 *     dem Logo Builder des Partner Center. Sobald sie unter
 *     `public/images/siegel/` liegt, wird aus dem Kommentar unten ein Eintrag,
 *     und das Badge erscheint. Welche Designation(en) gelten, entscheidet sich
 *     daran, was im Partner Center steht — pro Designation ein Eintrag.
 *   - **ISO/IEC 27001 — Zertifizierung läuft.** Bleibt draußen, bis das
 *     Zertifikat da ist. Ein „Zertifizierung in Vorbereitung" auf der Seite
 *     wirkt wie eine vorhandene und ist genauso angreifbar.
 *   - **AWS und Google Cloud — nicht vorhanden.** Die Zeichen aus der Vorlage
 *     vom 07.09.2026 stammen von einer anderen Firma und bleiben draußen.
 *
 * So sieht ein fertiger Eintrag aus (Werte durch die echten ersetzen):
 *
 * ```ts
 * {
 *   name: "Microsoft Solutions Partner",
 *   aussteller: "Microsoft",
 *   designation: "Digital & App Innovation",
 *   logo: "/images/siegel/microsoft-solutions-partner-digital-app-innovation.png",
 *   nachweisUrl: "https://www.microsoft.com/de-de/solution-providers/…",
 * }
 * ```
 *
 * `nachweisUrl` ist der eigene Eintrag im Microsoft-Partnerverzeichnis. Fehlt
 * der, führt der Link ins Leere und belegt nichts — dann lieber die Seite des
 * Programms als gar nichts, aber der eigene Eintrag ist das Ziel.
 */
export const siegel: Siegel[] = [];
