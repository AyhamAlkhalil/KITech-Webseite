/**
 * „Alles, was wir bauen, ist agentenfähig" — die Bauweise jeder Anwendung, die
 * wir ausliefern. Gezeigt von `components/sections/Agentenfaehig.tsx` auf der
 * Startseite unter dem Kundenlaufband und auf `/referenzen` unter den
 * Kundenfällen.
 *
 * Angelegt am 07.09.2026 auf Ansage: „Ich möchte, dass meine Webseite
 * anspricht, dass all meine Produkte agentenfähig sind, KI-fähig sind. Ein SaaS
 * oder eine Webseite oder ein Portal — die sind alle fähig, dass Agenten und
 * KIs damit arbeiten können. Alle Anwendungen sind agentenfähig, können von
 * einer KI per Sprachnachricht, per MCP-Server oder per irgendwas natürlicher
 * Sprache bedient werden."
 *
 * ## Warum das hier steht und nicht in `client-results.ts`
 *
 * Dieselbe Trennung wie bei `microsoft-loesungen.ts`: Was hier steht, ist eine
 * Aussage über **uns** — wie wir bauen. Was in `client-results.ts` steht, ist
 * eine Aussage über einen **Kunden**. Es gibt bis heute keinen Referenzfall, in
 * dessen `openPoints` ein Agentenzugang bestätigt wäre; ein Label „agentenfähig"
 * auf einer Kundenkarte wäre deshalb eine Behauptung über fremde Software.
 * Deshalb steht der Block **unter** den Karten und als eigener Abschnitt, nicht
 * als Marker in ihnen.
 *
 * ## Warum die Aussage als Bauweise formuliert ist
 *
 * Die Ansage lautet „alle Produkte sind agentenfähig". Als Bestandsangabe über
 * jede jemals ausgelieferte Anwendung wäre das eine Zusicherung, die im
 * Streitfall der Werbende darlegen muss (§ 5 Abs. 1 UWG) — und die
 * Portale von 2026 haben diesen Zugang nicht nachträglich bekommen. Als Aussage
 * darüber, **wie wir bauen**, stimmt sie ohne Einschränkung und sagt dasselbe:
 * Wer bei uns bestellt, bekommt den Zugang mitgeliefert.
 *
 * ⚠️ Wer daraus „jedes unserer Produkte hat einen MCP-Server" macht, dreht eine
 * Leistungsbeschreibung in eine Bestandsbehauptung. Sobald ein Referenzfall den
 * Zugang belegt, gehört er als Fall nach `client-results.ts` — dann trägt ihn
 * ein Kunde mit Namen, und der ist mehr wert als jede Zeile hier.
 *
 * ## Regeln für Einträge
 *
 *   - **Keine Kennzahlen, keine Kunden.** Gleiche Grenze wie bei
 *     `microsoft-loesungen.ts`.
 *   - **Nur Zugänge, die wir tatsächlich so bauen.** Auf der Gegenseite sitzt
 *     zunehmend jemand, der MCP kennt; ein erfundener Weg fällt beim ersten
 *     Rückfragen auf.
 *   - **Technische Sprache, keine Agentur-Sprache.** Der Bestand steht
 *     ohnehin 161:4 auf „KI" gegen klassische IT-Begriffe (siehe CLAUDE.md).
 *     Dieser Block schiebt weiter in Richtung KI — deshalb ist er in der
 *     Sprache eines Systemhauses geschrieben: Schnittstelle, Rechte, Protokoll.
 *     Wer ihn „begeisternder" formuliert, verschiebt die Positionierung.
 *   - **Produktnamen zeichengenau:** Microsoft 365 Copilot, Power Automate,
 *     Model Context Protocol (MCP).
 */

export interface Bedienweg {
  /** Kurzes Kürzel, nur als React-Key. */
  id: string;
  /** Der Zugang als Aussage, nicht als Schlagwort. */
  titel: string;
  /** Was er konkret bedeutet. Zwei Sätze, höchstens. */
  text: string;
}

/**
 * Der Marker, den der Block trägt. Ayhams Wort, unverändert — „agentenfähig"
 * ist der Begriff aus der Ansage und bleibt es.
 */
export const AGENTEN_LABEL = "Agentenfähig";

/** Die Aussage. Steht als Überschrift des Blocks. */
export const AGENTEN_AUSSAGE = "Alles, was wir bauen, ist agentenfähig.";

/**
 * Der eine Satz darunter. Er löst „agentenfähig" auf, statt es zu wiederholen —
 * ein Erklärabsatz, der die Überschrift umformuliert, ist als Muster raus.
 */
export const AGENTEN_EINORDNUNG =
  "Neben der Oberfläche für Menschen bekommt jede Anwendung eine Schnittstelle, " +
  "über die ein Sprachmodell sie bedient: SaaS, Portal, interne Fachanwendung.";

export const bedienwege: Bedienweg[] = [
  {
    id: "mcp",
    titel: "MCP-Server gehört zur Auslieferung",
    text:
      "Claude, ChatGPT oder ein Agent im eigenen Haus hängt sich über das Model Context " +
      "Protocol an die Anwendung und liest, sucht und schreibt darüber. Es gelten die Rechte " +
      "des angemeldeten Kontos, kein eigener Generalschlüssel für den Agenten.",
  },
  {
    id: "sprache",
    titel: "Eine Sprachnachricht reicht als Eingabe",
    text:
      "Was jemand unterwegs diktiert, kommt als fertiger Vorgang im System an. Der Umweg " +
      "über das Formular am Schreibtisch entfällt, und mit ihm der Stapel, der abends noch " +
      "nachgetragen wird.",
  },
  {
    id: "frage",
    titel: "Gefragt wird in Worten, nicht im Klickpfad",
    text:
      "Wer die Software selten benutzt, muss ihre Menüführung nicht kennen. Die Frage geht " +
      "so hinein, wie sie im Kopf entsteht, und die Antwort weist aus, aus welchem Datensatz " +
      "sie stammt.",
  },
  {
    id: "anschluss",
    titel: "Was im Haus schon läuft, wird angeschlossen",
    text:
      "Wer Microsoft 365 Copilot oder einen eigenen Assistenten im Einsatz hat, hängt ihn an " +
      "dieselbe Schnittstelle. Dazu kommt kein zweites System neben das vorhandene.",
  },
];

/**
 * Der Beleg — und zwar einer, den der Leser in drei Sekunden selbst prüft.
 *
 * ⚠️ Bewusst als **absolute** Adresse: `llms.txt` liegt unter `public/` und ist
 * keine Route im App Router. Ein interner Link `/llms.txt` würde von
 * `routes.test.ts` als toter Link gemeldet, weil dort keine `page.tsx` steht.
 *
 * Warum ausgerechnet diese Datei: Sie ist die maschinenlesbare Fassung dieser
 * Website, wird bei jeder Inhaltsänderung neu erzeugt (`npm run llms`) und
 * belegt damit an einem echten Beispiel genau das, was der Block behauptet.
 * Eine Aussage über Maschinenlesbarkeit ohne maschinenlesbaren Beleg wäre die
 * schwächste Stelle der ganzen Seite.
 */
export const agentenBeleg = {
  satz: "Diese Website liefert ihren eigenen Inhalt maschinenlesbar aus.",
  linkLabel: "llms.txt ansehen",
  href: "https://kitech-software.de/llms.txt",
};
