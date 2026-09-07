/**
 * Leistungsportfolio für `/leistungen`.
 *
 * HERKUNFT: Die sechs Leistungen und der Technologie-Stack stammen inhaltlich
 * aus der alten Leistungsseite (`src/views/legacy/Leistungen.tsx`) und sind beim
 * Relaunch am 05.08.2026 übernommen worden — der Auftrag lautete, dass alles,
 * was vorher da war, wieder erreichbar sein muss.
 *
 * GEKÜRZT am 12.08.2026 auf Ansage ("die Leistungen kannst du dramatisch
 * verkürzen, das ist ein bisschen random"). Vorher standen hier sechs
 * Leistungen mit je vier Stichpunkten — 24 Zeilen, die niemand liest, und in
 * denen Vision-Agenten neben Kommunikations-Agenten und Data-Warehouse
 * standen, als wären das gleichwertige Angebote.
 *
 * Jetzt vier Schritte in der Reihenfolge, in der sie stattfinden, je ein Satz.
 * Neu darin und ebenfalls auf Ansage: der Enterprise-Betrieb (AWS, Azure oder
 * eigene Hardware) als eigener Punkt — "dass es halt für Unternehmen auch
 * vernünftig gemacht werden muss".
 *
 * `bullets` bleibt im Typ, wird aber nicht mehr befüllt: die Komponente
 * rendert die Liste nur, wenn etwas drinsteht.
 *
 * OFFEN: Die Formulierungen sind Altbestand, nicht Ayhams aktueller Wortlaut.
 * Ersetzt wird ausschließlich in dieser Datei; `Leistungen.tsx` bleibt dabei
 * unberührt. Zwei Dinge sind beim Übernehmen bewusst geändert worden:
 *   - Ansprache von "Sie" auf "ihr" gedreht. Die neu gebauten Seiten duzen ab
 *     dem Hero; eine Leistungsseite, die als einzige siezt, fällt auf.
 *   - Die Formulierung "Erreichen wir das ROI-Ziel nicht, zahlen Sie nicht" ist
 *     hier NICHT übernommen. Sie stand so auf der Alt-Seite, ist aber ein
 *     bindendes Zahlungsversprechen — das gehört freigegeben, bevor es wieder
 *     live geht, nicht beim Wiederaufbau der Seitenstruktur mit durchgereicht.
 */

export interface Service {
  /** Nummer im Ablauf. Ersetzt das Icon-Quadrat der Alt-Seite. */
  step: string;
  title: string;
  description: string;
  bullets: string[];
}

export const services: Service[] = [
  {
    step: "01",
    title: "Prozess-Audit",
    description:
      "Wir sehen uns eure Abläufe an und sagen, an welcher Stelle Automatisierung etwas bringt — und an welcher nicht. Was sich nicht rechnet, sagen wir vorher.",
    bullets: [],
  },
  {
    step: "02",
    title: "KI-Agenten, die an euren Daten arbeiten",
    description:
      "Agenten, die an eure Systeme angeschlossen sind statt danebenzustehen: Dokumente, Datenbanken, Fachanwendungen. Ohne diesen Anschluss bleibt jedes Sprachmodell ein besserer Chat.",
    bullets: [],
  },
  {
    step: "03",
    title: "In der Microsoft-Welt, in der ihr ohnehin arbeitet",
    description:
      "Power Automate, Power BI, Dynamics 365 und Power Apps — angebunden an Microsoft 365 und Azure, mit den Rechten und Protokollen, die dort schon gelten. Wer Microsoft im Haus hat, braucht kein zweites System daneben, sondern jemanden, der das vorhandene zu Ende baut.",
    bullets: [],
  },
  {
    step: "04",
    title: "Betrieb dort, wo die Daten liegen dürfen",
    description:
      "Für Betriebe mit echten Anforderungen an Datenschutz und Nachweisbarkeit: Betrieb in europäischer Region über Azure oder AWS, mit Auftragsverarbeitungsvertrag — oder auf eigener Hardware, wenn die Daten das Haus nicht verlassen dürfen.",
    bullets: [],
  },
  {
    step: "05",
    title: "Betrieb und Wartung",
    description:
      "Was gebaut ist, muss laufen. Überwachung, Nachjustieren, Weiterentwicklung — und ein fester Ansprechpartner statt einer Ticketschlange.",
    bullets: [],
  },
];

/**
 * Womit gebaut wird. Steht bewusst als schlichte Zeile am Ende der Seite, nicht
 * als Kachelraster: er ist ein Beleg, kein Verkaufsargument.
 *
 * **Microsoft steht vorn (Ansage 04.09.2026).** Der Enterprise-Stack ist das
 * Feld, in dem die Arbeit stattfindet, und die Reihenfolge hier ist die
 * Aussage — wer die Liste überfliegt, liest die ersten vier Einträge.
 *
 * ⚠️ **Die Produktnamen sind zeichengenau.** Es heißt *Dynamics 365 Sales*,
 * nicht „Dynamic Sales", und das BI-Produkt heißt *Power BI* — ein „Dynamics
 * BI" gibt es nicht. Bei dieser Zielgruppe sitzt auf der Gegenseite jemand, der
 * die Namen täglich benutzt; ein falscher Name kostet mehr Glaubwürdigkeit, als
 * die ganze Liste aufbaut.
 *
 * PyTorch, Hugging Face, LangChain und Kubernetes waren am 04.09.2026
 * herausgenommen — als vermuteter Altbestand der Vorgängerseite. Auf Nachfrage
 * am 07.09.2026 stehen sie wieder drin („lass ruhig drinne"): Sie beschreiben
 * reale Arbeit, der Eintrag in CLAUDE.md war eine Fehlannahme, keine
 * Karteileiche. Damit ist der dortige offene Punkt erledigt.
 */
export const techStack: Array<{ name: string; category: string }> = [
  { name: "Power Automate", category: "Prozessautomatisierung" },
  { name: "Power BI", category: "Auswertung" },
  { name: "Dynamics 365 Sales", category: "CRM" },
  { name: "Power Apps", category: "Fachanwendungen" },
  { name: "Microsoft Graph", category: "Microsoft 365" },
  { name: "Azure", category: "Cloud und KI-Dienste" },
  { name: "Python", category: "Backend" },
  { name: "PyTorch", category: "ML-Framework" },
  { name: "Hugging Face", category: "Sprachmodelle" },
  { name: "LangChain", category: "Orchestrierung" },
  { name: "PostgreSQL", category: "Datenbank" },
  { name: "Docker", category: "Container" },
  { name: "Kubernetes", category: "Betrieb" },
];
