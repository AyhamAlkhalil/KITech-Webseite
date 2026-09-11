import { stackMarken } from "./stack-marken";

/**
 * „Alle unsere Apps und Automatisierungen können per Claude und Codex bedient
 * werden" — gezeigt von `components/sections/Agentenfaehig.tsx` auf der
 * Startseite unter dem Kundenlaufband und auf `/referenzen` unter den
 * Kundenfällen.
 *
 * Angelegt am 07.09.2026 auf Ansage, am 11.09.2026 dreimal umgebaut. Der Stand
 * heute: **eine Zeile unter den Referenzen** — Marker, Satz, Zeichen. Kein
 * eigener Abschnitt mehr, keine Überschrift, keine Liste.
 *
 * ## Warum das hier steht und nicht in `client-results.ts`
 *
 * Dieselbe Trennung wie bei `microsoft-loesungen.ts`: Was hier steht, ist eine
 * Aussage über **uns**. Was in `client-results.ts` steht, ist eine Aussage über
 * einen **Kunden**. Es gibt bis heute keinen Referenzfall, in dessen
 * `openPoints` ein Agentenzugang bestätigt wäre; ein Label „agentenfähig" auf
 * einer Kundenkarte wäre deshalb eine Behauptung über fremde Software.
 *
 * ## ⚠️ Die Aussage ist eine Zusicherung, kein Werbesatz
 *
 * „Alle unsere Apps und Automatisierungen" ist Ayhams Wortlaut (Ansage
 * 11.09.2026) und bleibt es. Wer sie anfasst, muss wissen, was sie trägt: Das
 * ist eine Bestandsangabe über **jede** ausgelieferte Anwendung. Im Streitfall
 * muss der Werbende sie darlegen (§ 5 Abs. 1 UWG) — und zwar für jede App, die
 * jemand vorzeigt, auch für die Portale von 2026.
 *
 * Die Fassung bis zum 11.09.2026 lautete deshalb „Alles, was wir bauen, ist
 * agentenfähig" — eine Aussage über die Bauweise, die ohne Einschränkung
 * stimmte. Die neue ist die stärkere Verkaufsaussage und die schwächere
 * Rechtsposition. Das ist eine bewusste Entscheidung, keine Unachtsamkeit.
 *
 * ## Die Marken
 *
 * Zwei, mehr nicht: **Claude** (Anthropic) und **Codex** (OpenAI). Beide
 * bedienen unsere Anwendungen über dieselbe Schnittstelle; die Namen sind
 * zeichengenau zu führen.
 *
 * ⚠️ **Für Codex fehlt das Symbol als Datei** (Stand 11.09.2026). Das
 * Claude-Zeichen liegt als freigegebener Pfad im Repo und kommt hier aus
 * derselben Quelle wie das Hero-Laufband (`stack-marken.ts`) — eine Marke, ein
 * Pfad. Ein OpenAI-Zeichen gibt es dort nicht: Simple Icons führt es in
 * Fassung 16 nicht mehr (3459 Symbole, keines davon OpenAI), und
 * Markenzeichen werden dort auf Verlangen des Inhabers entfernt.
 *
 * **Nicht nachbauen.** Dieselbe Regel wie bei den Prüfzeichen unter
 * `public/images/siegel/`: Ein nachgezeichnetes Markenlogo ist auch mit wahrer
 * Aussage eine Markenverletzung. Die Datei kommt aus dem Brand-Kit des
 * Herstellers; bis dahin steht der Name allein, und die Komponente hält den
 * Platz dafür frei, ohne ihn zu markieren.
 *
 * Die Marken stehen beschreibend für das, womit unsere Anwendungen bedient
 * werden — nicht als Partnerlogo, nicht als Zertifizierung, nicht als
 * Empfehlung dieser Hersteller.
 */

export interface AgentenMarke {
  /** Kurzes Kürzel, nur als React-Key. */
  id: string;
  /** Produktname, zeichengenau wie beim Hersteller. */
  name: string;
  /** Wer es herausgibt. Steht klein unter dem Namen. */
  hersteller: string;
  /**
   * SVG-Pfad im 24×24-Raster, einfarbig über `currentColor`.
   *
   * `null` heißt: kein freigegebenes Zeichen vorhanden. Dann rendert die
   * Komponente an dieser Stelle nichts — keinen Kasten, kein Ersatzsymbol,
   * keinen Schriftzug im Logo-Look. Siehe Warnung im Kopf dieser Datei.
   */
  pfad: string | null;
}

/**
 * Der Marker, den der Block trägt. Ayhams Wort, unverändert — „agentenfähig"
 * ist der Begriff aus der Ansage und bleibt es.
 */
export const AGENTEN_LABEL = "Agentenfähig";

/**
 * Die Aussage. Ayhams Satz vom 11.09.2026, am selben Tag auf Ansage gekürzt
 * („knackiger, kürzer") — „können … bedient werden" ist zu „bedienbar per"
 * geworden, sonst steht er unverändert da. Siehe Warnung im Kopf: Der Umfang
 * („alle") ist das, was die Aussage trägt und was sie zur Zusicherung macht.
 */
export const AGENTEN_AUSSAGE =
  "Alle unsere Apps und Automatisierungen: bedienbar per Claude und Codex.";

/**
 * Das Claude-Zeichen steht bereits im Hero-Laufband. Es wird von dort geholt
 * und nicht kopiert: Tauscht Ayham es gegen ein Original des Herstellers, zieht
 * dieser Block automatisch mit.
 */
const claudeZeichen = stackMarken.find((marke) => marke.name === "Claude")?.pfad ?? null;

export const agentenMarken: AgentenMarke[] = [
  { id: "claude", name: "Claude", hersteller: "Anthropic", pfad: claudeZeichen },
  { id: "codex", name: "Codex", hersteller: "OpenAI", pfad: null },
];
