import { clientResults, type ClientResult } from "./client-results";
import { datumLang } from "../lib/datum";

/**
 * Vergleich: Software für Prozessautomatisierung — Inhalt der Seite
 * `/vergleich/prozessautomatisierung` und der Abschnitt dazu in `llms.txt`.
 *
 * ## Warum es diese Seite gibt
 *
 * Google zeigt die Domain seit dem Sommer für „prozesse automatisieren software
 * vergleich" (Search Console, 90 Tage bis 06.10.2026, Position 20), ohne dass
 * es eine Seite dafür gab. Das Thema passt zur Positionierung „IT-Dienstleister,
 * der auch KI macht": Es ist ein IT-Thema, und zwei der sechs Plattformen setzen
 * wir selbst ein — Power Automate (Microsoft-Stack) und n8n.
 *
 * ## Die Regeln, die diese Datei belastbar machen
 *
 * Sobald der Herausgeber selbst am Markt ist, ist ein Vergleich vergleichende
 * Werbung (§ 6 UWG), und die Darlegungslast für jede Angabe über einen
 * Mitbewerber liegt bei uns (§ 5 Abs. 1 UWG). Daraus folgt:
 *
 *   1. **Jede Herstellerangabe hat eine Quelle des Herstellers** mit Adresse und
 *      Abrufdatum (`quellen` unten). Keine Zahl aus Vergleichsportalen, keine aus
 *      dem Gedächtnis eines Sprachmodells.
 *   2. **Keine Beträge.** Preisaussagen kommen nicht in die Copy (Entscheidung
 *      05.09.2026). Hier steht die Abrechnungseinheit — wonach der Preis steigt —
 *      und ein Link auf die Preisseite des Herstellers.
 *   3. **Gleiche Gliederung für alle sechs.** Keine Plattform bekommt eine Zeile
 *      mehr oder weniger. Die einzige Ausnahme ist `eigeneArbeit`: Sie steht nur
 *      bei Power Automate und n8n, weil nur dort eigene Erfahrung dahintersteht.
 *   4. **Grenzen statt Nachteile.** „Grenzen" beschreibt, wann eine Plattform
 *      nicht passt — nachprüfbar und ohne Herabsetzung (§ 6 Abs. 2 Nr. 5 UWG).
 *   5. **Reihenfolge alphabetisch, keine Punkte, keine Sterne.** Eine Rangliste
 *      müssten wir begründen können; eine alphabetische nicht.
 *   6. **KITech ist keine siebte Plattform.** Wir sind Hersteller keiner dieser
 *      Plattformen und verdienen an der Einführung. Deshalb steht KITech nicht in
 *      der Tabelle, sondern in einem eigenen Abschnitt — mit Transparenzhinweis
 *      ganz oben. ⚠️ Ob zusätzlich Erlöse aus Microsoft-Lizenzen oder
 *      Partnervergütungen anfallen, ist nicht geklärt (offener Punkt in
 *      CLAUDE.md). Falls ja, gehört es in den Hinweis.
 *
 * ## Pflege
 *
 * Herstellerseiten ändern sich schnell. Wer eine Angabe aktualisiert, ruft die
 * Quelle neu ab, setzt `abgerufen` und `STAND` und in `navigation.ts` das
 * `lastModified` der Route auf dasselbe Datum. `vergleich-prozessautomatisierung.test.ts`
 * prüft, dass die drei zusammenpassen.
 *
 * Kundenfälle werden nicht abgeschrieben, sondern aus `client-results.ts`
 * gelesen. Eine sinngemäße Fassung hat schon einmal aus einer gemessenen
 * Aufwands-Äquivalenz einen behaupteten Dauerzustand gemacht.
 */

export const VERGLEICH_PFAD = "/vergleich/prozessautomatisierung";
/** Name in der Brotkrume. */
export const VERGLEICH_TITEL_KURZ = "Prozessautomatisierung im Vergleich";
export const AUTOR_SLUG = "ayham-alkhalil";
export const VEROEFFENTLICHT = "2026-10-06";
/** Stand aller Herstellerangaben. Muss zu `lastModified` in `navigation.ts` passen. */
export const STAND = "2026-10-06";

/**
 * Themenbereiche der Artikel unter dem Vergleich, in Rangfolge — Fehlerwege und
 * Betrieb zuerst, dann Hosting. Der Test prüft, dass es die Bereiche gibt.
 */
export const WEITERLESEN_THEMEN = ["prozessautomatisierung", "ki-betrieb"];

/**
 * Kundenfälle, auf die sich die Seite stützt — gelesen, nicht abgeschrieben.
 * Fehlt einer, bricht der Build ab, statt eine Lücke auszuliefern.
 */
function fall(slug: string): ClientResult {
  const gefunden = clientResults.find((eintrag) => eintrag.slug === slug);
  if (!gefunden) {
    throw new Error(`Plattformvergleich: Kundenfall ${slug} fehlt in client-results.ts`);
  }
  return gefunden;
}

const proOptima = fall("prooptima-vertrieb-power-automate");
const ziemann = fall("ziemann-mailautomatisierung");
const niimmo = fall("niimmo-portal");

/* Ohne Projektdauer im Kundenfall entfällt der Satz — keine Ersatzzahl. */
const niimmoBeispiel = niimmo.duration
  ? ` Beispiel aus eigener Arbeit: ${niimmo.kategorie} der ${niimmo.company}, ${niimmo.duration}.`
  : "";

/* -------------------------------------------------------------------------- */
/* Kopf und Einleitung                                                         */
/* -------------------------------------------------------------------------- */

export const ueberschrift = "Software für Prozessautomatisierung: sechs Plattformen im Vergleich";

/** Ein Satz unter der H1 — die These der Seite, kein Erklärabsatz. */
export const lead =
  "Welche Plattform passt, hängt vor allem an zwei Dingen: an den Systemen, die schon im Haus sind, und an der Frage, wer die Abläufe danach betreibt.";

/** Beschreibung im Article-Schema. */
export const teaser =
  "Power Automate, n8n, Make, Zapier, UiPath und Camunda nach denselben Kriterien verglichen: Betrieb, Datenstandort, Abrechnung, Nachweise und für wen welche Plattform passt. Mit Herstellerquellen.";

export const transparenzhinweis =
  "KITech Software ist Hersteller keiner dieser Plattformen. Wir setzen aber Automatisierungen für Kunden um, vor allem mit Power Automate und n8n, und verdienen an dieser Arbeit. Deshalb gelten für alle sechs Plattformen dieselben Kriterien, und jede Angabe über einen Hersteller ist mit dessen eigener Seite belegt.";

export const einleitung = [
  "Software für Prozessautomatisierung führt wiederkehrende Abläufe zwischen Anwendungen nach festen Regeln aus, ohne dass jemand jeden Schritt von Hand anstößt. Typische Beispiele: eine Rechnung aus dem Postfach ablegen oder einen Auftrag ins ERP übertragen.",
  "Die sechs Plattformen unterscheiden sich weniger im Funktionsumfang als im Betrieb. Make und Zapier laufen in der Cloud des Herstellers, n8n, UiPath und Camunda auch auf eigenen Servern. Power Automate ist ein Clouddienst von Microsoft und liegt nahe, wo Microsoft 365 schon im Haus ist.",
];

/** Die Abschnitte der Seite, in Reihenfolge. Titel = H2 = Eintrag im Inhaltsverzeichnis. */
export const abschnitte = {
  ueberblick: { id: "ueberblick", titel: "Welche Plattform eignet sich wofür?" },
  tabelle: { id: "tabelle", titel: "Wie unterscheiden sich Betrieb, Datenstandort und Abrechnung?" },
  nachweise: { id: "nachweise", titel: "Datenschutz, Nachweise und Anbindungen laut Hersteller" },
  profile: { id: "profile", titel: "Die sechs Plattformen einzeln" },
  umsetzung: { id: "umsetzung", titel: "Selbst einführen oder einführen lassen?" },
  entscheidung: { id: "entscheidungshilfe", titel: "Welche Plattform passt zu welcher Ausgangslage?" },
  methodik: { id: "methodik", titel: "Wie ist dieser Vergleich entstanden?" },
  fragen: { id: "fragen", titel: "Häufige Fragen" },
  quellen: { id: "quellen", titel: "Quellen" },
} as const;

/* -------------------------------------------------------------------------- */
/* Quellen                                                                     */
/* -------------------------------------------------------------------------- */

export interface Quelle {
  /** Stabile Kennung, über die Profile und Fragen auf die Quelle zeigen. */
  id: string;
  /** Sichtbarer Titel. Selbst formuliert, ohne Zeichen, die der Hausstil nicht kennt. */
  titel: string;
  url: string;
  /** ISO-Datum des Abrufs. Nicht nach `STAND`. */
  abgerufen: string;
}

const ABRUF = "2026-10-06";

/** Reihenfolge = Nummerierung auf der Seite. */
export const quellen: Quelle[] = [
  /* --- Camunda --- */
  {
    id: "camunda-impressum",
    titel: "Camunda: Impressum der Camunda Services GmbH",
    url: "https://camunda.com/legal/imprint/",
    abgerufen: ABRUF,
  },
  {
    id: "camunda-plattform",
    titel: "Camunda: Plattform, Betriebsarten und Nachweise",
    url: "https://camunda.com/platform/",
    abgerufen: ABRUF,
  },
  {
    id: "camunda-preise",
    titel: "Camunda: Preise und Betriebsarten",
    url: "https://camunda.com/pricing/",
    abgerufen: ABRUF,
  },
  {
    id: "camunda-lizenzen",
    titel: "Camunda Docs: Lizenzen ab Version 8.6",
    url: "https://docs.camunda.io/docs/reference/licenses/",
    abgerufen: ABRUF,
  },
  {
    id: "camunda-regionen",
    titel: "Camunda Docs: Regionen der SaaS",
    url: "https://docs.camunda.io/docs/components/saas/regions/",
    abgerufen: ABRUF,
  },
  {
    id: "camunda-datenorte",
    titel: "Camunda Docs: Wo die Daten der SaaS liegen",
    url: "https://docs.camunda.io/docs/components/saas/data-locations/",
    abgerufen: ABRUF,
  },
  {
    id: "camunda-selbstbetrieb",
    titel: "Camunda Docs: Einrichtung im Selbstbetrieb",
    url: "https://docs.camunda.io/docs/8.9/self-managed/setup/overview/",
    abgerufen: ABRUF,
  },
  {
    id: "camunda-verantwortung",
    titel: "Camunda Docs: Was Selbstbetrieb bedeutet",
    url: "https://docs.camunda.io/docs/self-managed/about-self-managed/",
    abgerufen: ABRUF,
  },
  {
    id: "camunda-quickstart",
    titel: "Camunda Docs: Schnellstart für Anwendungsentwickler",
    url: "https://docs.camunda.io/docs/8.9/self-managed/quickstart/developer-quickstart/",
    abgerufen: ABRUF,
  },
  {
    id: "camunda-abrechnung",
    titel: "Camunda Docs: Nutzungsmetriken und Abrechnung",
    url: "https://docs.camunda.io/docs/reference/data-collection/usage-metrics/",
    abgerufen: ABRUF,
  },
  {
    id: "camunda-avv",
    titel: "Camunda: Data Processing Agreement",
    url: "https://legal.camunda.com/dpa",
    abgerufen: ABRUF,
  },
  {
    id: "camunda-datenschutz",
    titel: "Camunda: Datenschutz und Standardvertragsklauseln",
    url: "https://legal.camunda.com/privacy-and-data-protection",
    abgerufen: ABRUF,
  },
  {
    id: "camunda-trust",
    titel: "Camunda: Trust Center",
    url: "https://trust.camunda.com/",
    abgerufen: ABRUF,
  },
  {
    id: "camunda-ki",
    titel: "Camunda Docs: Mit KI bauen",
    url: "https://docs.camunda.io/docs/8.9/guides/build-with-ai/overview/",
    abgerufen: ABRUF,
  },
  {
    id: "camunda-version-89",
    titel: "Camunda Blog: Version 8.9 mit MCP-Server und Agent2Agent",
    url: "https://camunda.com/blog/2026/04/camunda-8-9-fastest-path-to-agentic-orchestration/",
    abgerufen: ABRUF,
  },
  {
    id: "camunda-konnektoren",
    titel: "Camunda: Konnektoren",
    url: "https://camunda.com/platform/connectors/",
    abgerufen: ABRUF,
  },
  {
    id: "camunda-7",
    titel: "Camunda auf GitHub: Ende der Community Edition von Camunda 7",
    url: "https://github.com/camunda/camunda-bpm-platform",
    abgerufen: ABRUF,
  },
  /* --- Make (Celonis) --- */
  {
    id: "make-startseite",
    titel: "Make: Startseite, Zugehörigkeit zu Celonis",
    url: "https://www.make.com/en",
    abgerufen: ABRUF,
  },
  {
    id: "make-integromat",
    titel: "Make: Aus Integromat wird Make",
    url: "https://www.make.com/en/end-of-integromat",
    abgerufen: ABRUF,
  },
  {
    id: "make-preise",
    titel: "Make: Preise, Pläne und Credits",
    url: "https://www.make.com/en/pricing",
    abgerufen: ABRUF,
  },
  {
    id: "make-credits",
    titel: "Make: Credits ersetzen Operations als Abrechnungseinheit",
    url: "https://www.make.com/en/credits",
    abgerufen: ABRUF,
  },
  {
    id: "make-operationen",
    titel: "Make Hilfe: Was eine Operation ist",
    url: "https://help.make.com/operations",
    abgerufen: ABRUF,
  },
  {
    id: "make-regionen",
    titel: "Make Hilfe: Organisationen und Standort des Rechenzentrums",
    url: "https://help.make.com/organizations",
    abgerufen: ABRUF,
  },
  {
    id: "make-unterauftrag",
    titel: "Make: Liste der Unterauftragsverarbeiter, gültig ab 12.12.2025",
    url: "https://assets.ctfassets.net/un655fb9wln6/78xuveidrchD9EWZLrrCUM/a8333d0c19d7de7910d81d8edd68df71/Make_Sub-Processors_November_2025.docx.pdf",
    abgerufen: ABRUF,
  },
  {
    id: "make-on-prem",
    titel: "Make Hilfe: On-prem Agent",
    url: "https://help.make.com/on-premise-agent",
    abgerufen: ABRUF,
  },
  {
    id: "make-msa",
    titel: "Make: Master Service Agreement mit Celonis, Inc.",
    url: "https://www.make.com/en/master-service-agreement.pdf",
    abgerufen: ABRUF,
  },
  {
    id: "make-avv",
    titel: "Make: Data Processing Agreement",
    url: "https://www.make.com/en/data-processing-agreement.pdf",
    abgerufen: ABRUF,
  },
  {
    id: "make-iso27001",
    titel: "Celonis: ISO/IEC-27001-Zertifikat 2025, Make im Geltungsbereich",
    url: "https://assets.ctfassets.net/un655fb9wln6/3s4l6ToMJGzJFpIonrUNz9/be57d399a21bc2a886d56be82e0b1a5d/Celonis_ISO27001_Certification_2025.PDF",
    abgerufen: ABRUF,
  },
  {
    id: "make-soc2",
    titel: "Celonis Trust Center: SOC-2-Berichte für Make",
    url: "https://trust.celonis.com/product/make/soc-3",
    abgerufen: ABRUF,
  },
  {
    id: "make-ki-agenten",
    titel: "Make Hilfe: Make AI Agents",
    url: "https://help.make.com/meet-the-new-make-ai-agents-app",
    abgerufen: ABRUF,
  },
  {
    id: "make-maia",
    titel: "Make Hilfe: Maia by Make",
    url: "https://help.make.com/introduction-to-maia-by-make",
    abgerufen: ABRUF,
  },
  {
    id: "make-mcp",
    titel: "Make: MCP-Server und MCP-Client",
    url: "https://www.make.com/en/mcp",
    abgerufen: ABRUF,
  },
  /* --- n8n --- */
  {
    id: "n8n-impressum",
    titel: "n8n: Impressum der n8n GmbH",
    url: "https://n8n.io/imprint/",
    abgerufen: ABRUF,
  },
  {
    id: "n8n-startseite",
    titel: "n8n: Startseite mit Zahl der Integrationen",
    url: "https://n8n.io/",
    abgerufen: ABRUF,
  },
  {
    id: "n8n-preise",
    titel: "n8n: Preise, Pläne und häufige Fragen zum Datenstandort",
    url: "https://n8n.io/pricing/",
    abgerufen: ABRUF,
  },
  {
    id: "n8n-selbst-hosten",
    titel: "n8n Docs: n8n selbst betreiben",
    url: "https://docs.n8n.io/deploy/host-n8n",
    abgerufen: ABRUF,
  },
  {
    id: "n8n-editionen",
    titel: "n8n Docs: Funktionen der Community Edition",
    url: "https://docs.n8n.io/deploy/host-n8n/community-edition-features",
    abgerufen: ABRUF,
  },
  {
    id: "n8n-cloud-oder-selbst",
    titel: "n8n Docs: Cloud oder Selbstbetrieb, Voraussetzungen im Vergleich",
    url: "https://docs.n8n.io/choose-how-to-use-n8n",
    abgerufen: ABRUF,
  },
  {
    id: "n8n-lizenz",
    titel: "n8n Docs: Community-Lizenz und Fair-Code-Modell",
    url: "https://docs.n8n.io/n8n-community-license",
    abgerufen: ABRUF,
  },
  {
    id: "n8n-lizenzfragen",
    titel: "n8n Docs: Häufige Fragen zur Community-Lizenz",
    url: "https://docs.n8n.io/n8n-community-license/community-license/license-faq",
    abgerufen: ABRUF,
  },
  {
    id: "n8n-business",
    titel: "n8n Blog: Neue Preisstruktur und Business-Plan",
    url: "https://blog.n8n.io/build-without-limits-everything-you-need-to-know-about-n8ns-new-pricing/",
    abgerufen: ABRUF,
  },
  {
    id: "n8n-sicherheit",
    titel: "n8n: Sicherheit, Hosting und Prüfungen",
    url: "https://n8n.io/legal/security/",
    abgerufen: ABRUF,
  },
  {
    id: "n8n-trust",
    titel: "n8n: Trust Center",
    url: "https://trust.n8n.io/",
    abgerufen: ABRUF,
  },
  {
    id: "n8n-avv",
    titel: "n8n: Rechtliches und vorunterschriebener Vertrag zur Auftragsverarbeitung",
    url: "https://n8n.io/legal/",
    abgerufen: ABRUF,
  },
  {
    id: "n8n-datenschutz",
    titel: "n8n Docs: Datenschutz und Standardvertragsklauseln",
    url: "https://docs.n8n.io/privacy-and-security",
    abgerufen: ABRUF,
  },
  {
    id: "n8n-code",
    titel: "n8n Docs: Code-Knoten für JavaScript und Python",
    url: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code",
    abgerufen: ABRUF,
  },
  {
    id: "n8n-ki-agent",
    titel: "n8n Docs: AI-Agent-Knoten",
    url: "https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent",
    abgerufen: ABRUF,
  },
  {
    id: "n8n-mcp",
    titel: "n8n Docs: MCP Server Trigger",
    url: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.mcptrigger",
    abgerufen: ABRUF,
  },
  {
    id: "n8n-update",
    titel: "n8n Docs: n8n aktualisieren",
    url: "https://docs.n8n.io/deploy/host-n8n/keep-n8n-running/update-n8n",
    abgerufen: ABRUF,
  },
  {
    id: "n8n-webhook",
    titel: "n8n Docs: Webhook-Knoten, Antwortverhalten",
    url: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook",
    abgerufen: ABRUF,
  },
  {
    id: "n8n-docker",
    titel: "n8n Docs: Installation mit Docker und dauerhaftem Volume",
    url: "https://docs.n8n.io/deploy/host-n8n/install-options/install-with-docker",
    abgerufen: ABRUF,
  },
  /* --- Power Automate (Microsoft) --- */
  {
    id: "pa-produkt",
    titel: "Microsoft: Power Automate, Produktseite mit häufigen Fragen",
    url: "https://www.microsoft.com/de-de/power-platform/products/power-automate",
    abgerufen: ABRUF,
  },
  {
    id: "pa-lizenzarten",
    titel: "Microsoft Learn: Arten von Power-Automate-Lizenzen",
    url: "https://learn.microsoft.com/en-us/power-platform/admin/power-automate-licensing/types",
    abgerufen: ABRUF,
  },
  {
    id: "pa-lizenzfragen",
    titel: "Microsoft Learn: Häufige Fragen zur Lizenzierung von Power Automate",
    url: "https://learn.microsoft.com/en-us/power-platform/admin/power-automate-licensing/faqs",
    abgerufen: ABRUF,
  },
  {
    id: "pa-nutzungsbasiert",
    titel: "Microsoft Learn: Nutzungsbasierte Abrechnung über ein Azure-Abonnement",
    url: "https://learn.microsoft.com/en-us/power-platform/admin/pay-as-you-go-overview",
    abgerufen: ABRUF,
  },
  {
    id: "pa-developer",
    titel: "Microsoft Learn: Power Apps Developer Plan",
    url: "https://learn.microsoft.com/en-us/power-platform/developer/plan",
    abgerufen: ABRUF,
  },
  {
    id: "pa-regionen",
    titel: "Microsoft Learn: Regionen in Power Automate",
    url: "https://learn.microsoft.com/en-us/power-automate/regions-overview",
    abgerufen: ABRUF,
  },
  {
    id: "pa-makroregionen",
    titel: "Microsoft Learn: Makroregionen der Power Platform und EU Data Boundary",
    url: "https://learn.microsoft.com/en-us/power-platform/admin/macro-regions",
    abgerufen: ABRUF,
  },
  {
    id: "pa-copilot-daten",
    titel: "Microsoft Learn: Copilot, regionale Verfügbarkeit und Datenbewegung",
    url: "https://learn.microsoft.com/en-us/power-platform/admin/geographical-availability-copilot",
    abgerufen: ABRUF,
  },
  {
    id: "pa-dpa",
    titel: "Microsoft: Products and Services Data Protection Addendum",
    url: "https://www.microsoft.com/licensing/docs/view/Microsoft-Products-and-Services-Data-Protection-Addendum-DPA",
    abgerufen: ABRUF,
  },
  {
    id: "pa-iso27001",
    titel: "Microsoft Learn: ISO/IEC 27001, Dienste im Prüfumfang",
    url: "https://learn.microsoft.com/en-us/compliance/regulatory/offering-iso-27001",
    abgerufen: ABRUF,
  },
  {
    id: "pa-soc2",
    titel: "Microsoft Learn: SOC 2 Type 2, Dienste im Prüfumfang",
    url: "https://learn.microsoft.com/en-us/compliance/regulatory/offering-soc-2",
    abgerufen: ABRUF,
  },
  {
    id: "pa-desktop",
    titel: "Microsoft Learn: Voraussetzungen für Desktop-Flows",
    url: "https://learn.microsoft.com/en-us/power-automate/desktop-flows/requirements",
    abgerufen: ABRUF,
  },
  {
    id: "pa-copilot",
    titel: "Microsoft Learn: Copilot in Power Automate",
    url: "https://learn.microsoft.com/en-us/power-automate/copilot-overview",
    abgerufen: ABRUF,
  },
  {
    id: "pa-ai-builder",
    titel: "Microsoft Learn: AI Builder in Power Automate",
    url: "https://learn.microsoft.com/en-us/power-automate/use-ai-builder",
    abgerufen: ABRUF,
  },
  /* --- UiPath --- */
  {
    id: "uipath-10k",
    titel: "UiPath: Jahresbericht 10-K für das Geschäftsjahr 2026",
    url: "https://www.sec.gov/Archives/edgar/data/1734722/000173472226000012/path-20260131.htm",
    abgerufen: ABRUF,
  },
  {
    id: "uipath-startseite",
    titel: "UiPath: Startseite, Plattform für Orchestrierung und Automatisierung",
    url: "https://www.uipath.com/de",
    abgerufen: ABRUF,
  },
  {
    id: "uipath-rpa",
    titel: "UiPath: Was robotergesteuerte Prozessautomatisierung ist",
    url: "https://www.uipath.com/rpa/robotic-process-automation",
    abgerufen: ABRUF,
  },
  {
    id: "uipath-betrieb",
    titel: "UiPath Docs: Bereitstellungsarten im Überblick",
    url: "https://docs.uipath.com/overview/other/latest/overview/understand-your-uipath-deployment",
    abgerufen: ABRUF,
  },
  {
    id: "uipath-preise",
    titel: "UiPath: Preise und Pläne",
    url: "https://www.uipath.com/pricing",
    abgerufen: ABRUF,
  },
  {
    id: "uipath-plaene",
    titel: "UiPath Docs: Pläne, Lizenzen und Datenstandort unter Unified Pricing",
    url: "https://docs.uipath.com/automation-cloud/automation-cloud/latest/admin-guide/unified-pricing-licensing-plan-framework",
    abgerufen: ABRUF,
  },
  {
    id: "uipath-community",
    titel: "UiPath: Community Agreement vom 27.07.2026",
    url: "https://assets.ctfassets.net/5965pury2lcm/6phC10IrLznUKqZvWr8Ooh/e48c7583d8bff65ab756e1c3beef5255/2026.07.27_Community_Agreement.pdf",
    abgerufen: ABRUF,
  },
  {
    id: "uipath-regionen",
    titel: "UiPath Docs: Regionen der Automation Cloud",
    url: "https://docs.uipath.com/automation-cloud/automation-cloud/latest/admin-guide/global-cloud-regions",
    abgerufen: ABRUF,
  },
  {
    id: "uipath-datenschutz",
    titel: "UiPath: Datenschutz, Auftragsverarbeitung und Standardvertragsklauseln",
    url: "https://www.uipath.com/legal/trust-and-security/privacy",
    abgerufen: ABRUF,
  },
  {
    id: "uipath-trust",
    titel: "UiPath: Trust Center",
    url: "https://trust.uipath.com",
    abgerufen: ABRUF,
  },
  {
    id: "uipath-anwendungen",
    titel: "UiPath Docs: Automatisierbare Anwendungen und Technologien",
    url: "https://docs.uipath.com/activities/other/latest/ui-automation/ui-automation-applications-and-technologies-automated",
    abgerufen: ABRUF,
  },
  {
    id: "uipath-roboter",
    titel: "UiPath Docs: Voraussetzungen der Roboter",
    url: "https://docs.uipath.com/robot/standalone/latest/admin-guide/hardware-and-software-requirements",
    abgerufen: ABRUF,
  },
  {
    id: "uipath-hintergrund",
    titel: "UiPath Docs: Abläufe im Hintergrund und gesperrter Bildschirm",
    url: "https://docs.uipath.com/robot/standalone/latest/admin-guide/background-process-automation",
    abgerufen: ABRUF,
  },
  {
    id: "uipath-suite",
    titel: "UiPath Docs: Voraussetzungen der Automation Suite",
    url: "https://docs.uipath.com/automation-suite/automation-suite/2.2510/installation-guide/hardware-and-software-requirements",
    abgerufen: ABRUF,
  },
  {
    id: "uipath-integration",
    titel: "UiPath: Integration Service",
    url: "https://www.uipath.com/product/integration-service",
    abgerufen: ABRUF,
  },
  {
    id: "uipath-agenten",
    titel: "UiPath: Agent Builder",
    url: "https://www.uipath.com/platform/agentic-automation/agentic-ai/agent-builder",
    abgerufen: ABRUF,
  },
  {
    id: "uipath-maestro",
    titel: "UiPath: Maestro",
    url: "https://www.uipath.com/product/maestro",
    abgerufen: ABRUF,
  },
  /* --- Zapier --- */
  {
    id: "zapier-anbieter",
    titel: "Zapier Hilfe: Angaben zum Anbieter Zapier, Inc.",
    url: "https://help.zapier.com/hc/en-us/articles/8496229312013-Zapier-s-vendor-information",
    abgerufen: ABRUF,
  },
  {
    id: "zapier-startseite",
    titel: "Zapier: Startseite mit Zahl der Apps",
    url: "https://zapier.com/",
    abgerufen: ABRUF,
  },
  {
    id: "zapier-preise",
    titel: "Zapier: Preise und Pläne",
    url: "https://zapier.com/pricing",
    abgerufen: ABRUF,
  },
  {
    id: "zapier-tasks",
    titel: "Zapier Hilfe: Wie Tasks gezählt werden",
    url: "https://help.zapier.com/hc/en-us/articles/8496196837261-How-is-task-usage-measured-in-Zapier",
    abgerufen: ABRUF,
  },
  {
    id: "zapier-cloud",
    titel: "Zapier: Vergleichsseite zu n8n, Betrieb als verwaltete Cloud",
    url: "https://zapier.com/compare/zapier-vs-n8n",
    abgerufen: ABRUF,
  },
  {
    id: "zapier-vpc",
    titel: "Zapier Hilfe: VPC Peering im Enterprise-Plan",
    url: "https://help.zapier.com/hc/en-us/articles/39711639396109-Set-up-a-VPC-peering-connection-to-Zapier",
    abgerufen: ABRUF,
  },
  {
    id: "zapier-sicherheit",
    titel: "Zapier: Sicherheit und Compliance, Datenstandort",
    url: "https://zapier.com/security-compliance",
    abgerufen: ABRUF,
  },
  {
    id: "zapier-datenschutz",
    titel: "Zapier: Häufige Fragen zum Datenschutz, Speicherung in der EU",
    url: "https://zapier.com/legal/data-privacy",
    abgerufen: ABRUF,
  },
  {
    id: "zapier-avv",
    titel: "Zapier: Data Processing Addendum",
    url: "https://zapier.com/legal/data-processing-addendum",
    abgerufen: ABRUF,
  },
  {
    id: "zapier-dpf",
    titel: "Zapier: EU-U.S. Data Privacy Framework",
    url: "https://zapier.com/legal/data-privacy-framework",
    abgerufen: ABRUF,
  },
  {
    id: "zapier-trust",
    titel: "Zapier: Trust Center mit Prüfzeitraum der SOC-Berichte",
    url: "https://trust.zapier.com/",
    abgerufen: ABRUF,
  },
  {
    id: "zapier-grenzen",
    titel: "Zapier Hilfe: Grenzen eines Zaps",
    url: "https://help.zapier.com/hc/en-us/articles/8496181445261-Zap-limits",
    abgerufen: ABRUF,
  },
  {
    id: "zapier-agents",
    titel: "Zapier: Zapier Agents",
    url: "https://zapier.com/agents",
    abgerufen: ABRUF,
  },
  {
    id: "zapier-copilot",
    titel: "Zapier Hilfe: Was Zapier Copilot ist",
    url: "https://help.zapier.com/hc/en-us/articles/38215656607757-What-is-Zapier-Copilot",
    abgerufen: ABRUF,
  },
  {
    id: "zapier-mcp",
    titel: "Zapier: Zapier MCP",
    url: "https://zapier.com/mcp",
    abgerufen: ABRUF,
  },
];

/** Laufende Nummer einer Quelle auf der Seite, beginnend bei 1. */
export function quellenNummer(id: string): number {
  const index = quellen.findIndex((quelle) => quelle.id === id);
  if (index === -1) throw new Error(`Unbekannte Quelle im Plattformvergleich: ${id}`);
  return index + 1;
}

/* -------------------------------------------------------------------------- */
/* Die sechs Plattformen                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Ein Absatz aus eigener Arbeit. Die Art steht sichtbar davor, damit ein
 * Kundenfall und eine Beschreibung unserer Bauweise nie ineinanderlaufen —
 * „Referenz oder Bauweise, nie dazwischen" (CLAUDE.md). Eine Bauweise ohne
 * diese Kennzeichnung neben einem Kundenfall läse sich als Beschreibung genau
 * dieses Falls.
 */
export interface EigeneArbeit {
  art: "kundenfall" | "eigener-betrieb" | "bauweise";
  text: string;
}

export const EIGENE_ARBEIT_ART: Record<EigeneArbeit["art"], string> = {
  kundenfall: "Kundenfall",
  "eigener-betrieb": "Eigener Betrieb",
  bauweise: "Bauweise, kein Kundenprojekt",
};

export interface Plattform {
  /** Anker auf der Seite, kebab-case. */
  id: string;
  /** Name, wie er auf der Seite steht. */
  name: string;
  /** Vollständiger Produktname, für das Schema. */
  vollerName: string;
  hersteller: string;
  sitz: string;
  website: string;
  preisseite: string;
  /** Eindeutige Zuordnung im JSON-LD. */
  wikidata: string;
  /** Satzende nach „am besten für" — ohne Punkt. */
  amBestenFuer: string;
  /** Zwei bis drei Sätze. */
  beschreibung: string;
  /** Genau drei. */
  staerken: string[];
  /** Zwei bis drei: wann die Plattform nicht passt. */
  grenzen: string[];
  besonderheit: string;
  zielgruppe: string;
  /** Struktur des Preises, ohne Beträge. */
  preismodell: string;
  tabelle: {
    /** Hersteller und Sitz für die Tabelle, wo nötig mit dem Vertragspartner. */
    anbieter: string;
    betrieb: string;
    datenstandort: string;
    abrechnung: string;
    einstieg: string;
    auftragsverarbeitung: string;
    nachweise: string;
    ki: string;
    anbindungen: string;
  };
  /** Nur, wo wir die Plattform selbst einsetzen. */
  eigeneArbeit?: EigeneArbeit[];
  eigeneArbeitLink?: { label: string; href: string };
  /** Quelle-IDs, mindestens zwei. */
  quellen: string[];
}

/** Alphabetisch nach `name`. Der Test prüft das — die Seite sagt es. */
export const plattformen: Plattform[] = [
  {
    id: "camunda",
    name: "Camunda",
    vollerName: "Camunda 8",
    hersteller: "Camunda Services GmbH",
    sitz: "Berlin, Deutschland",
    website: "https://camunda.com/",
    preisseite: "https://camunda.com/pricing/",
    wikidata: "https://www.wikidata.org/wiki/Q15790886",
    amBestenFuer: "lange, in BPMN modellierte Prozesse über Abteilungen hinweg, mit eigenem Entwicklerteam",
    beschreibung:
      "Camunda ist eine Plattform zur Prozessorchestrierung aus Berlin. Abläufe werden im offenen Standard BPMN modelliert und von einer Prozess-Engine ausgeführt, die Menschen, Systeme und KI-Agenten koordiniert. Camunda beschreibt sich als entwicklerfreundliche Alternative zu klassischen BPM-Suiten.",
    staerken: [
      "Das Prozessmodell im offenen Standard BPMN lesen Fachbereich und IT gemeinsam, und laut Camunda läuft genau dieses Modell in Produktion.",
      "SaaS mit Regionen in Frankfurt am Main, Paris und Belgien oder Betrieb auf eigener Infrastruktur, auch ohne Verbindung nach außen.",
      "Laut Camunda zertifiziert nach ISO/IEC 27001, dazu SOC 2 Type 2 und TISAX.",
    ],
    grenzen: [
      "Seit Version 8.6 verlangt der Selbstbetrieb in Produktion eine Enterprise-Lizenz. Kostenlos sind nur Entwicklung und Test.",
      "Für den Selbstbetrieb empfiehlt Camunda Kubernetes mit Helm, Container laufen in Produktion nur unter Linux. Betrieb, Sicherheit und Updates liegen beim Unternehmen.",
      "Die frühere Community Edition von Camunda 7 ist eingestellt und bekommt keine Sicherheitsupdates mehr.",
    ],
    besonderheit:
      "In der SaaS liegen die Prozessdaten in der gewählten Region. Prozessmodelle und Verwaltungsdaten speichert Camunda laut Dokumentation in Deutschland bei AWS.",
    zielgruppe:
      "Laut Camunda vor allem größere Unternehmen, nach eigener Angabe mehr als 700 im Produktiveinsatz. Der Schnellstart für den Selbstbetrieb richtet sich an Anwendungsentwickler.",
    preismodell:
      "Abrechnung nach Prozessinstanzen und Mandanten. Selbst betrieben kostenlos für Entwicklung und Test, in Produktion mit Enterprise-Lizenz. SaaS über den Vertrieb oder als 30-tägiger Test.",
    tabelle: {
      anbieter: "Camunda Services GmbH, Berlin",
      betrieb: "Cloud (SaaS) oder eigener Server mit Kubernetes, auch ohne Verbindung nach außen",
      datenstandort: "Regionen wählbar, in der EU Frankfurt am Main, Paris und Belgien",
      abrechnung: "Prozessinstanzen und Mandanten",
      einstieg: "Selbst betrieben kostenlos für Entwicklung und Test. 30 Tage Test der SaaS.",
      auftragsverarbeitung: "Ja, Data Processing Agreement, Übermittlung in Drittländer über Standardvertragsklauseln",
      nachweise: "ISO/IEC 27001, SOC 2 Type 2 und TISAX laut Camunda",
      ki: "AI Agent connector, Camunda Copilot, MCP-Server, Agent2Agent-Protokoll",
      anbindungen: "mehr als 400 Konnektoren",
    },
    quellen: [
      "camunda-impressum",
      "camunda-plattform",
      "camunda-preise",
      "camunda-lizenzen",
      "camunda-regionen",
      "camunda-datenorte",
      "camunda-selbstbetrieb",
      "camunda-verantwortung",
      "camunda-quickstart",
      "camunda-abrechnung",
      "camunda-avv",
      "camunda-datenschutz",
      "camunda-trust",
      "camunda-ki",
      "camunda-version-89",
      "camunda-konnektoren",
      "camunda-7",
    ],
  },
  {
    id: "make",
    name: "Make",
    vollerName: "Make",
    hersteller: "Celonis",
    sitz: "München, Deutschland",
    website: "https://www.make.com/en",
    preisseite: "https://www.make.com/en/pricing",
    wikidata: "https://www.wikidata.org/wiki/Q134866480",
    amBestenFuer: "visuell gebaute Abläufe in der Cloud mit wählbarer EU-Region",
    beschreibung:
      "Make, früher Integromat, ist eine visuelle Automatisierungsplattform in der Cloud und gehört zu Celonis. Abläufe heißen bei Make Szenarien und entstehen aus Modulen, die Daten von Anwendung zu Anwendung weiterreichen. Programmierkenntnisse setzt Make laut eigener Beschreibung nicht voraus.",
    staerken: [
      "Beim Anlegen der Organisation lässt sich das Rechenzentrum wählen: EU oder USA.",
      "Ein Gratisplan ohne Zeitlimit, dazu laut Make mehr als 3.000 fertige Apps.",
      "MCP-Server und MCP-Client sind in allen Plänen enthalten.",
    ],
    grenzen: [
      "Make läuft als Cloud-Dienst. Systeme im eigenen Netz erreicht nur der Enterprise-Plan über den On-prem Agent.",
      "Jeder Modullauf kostet ein Credit, auch die Abfrage, ob neue Daten da sind. Kleinteilige Szenarien verbrauchen entsprechend mehr.",
      "Das Rechenzentrum lässt sich nach dem Anlegen der Organisation nicht mehr wechseln.",
    ],
    besonderheit:
      "Vertragspartner im Self-Service ist Celonis, Inc. in New York. In der EU-Region liegen die Daten laut Liste der Unterauftragsverarbeiter bei AWS in Irland, im Enterprise-Plan in Deutschland.",
    zielgruppe: "Laut Make Unternehmen vom Start-up bis zum Konzern.",
    preismodell:
      "Abrechnung nach Credits, ein Credit je Modulaktion. Pläne Free, Core, Pro, Teams und Enterprise. Credits ersetzen seit dem 27. August 2025 die frühere Einheit Operations.",
    tabelle: {
      anbieter: "Celonis, Konzernsitz München. Vertragspartner im Self-Service ist Celonis, Inc., New York.",
      betrieb: "Cloud des Herstellers. Lokale Systeme im Enterprise-Plan über den On-prem Agent.",
      datenstandort: "EU oder USA, beim Anlegen wählbar. EU bei AWS in Irland, Enterprise in Deutschland.",
      abrechnung: "Credits, ein Credit je Modulaktion",
      einstieg: "Gratisplan ohne Zeitlimit",
      auftragsverarbeitung: "Ja, öffentlich als PDF, mit Standardvertragsklauseln",
      nachweise: "ISO/IEC 27001 (Zertifikat der Celonis SE), SOC 2 Type 2",
      ki: "Make AI Agents und Maia, beide als Beta, dazu MCP-Server und MCP-Client",
      anbindungen: "mehr als 3.000 Apps",
    },
    quellen: [
      "make-startseite",
      "make-integromat",
      "make-preise",
      "make-credits",
      "make-operationen",
      "make-regionen",
      "make-unterauftrag",
      "make-on-prem",
      "make-msa",
      "make-avv",
      "make-iso27001",
      "make-soc2",
      "make-ki-agenten",
      "make-maia",
      "make-mcp",
    ],
  },
  {
    id: "n8n",
    name: "n8n",
    vollerName: "n8n",
    hersteller: "n8n GmbH",
    sitz: "Berlin, Deutschland",
    website: "https://n8n.io/",
    preisseite: "https://n8n.io/pricing/",
    wikidata: "https://www.wikidata.org/wiki/Q130305687",
    amBestenFuer: "Unternehmen, die Abläufe auf eigenen Servern betreiben wollen",
    beschreibung:
      "n8n ist eine Automatisierungsplattform aus Berlin, die sich auf eigenen Servern betreiben lässt oder als Cloud-Dienst von n8n. Abläufe entstehen im visuellen Editor, eigener Code in JavaScript oder Python ist möglich. n8n steht unter einer Fair-Code-Lizenz und nennt sich ausdrücklich nicht Open Source.",
    staerken: [
      "Die Community Edition läuft kostenlos auf eigener Infrastruktur, im eigenen Rechenzentrum oder in einer privaten Cloud.",
      "Die Cloud rechnet nach Ausführungen eines ganzen Ablaufs ab, unabhängig von der Zahl seiner Schritte.",
      "Eigener Code in JavaScript oder Python, dazu Bausteine für KI-Agenten und das Model Context Protocol.",
    ],
    grenzen: [
      "Selbst betrieben liegen Updates, Sicherungen und Überwachung beim Unternehmen. n8n empfiehlt, mindestens einmal im Monat zu aktualisieren.",
      "Die kostenlose Community Edition hat kein Single Sign-on, keine getrennten Umgebungen und kein Log-Streaming. Das gibt es erst mit Business oder Enterprise.",
      "Die Lizenz erlaubt den Einsatz im eigenen Unternehmen. Wer Kunden selbst Abläufe in n8n bauen lässt, braucht einen gesonderten Vertrag.",
    ],
    besonderheit:
      "Laut n8n liegen die Daten der Cloud-Fassung in der EU, auf Servern in Frankfurt am Main. Selbst betrieben bestimmt das Unternehmen den Standort.",
    zielgruppe:
      "Den Business-Plan für eigene Server beschreibt n8n als Angebot für mittelgroße Unternehmen. Für den Selbstbetrieb setzt n8n technische Kenntnisse bei Installation und Einrichtung voraus.",
    preismodell:
      "Cloud-Pläne nach monatlichen Workflow-Ausführungen (Starter, Pro, Enterprise). Selbst betrieben: Community Edition kostenlos, Business und Enterprise mit Lizenzschlüssel.",
    tabelle: {
      anbieter: "n8n GmbH, Berlin",
      betrieb: "Cloud von n8n oder eigener Server, auch im eigenen Rechenzentrum",
      datenstandort: "EU, Server in Frankfurt am Main. Selbst betrieben: eigener Standort.",
      abrechnung: "Workflow-Ausführungen in der Cloud, Lizenz für Business und Enterprise",
      einstieg: "Community Edition kostenlos selbst betreiben. 14 Tage Testphase in der Cloud.",
      auftragsverarbeitung: "Ja, vorunterschrieben, mit Standardvertragsklauseln",
      nachweise: "SOC 2 Type 2 und SOC 3 laut Trust Center",
      ki: "AI-Agent-Knoten auf Basis von LangChain, MCP-Client und MCP-Server",
      anbindungen: "mehr als 500 Integrationen",
    },
    eigeneArbeit: [
      { art: "kundenfall", text: `${ziemann.company}: ${ziemann.summary}` },
      {
        art: "eigener-betrieb",
        text: "n8n läuft bei uns seit August 2026 auf dem eigenen Server. Zwei Lehren daraus, beide in der Dokumentation von n8n nachzulesen: Ein Webhook-Knoten antwortet in der Grundeinstellung sofort mit „Workflow got started“, also bevor der Ablauf etwas getan hat. Und ohne dauerhaftes Volume für das Verzeichnis .n8n sind Datenbank und Schlüssel nach dem nächsten Ausrollen weg.",
      },
    ],
    eigeneArbeitLink: {
      label: "Was passiert, wenn eine Automatisierung nachts abstürzt?",
      href: "/gratis-wissen/was-passiert-wenn-eine-automatisierung-nachts-abstuerzt",
    },
    quellen: [
      "n8n-impressum",
      "n8n-startseite",
      "n8n-preise",
      "n8n-selbst-hosten",
      "n8n-cloud-oder-selbst",
      "n8n-editionen",
      "n8n-lizenz",
      "n8n-lizenzfragen",
      "n8n-business",
      "n8n-sicherheit",
      "n8n-trust",
      "n8n-avv",
      "n8n-datenschutz",
      "n8n-code",
      "n8n-ki-agent",
      "n8n-mcp",
      "n8n-update",
      "n8n-webhook",
      "n8n-docker",
    ],
  },
  {
    id: "power-automate",
    name: "Power Automate",
    vollerName: "Microsoft Power Automate",
    hersteller: "Microsoft",
    sitz: "Redmond, USA",
    website: "https://www.microsoft.com/de-de/power-platform/products/power-automate",
    preisseite: "https://www.microsoft.com/de-de/power-platform/products/power-automate/pricing",
    wikidata: "https://www.wikidata.org/wiki/Q28502244",
    amBestenFuer: "Unternehmen, die bereits mit Microsoft 365 arbeiten",
    beschreibung:
      "Power Automate gehört zur Microsoft Power Platform. Cloud-Flows verbinden Anwendungen über Konnektoren, Desktop-Flows bedienen Oberflächen auf Windows-Rechnern. Laut Microsoft ist Power Automate ein reiner Clouddienst, lokale Systeme werden über ein Datengateway angebunden.",
    staerken: [
      "Begrenzte Nutzungsrechte mit Standard-Konnektoren stecken bereits in vielen Microsoft-365-Lizenzen.",
      "Cloud-Flows, Desktop-Flows für Oberflächen ohne Schnittstelle und Process Mining unter einem Dach.",
      "Anmeldung, Rechte und Protokolle laufen über den vorhandenen Microsoft-Mandanten.",
    ],
    grenzen: [
      "Premium-Konnektoren wie SQL Server, Salesforce oder SAP ERP verlangen eine Premium-Lizenz.",
      "Keine Fassung für eigene Server: Power Automate ist laut Microsoft ein Clouddienst.",
      "Desktop-Flows laufen nur unter Windows, Rechner mit ARM-Prozessor unterstützt Microsoft nicht.",
    ],
    besonderheit:
      "Die Daten liegen in der Region der Power-Platform-Umgebung. Wer die Makroregion EU und EFTA wählt, liegt in der EU Data Boundary von Microsoft. Ausnahmen dokumentiert Microsoft selbst, etwa für Copilot.",
    zielgruppe: "Betriebe, deren Arbeit in Outlook, Teams, SharePoint, Excel und Dynamics 365 stattfindet.",
    preismodell:
      "Lizenz pro Nutzer (Power Automate Premium), pro Bot oder Prozess (Power Automate Process und Hosted Process) oder nutzungsbasiert pro Flow-Lauf über ein Azure-Abonnement.",
    tabelle: {
      anbieter: "Microsoft, Redmond (USA)",
      betrieb: "Nur Microsoft-Cloud. Desktop-Flows laufen auf eigenen Windows-Rechnern, lokale Systeme über ein Datengateway.",
      datenstandort: "Region der Umgebung, darunter EU und EFTA innerhalb der EU Data Boundary",
      abrechnung: "Nutzer, Bot oder Prozess, alternativ Flow-Lauf über Azure",
      einstieg: "Testphase. Standard-Konnektoren in vielen Microsoft-365-Lizenzen. Developer Plan ohne Produktivbetrieb.",
      auftragsverarbeitung: "Ja, Microsoft Products and Services Data Protection Addendum",
      nachweise: "ISO/IEC 27001, 27017, 27018, 27701, SOC 1 und SOC 2 Type 2 für die Microsoft-Cloud",
      ki: "Copilot in Power Automate, AI Builder",
      anbindungen: "mehr als 1.400 Konnektoren",
    },
    eigeneArbeit: [
      {
        art: "kundenfall",
        text: `${proOptima.company}: ${proOptima.headline.value} ${proOptima.headline.label}, automatisiert mit Power Automate.`,
      },
      {
        art: "bauweise",
        text: "Unabhängig von diesem Fall beschreiben wir unter den Referenzen, wie wir im Microsoft-Umfeld bauen, etwa Angebotsfreigaben über Microsoft Teams mit Rückschrieb in Dynamics 365 Sales.",
      },
    ],
    /* Die Marke `microsoft-umfeld` setzt `components/sections/MicrosoftLoesungen.tsx`.
       Der Routentest prüft nur den Pfad — wer dort die ID ändert, ändert sie hier. */
    eigeneArbeitLink: { label: "Microsoft-Bauweise unter den Referenzen", href: "/referenzen#microsoft-umfeld" },
    quellen: [
      "pa-produkt",
      "pa-lizenzarten",
      "pa-lizenzfragen",
      "pa-nutzungsbasiert",
      "pa-developer",
      "pa-regionen",
      "pa-makroregionen",
      "pa-copilot-daten",
      "pa-dpa",
      "pa-iso27001",
      "pa-soc2",
      "pa-desktop",
      "pa-copilot",
      "pa-ai-builder",
    ],
  },
  {
    id: "uipath",
    name: "UiPath",
    vollerName: "UiPath Platform",
    hersteller: "UiPath, Inc.",
    sitz: "New York, USA",
    website: "https://www.uipath.com/de",
    preisseite: "https://www.uipath.com/pricing",
    wikidata: "https://www.wikidata.org/wiki/Q55080120",
    amBestenFuer: "Anwendungen ohne Schnittstelle, die sich nur über ihre Oberfläche bedienen lassen",
    beschreibung:
      "UiPath beschreibt sich als Plattform für Orchestrierung und Automatisierung, zu der robotergesteuerte Prozessautomatisierung (RPA) gehört. Software-Roboter bedienen Bildschirme und Systeme wie ein Mensch, laut UiPath besonders dort, wo eine Anwendung keine Schnittstelle bietet. Die Plattform gibt es als Cloud-Dienst und zum Selbstbetrieb.",
    staerken: [
      "Bedient Desktop-Anwendungen, Browser, SAP GUI für Windows und Citrix-Umgebungen über die Oberfläche.",
      "Betrieb in der Cloud oder selbst gehostet, laut Preisseite ab dem Standard-Plan auch ohne Verbindung nach außen.",
      "Im Trust Center nennt UiPath unter anderem ISO/IEC 27001, ISO/IEC 42001 für KI-Managementsysteme, SOC 2 Type 2 und C5.",
    ],
    grenzen: [
      "Abläufe in Desktop-Anwendungen brauchen Roboter unter Windows. Abläufe über die Oberfläche laufen laut UiPath nicht bei gesperrtem Bildschirm.",
      "Selbst betrieben verlangt die Automation Suite Kenntnisse in Linux und Kubernetes. Für alle Produkte auf einem Knoten nennt UiPath mindestens 32 virtuelle Prozessoren und 64 GB Arbeitsspeicher.",
      "Den kostenlosen Community-Plan dürfen Organisationen oberhalb einer Umsatzgrenze nur für Tests, Schulungen und Forschung nutzen, nicht im laufenden Betrieb.",
    ],
    besonderheit:
      "Die Region der Cloud hängt am Plan: Basic läuft nur in der EU, Standard wählt eine Region, Enterprise je Mandant. Deutschland ist keine eigene Region, und Benachrichtigungs-Mails verarbeitet UiPath laut Dokumentation standardmäßig in den USA.",
    zielgruppe:
      "Laut UiPath Unternehmen aller Größen. Die dedizierte Cloud richtet sich ausdrücklich an große Unternehmen.",
    preismodell:
      "Lizenzen für Nutzer (Basic, Plus und Pro User) und unbeaufsichtigte Roboter, dazu Platform Units für den Verbrauch, etwa durch Agenten. Pläne Community, Basic, Standard und Enterprise, Standard und Enterprise über den Vertrieb.",
    tabelle: {
      anbieter: "UiPath, Inc., New York (USA)",
      betrieb: "Cloud, dedizierte Cloud oder selbst betrieben mit der Automation Suite",
      datenstandort: "Regionen wählbar, darunter EU und Schweiz. Basic und Community nur EU.",
      abrechnung: "Nutzer- und Roboterlizenzen, dazu Platform Units für den Verbrauch",
      einstieg: "Community-Plan kostenlos, im laufenden Betrieb nur für kleine Unternehmen. 60 Tage Test des Standard-Plans.",
      auftragsverarbeitung: "Ja, Vertrag zum Download, mit Standardvertragsklauseln",
      nachweise: "ISO/IEC 27001, 27017, 27018, 42001, SOC 1 und SOC 2 Type 2, C5 laut Trust Center",
      ki: "Agent Builder, Maestro, Autopilot, Document Understanding",
      anbindungen: "Keine Gesamtzahl genannt. Fertige Konnektoren im Integration Service, sonst über die Oberfläche.",
    },
    quellen: [
      "uipath-10k",
      "uipath-startseite",
      "uipath-rpa",
      "uipath-betrieb",
      "uipath-preise",
      "uipath-plaene",
      "uipath-community",
      "uipath-regionen",
      "uipath-datenschutz",
      "uipath-trust",
      "uipath-anwendungen",
      "uipath-roboter",
      "uipath-hintergrund",
      "uipath-suite",
      "uipath-integration",
      "uipath-agenten",
      "uipath-maestro",
    ],
  },
  {
    id: "zapier",
    name: "Zapier",
    vollerName: "Zapier",
    hersteller: "Zapier, Inc.",
    sitz: "San Francisco, USA",
    website: "https://zapier.com/",
    preisseite: "https://zapier.com/pricing",
    wikidata: "https://www.wikidata.org/wiki/Q27150165",
    amBestenFuer: "den schnellen Einstieg ohne IT, mit mehr als 9.000 fertig angebundenen Apps",
    beschreibung:
      "Zapier verbindet Cloud-Anwendungen über fertige Anbindungen zu Abläufen, die Zapier Zaps nennt. Der Dienst läuft vollständig in der Cloud von Zapier, die Daten liegen laut Zapier bei AWS in den USA. Neben Zaps bietet Zapier Agenten, Tabellen, Formulare und einen MCP-Zugang.",
    staerken: [
      "Laut Zapier mehr als 9.000 Apps mit fertiger Anbindung.",
      "Ein Gratisplan zum Ausprobieren, dazu 14 Tage Test des Professional-Plans ohne Kreditkarte.",
      "Gezählt werden nur erfolgreiche Aktionen. Filter, Verzweigungen und fehlgeschlagene Schritte kosten keine Tasks.",
    ],
    grenzen: [
      "Die Daten liegen laut Zapier in den USA. Eine Speicherung nur in der EU bietet Zapier nach eigener Auskunft nicht an.",
      "Kein Betrieb auf eigenen Servern. Systeme im eigenen Netz erreicht nur der Enterprise-Plan über VPC Peering, und das nur bei AWS.",
      "Ein Zap hat höchstens 100 Schritte, im Gratisplan nur zwei.",
    ],
    besonderheit:
      "Zapier hat sich unter dem EU-U.S. Data Privacy Framework selbst zertifiziert. Der Vertrag zur Auftragsverarbeitung enthält Standardvertragsklauseln.",
    zielgruppe: "Laut Zapier vom Einzelnutzer über Teams bis zum Einsatz im ganzen Unternehmen.",
    preismodell:
      "Abrechnung nach Tasks, also erfolgreich ausgeführten Aktionen. Pläne Free, Professional, Team und Enterprise. Zapier Agents rechnen getrennt nach Aktivitäten ab.",
    tabelle: {
      anbieter: "Zapier, Inc., San Francisco (USA)",
      betrieb: "Nur Cloud von Zapier. Im Enterprise-Plan Zugang zu eigenen Systemen per VPC Peering bei AWS.",
      datenstandort: "USA (AWS). Eine Speicherung nur in der EU bietet Zapier nicht an.",
      abrechnung: "Tasks, also erfolgreiche Aktionen",
      einstieg: "Gratisplan, 14 Tage Test des Professional-Plans",
      auftragsverarbeitung: "Ja, mit Standardvertragsklauseln, dazu EU-U.S. Data Privacy Framework",
      nachweise: "SOC 2 Type 2 und SOC 3, jährlich geprüft",
      ki: "Zapier Agents, Zapier Copilot als Beta, AI by Zapier, Zapier MCP",
      anbindungen: "mehr als 9.000 Apps",
    },
    quellen: [
      "zapier-anbieter",
      "zapier-startseite",
      "zapier-preise",
      "zapier-tasks",
      "zapier-cloud",
      "zapier-vpc",
      "zapier-sicherheit",
      "zapier-datenschutz",
      "zapier-avv",
      "zapier-dpf",
      "zapier-trust",
      "zapier-grenzen",
      "zapier-agents",
      "zapier-copilot",
      "zapier-mcp",
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Selbst einführen oder einführen lassen                                      */
/* -------------------------------------------------------------------------- */

export interface Beleg {
  titel: string;
  /** Bei Kundenfällen wörtlich `summary` aus `client-results.ts`. */
  text: string;
  href: string;
  linkText: string;
  extern?: boolean;
  /** Gesetzt, wenn der Text aus einem Kundenfall stammt — der Test vergleicht dann wörtlich. */
  fall?: string;
}

export const umsetzung = {
  /** Steht unter der Kurzliste. */
  kurzlisteZeile:
    "Wer die Plattform nicht selbst einführen will: KITech Software setzt Power Automate und n8n für mittelständische Unternehmen um.",
  einordnung: [
    "Make, Zapier und Power Automate lassen sich ohne Entwickler starten. Der Aufwand entsteht später: beim Anbinden von ERP und Postfächern, bei Berechtigungen und bei der Frage, wer nachts merkt, dass ein Ablauf stillsteht.",
    "KITech Software ist ein IT-Dienstleister aus Hannover. Wir bauen Automatisierungen mit Power Automate im Microsoft-365-Mandanten des Kunden und mit n8n auf einem eigenen Server. Zur Umsetzung gehören ein Fehlerweg und die Übergabe an die Leute, die den Ablauf später betreiben.",
  ],
  /** Der zitierfähige Satz: Zielgruppe, Bedingung, überprüfbares Merkmal. */
  aussage:
    "KITech Software eignet sich für mittelständische Unternehmen, die Abläufe mit Power Automate oder n8n umsetzen lassen und danach selbst betreiben wollen.",
  belege: [
    {
      titel: `${proOptima.company} · Power Automate`,
      text: proOptima.summary,
      href: "/referenzen",
      linkText: "Zu den Referenzen",
      fall: proOptima.slug,
    },
    {
      titel: `${ziemann.company} · n8n`,
      text: ziemann.summary,
      href: "/referenzen",
      linkText: "Zu den Referenzen",
      fall: ziemann.slug,
    },
    {
      titel: `${niimmo.company} · ${niimmo.kategorie}`,
      text: niimmo.summary,
      href: niimmo.liveUrl ?? "/referenzen",
      linkText: (niimmo.liveUrl ?? "").replace(/^https:\/\//, "") || "Zu den Referenzen",
      extern: Boolean(niimmo.liveUrl),
      fall: niimmo.slug,
    },
    {
      titel: "Eigener Betrieb · n8n",
      text: "Die Benachrichtigungen dieser Website laufen seit August 2026 über eine selbst betriebene n8n-Instanz.",
      href: "/gratis-wissen/was-passiert-wenn-eine-automatisierung-nachts-abstuerzt",
      linkText: "Was dabei über Fehlerwege zu lernen war",
    },
  ] satisfies Beleg[],
  abgrenzung:
    "Für große RPA-Vorhaben mit UiPath und für Camunda-Projekte mit eigenem Entwicklerteam sind die spezialisierten Partner dieser Hersteller die bessere Wahl.",
};

/* -------------------------------------------------------------------------- */
/* Entscheidungshilfe                                                          */
/* -------------------------------------------------------------------------- */

export interface Ausgangslage {
  /** Beginnt mit „Wer …" und endet mit Doppelpunkt. */
  wer: string;
  dann: string;
  /** Interner Pfad oder Anker auf dieser Seite. */
  ziel: { label: string; href: string };
}

export const ausgangslagen: Ausgangslage[] = [
  {
    wer: "Wer mit Microsoft 365 arbeitet und Abläufe zwischen Outlook, Teams, SharePoint und Dynamics 365 automatisieren will:",
    dann: "Power Automate. Begrenzte Rechte mit Standard-Konnektoren stecken bereits in vielen Microsoft-365-Lizenzen.",
    ziel: { label: "Profil Power Automate", href: "#power-automate" },
  },
  {
    wer: "Wer Daten nicht in die Cloud eines Automatisierungsanbieters geben will oder darf:",
    dann: "n8n auf eigenem Server. Mit eigenem Entwicklerteam auch Camunda, für Abläufe über Oberflächen UiPath mit der Automation Suite.",
    ziel: { label: "Profil n8n", href: "#n8n" },
  },
  {
    wer: "Wer ohne IT-Abteilung ein paar Cloud-Anwendungen verbinden will:",
    dann: "Zapier, wenn es vor allem auf die Zahl fertiger Anbindungen ankommt. Make, wenn das Rechenzentrum in der EU liegen soll.",
    ziel: { label: "Profil Zapier", href: "#zapier" },
  },
  {
    wer: "Wer eine Anwendung ohne Schnittstelle bedienen muss, etwa eine alte Desktop-Software:",
    dann: "Robotergesteuerte Prozessautomatisierung. UiPath für größere Vorhaben, Desktop-Flows in Power Automate, wenn Windows-Rechner und Microsoft-Lizenzen ohnehin da sind.",
    ziel: { label: "Profil UiPath", href: "#uipath" },
  },
  {
    wer: "Wer lange Prozesse über Abteilungen hinweg modellieren und nachweisen muss und ein Entwicklerteam hat:",
    dann: "Camunda. Der Prozess entsteht als BPMN-Modell, das Fachbereich und IT gemeinsam lesen. Für Produktion braucht es die SaaS oder eine Enterprise-Lizenz.",
    ziel: { label: "Profil Camunda", href: "#camunda" },
  },
  {
    wer: "Wer Sprachmodelle in Abläufe einbauen will:",
    dann: "Das können inzwischen alle sechs. Die Wahl folgt deshalb den Punkten oben und der Frage, wo die Eingaben verarbeitet werden.",
    ziel: { label: "KI-Bausteine im Vergleich", href: "#nachweise" },
  },
  {
    wer: "Wer die Einführung nicht selbst übernehmen will:",
    dann: "Ein Umsetzungspartner. Für Power Automate und n8n ist das unser Geschäft.",
    ziel: { label: "Selbst einführen oder einführen lassen?", href: "#umsetzung" },
  },
  {
    wer: "Wer noch nicht weiß, welcher Ablauf sich zuerst lohnt:",
    dann: "Erst den Ablauf prüfen, dann die Plattform wählen.",
    ziel: { label: "Prozess-Audit unter Leistungen", href: "/leistungen" },
  },
  {
    wer: "Wer für einen Ablauf eine eigene Oberfläche braucht, etwa ein Kundenportal:",
    dann: `Eine eigene Anwendung statt einer Plattform.${niimmoBeispiel}`,
    ziel: { label: "Referenzen", href: "/referenzen" },
  },
];

/* -------------------------------------------------------------------------- */
/* Methodik                                                                    */
/* -------------------------------------------------------------------------- */

export const kriterien: { name: string; text: string }[] = [
  {
    name: "Betrieb",
    text: "Läuft die Plattform nur in der Cloud des Herstellers oder auch auf eigenen Servern?",
  },
  {
    name: "Datenstandort",
    text: "Welche Regionen bietet die Cloud-Fassung an, und lässt sich eine Region in der EU wählen?",
  },
  {
    name: "Abrechnung",
    text: "Wonach der Preis steigt: Nutzer, Ausführungen, Operationen, Aufgaben oder Roboter. Beträge stehen auf den verlinkten Preisseiten.",
  },
  {
    name: "Kostenloser Einstieg",
    text: "Gibt es einen Gratisplan, eine Testphase oder eine freie Edition?",
  },
  {
    name: "Auftragsverarbeitung",
    text: "Bietet der Hersteller einen Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO an?",
  },
  {
    name: "Nachweise",
    text: "Welche Zertifikate und Prüfberichte nennt der Hersteller selbst, etwa ISO/IEC 27001 oder SOC 2?",
  },
  {
    name: "KI-Bausteine",
    text: "Welche Funktionen für Sprachmodelle und Agenten bietet die Plattform laut Hersteller?",
  },
  {
    name: "Anbindungen",
    text: "Wie viele fertige Anbindungen nennt der Hersteller? Nicht nachgezählt, und jeder Hersteller zählt anders.",
  },
  {
    name: "Zielgruppe",
    text: "An wen richtet sich die Plattform nach Darstellung des Herstellers?",
  },
];

export const methodik = {
  grundlage: [
    `Grundlage sind ausschließlich öffentliche Seiten der Hersteller: Produkt-, Preis-, Dokumentations- und Sicherheitsseiten. Alle Quellen wurden am ${datumLang(STAND)} abgerufen und stehen unten mit Adresse.`,
    "Power Automate und n8n setzen wir selbst in Projekten ein. Make, Zapier, UiPath und Camunda haben wir für diesen Vergleich nicht im eigenen Betrieb getestet. Was dort steht, stammt aus den Unterlagen der Hersteller.",
    "Nicht aufgenommen sind Plattformen, die an ein bestimmtes ERP gebunden sind, etwa SAP Build Process Automation, und reine Entwicklerdienste wie Microsoft Logic Apps.",
  ],
  grenzen: [
    "Herstellerangaben sind Selbstauskünfte. Zertifikate und Rechenzentrumsstandorte haben wir nicht beim jeweiligen Prüfer nachgeprüft.",
    "Beträge fehlen mit Absicht. Sie ändern sich laufend und hängen an Nutzerzahl und Volumen, die Abrechnungseinheit dagegen bleibt.",
    "Eine rechtliche Prüfung ersetzt die Tabelle nicht. Ob eine Plattform für einen bestimmten Ablauf zulässig ist, hängt an den Daten, die durch ihn laufen.",
    "Funktionen und Pläne ändern sich schnell. Maßgeblich ist der Stand am Kopf dieser Seite.",
  ],
  korrektur: "Eine Angabe ist veraltet oder falsch? Hinweise mit Quelle an",
};

/* -------------------------------------------------------------------------- */
/* Häufige Fragen                                                              */
/* -------------------------------------------------------------------------- */

export interface Frage {
  frage: string;
  /** Der erste Absatz ist die Antwort in ein bis drei Sätzen. */
  antwort: string[];
  /** Quellen, die nur hier gebraucht werden. */
  quellen?: string[];
}

export const fragen: Frage[] = [
  {
    frage: "Was ist Software für Prozessautomatisierung?",
    antwort: [
      "Software für Prozessautomatisierung führt wiederkehrende Abläufe zwischen Anwendungen nach festen Regeln aus. Sie verbindet Systeme über Schnittstellen oder bedient deren Oberfläche, wo es keine Schnittstelle gibt.",
      "Microsoft unterscheidet bei Power Automate genau diese beiden Wege: digitale Prozessautomatisierung für Apps, Daten und Dienste, robotergesteuerte Prozessautomatisierung für Altsysteme.",
    ],
  },
  {
    frage: "Welche Software für Prozessautomatisierung ist die beste?",
    antwort: [
      "Keine für alle Fälle. Für Unternehmen mit Microsoft 365 liegt Power Automate nahe, für Daten auf eigenen Servern n8n, für Oberflächen ohne Schnittstelle UiPath.",
      "Den Ausschlag geben die Systeme, die schon im Haus sind, und die Frage, wer die Abläufe danach betreibt. Die Entscheidungshilfe weiter oben ordnet die häufigsten Ausgangslagen zu.",
    ],
  },
  {
    frage: "Welche Plattformen lassen sich auf eigenen Servern betreiben?",
    antwort: [
      "n8n, UiPath und Camunda. n8n gibt es als kostenlose Community Edition, UiPath als Automation Suite ab dem Standard-Plan und Camunda als selbst betriebene Fassung, die in Produktion eine Enterprise-Lizenz verlangt.",
      "Make, Zapier und Power Automate laufen in der Cloud des Herstellers. Power Automate führt Desktop-Flows aber auf eigenen Windows-Rechnern aus, und Make erreicht lokale Systeme im Enterprise-Plan über den On-prem Agent.",
    ],
  },
  {
    frage: "Welche Plattformen bieten einen Datenstandort in der EU?",
    antwort: [
      "Make, n8n, Power Automate, UiPath und Camunda bieten Rechenzentren in der EU. Zapier speichert laut eigener Auskunft in den USA und bietet keine Speicherung nur in der EU an.",
      "Einen Standort in Deutschland nennen n8n mit Frankfurt am Main, Camunda mit der AWS-Region Frankfurt und Make im Enterprise-Plan. Bei Power Automate entscheidet die Region der Umgebung, und Microsoft dokumentiert Ausnahmen, etwa für Copilot.",
    ],
  },
  {
    frage: "Gibt es deutsche Anbieter für Prozessautomatisierung?",
    antwort: [
      "Ja. n8n und Camunda haben ihren Sitz in Berlin. Make gehört zu Celonis mit Sitz in München, Vertragspartner im Self-Service ist aber Celonis, Inc. in New York.",
    ],
  },
  {
    frage: "Was kostet Software für Prozessautomatisierung?",
    antwort: [
      "Das hängt an der Abrechnungseinheit. Power Automate rechnet pro Nutzer, Bot oder Flow-Lauf ab, n8n in der Cloud nach Ausführungen ganzer Abläufe, Make nach Credits je Modulaktion und Zapier nach Tasks.",
      "UiPath kombiniert Nutzer- und Roboterlizenzen mit Platform Units für den Verbrauch, Camunda rechnet nach Prozessinstanzen und Mandanten ab. Beträge stehen auf den Preisseiten der Hersteller, verlinkt in jedem Profil.",
      "Auf Dauer zählt, wie viele Schritte ein Ablauf hat und wie oft er läuft. Bei Make kostet jede Modulaktion, bei Zapier jede erfolgreiche Aktion, bei n8n zählt der ganze Durchlauf.",
    ],
  },
  {
    frage: "Was ist der Unterschied zwischen RPA und Workflow-Automatisierung?",
    antwort: [
      "Workflow-Automatisierung verbindet Anwendungen über ihre Schnittstellen. RPA, die robotergesteuerte Prozessautomatisierung, bedient die Oberfläche einer Anwendung wie ein Mensch und kommt dort zum Einsatz, wo es keine Schnittstelle gibt.",
      "Ein RPA-Ablauf hängt am Aufbau der Oberfläche. Ändert sie sich, muss der Ablauf nachgezogen werden. Wo eine Schnittstelle existiert, ist sie deshalb der stabilere Weg.",
    ],
  },
  {
    frage: "Power Automate oder n8n: Was passt besser?",
    antwort: [
      "Power Automate, wenn Microsoft 365 im Haus ist und die Abläufe dort bleiben. n8n, wenn die Daten auf eigenen Servern bleiben sollen oder viele Systeme außerhalb von Microsoft angebunden werden.",
      "Wir setzen beide ein und entscheiden am einzelnen Ablauf. Ein Ablauf zwischen Outlook, SharePoint und Dynamics 365 Sales gehört in Power Automate, eine Mail-Automatisierung auf eigenem Linux-Server in n8n.",
    ],
  },
  {
    frage: "Welche Alternativen gibt es zu Zapier?",
    antwort: [
      "Make, n8n und Power Automate. Make arbeitet ähnlich visuell und bietet ein Rechenzentrum in der EU, n8n läuft auch auf eigenen Servern, und Power Automate liegt nahe, wenn Microsoft 365 im Haus ist.",
      "Zapier selbst speichert laut eigener Auskunft in den USA. Wer einen Datenstandort in der EU braucht, findet ihn bei Make, n8n und Power Automate.",
    ],
  },
  {
    frage: "Braucht man für Prozessautomatisierung Programmierkenntnisse?",
    antwort: [
      "Für den Einstieg in Zapier, Make und Power Automate nicht. n8n erlaubt zusätzlich eigenen Code in JavaScript und Python, und Camunda richtet seinen Schnellstart an Anwendungsentwickler.",
      "Spätestens bei Fehlerwegen und bei Anbindungen ohne fertigen Konnektor hilft jemand, der programmieren kann.",
    ],
  },
  {
    frage: "Können diese Plattformen KI-Agenten einbinden?",
    antwort: [
      "Ja. Alle sechs bieten laut Hersteller Bausteine für Sprachmodelle oder Agenten, von Copilot in Power Automate über den AI-Agent-Knoten in n8n bis zu Zapier Agents.",
      "Wichtig ist, wo die Eingaben verarbeitet werden. Microsoft dokumentiert für Copilot selbst, dass Eingaben und Ergebnisse die eigene Region verlassen können.",
    ],
    quellen: ["pa-copilot-daten"],
  },
  {
    frage: "Wer führt Power Automate oder n8n im Mittelstand ein?",
    antwort: [
      "Microsoft-Partner, Systemhäuser und spezialisierte Dienstleister. KITech Software aus Hannover setzt beide Plattformen für mittelständische Unternehmen um und übergibt die Abläufe an die Leute, die sie danach betreiben.",
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Feste Texte der Seite                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Was die View sonst als Literal tragen würde. Es steht hier, damit es durch
 * dieselben Prüfungen läuft wie der Rest — Hausstil, Beträge, Superlative.
 */
export const seitentexte = {
  zurMethodik: "Zur Methodik",
  reihenfolge: "Reihenfolge alphabetisch. Es gibt keine Punkte, keine Sterne und keine Rangfolge.",
  scrollHinweis: "Die Tabelle lässt sich seitlich verschieben.",
  tabelleBetrieb: {
    spalten: ["Am besten für", "Betrieb", "Datenstandort der Cloud", "Abrechnung nach", "Kostenloser Einstieg"],
    beschriftung: `Betrieb, Datenstandort und Abrechnung der sechs Plattformen. Stand ${datumLang(STAND)}, Belege im jeweiligen Profil.`,
  },
  tabelleNachweise: {
    spalten: ["Anbieter", "Auftragsverarbeitung", "Nachweise laut Hersteller", "KI-Bausteine", "Anbindungen laut Hersteller"],
    beschriftung: `Anbieter, Auftragsverarbeitung, Nachweise, KI-Bausteine und Zahl der Anbindungen, jeweils laut Hersteller. Stand ${datumLang(STAND)}.`,
  },
  profilZeilen: {
    staerken: "Stärken",
    grenzen: "Grenzen",
    besonderheit: "Besonderheit",
    zielgruppe: "Zielgruppe",
    preismodell: "Preismodell",
    preisseite: "Preisseite des Herstellers",
    website: "Website",
  },
  eigeneArbeitTitel: "Aus eigener Arbeit",
  leistungenLink: "Leistungen ansehen",
  kriterienTitel: "Die Kriterien",
  grenzenTitel: "Was dieser Vergleich nicht leistet",
  weiterlesen: {
    heading: "Was nach der Plattformwahl kommt.",
    text: "Was im Betrieb von Automatisierungen zählt, aus eigener Arbeit aufgeschrieben.",
  },
  cta: {
    heading: "Welcher Ablauf trägt die erste Automatisierung?",
    text: "Im 1:1-KI-Check gehen wir einen Ablauf aus eurem Betrieb durch und klären, ob Power Automate, n8n oder gar keine Plattform passt.",
  },
};

/* -------------------------------------------------------------------------- */

/*
 * Jede Quellen-ID beim Laden auflösen, mit dem Namen dessen, der sie braucht.
 * Ein Tippfehler bricht damit Build, Test und `npm run llms` an derselben Stelle
 * ab — mit einer Meldung, die sagt, wo er steht, statt erst beim Rendern der
 * Belegnummern ohne Kontext.
 */
function pruefeQuellenverweise(): void {
  const bekannt = new Set(quellen.map((quelle) => quelle.id));
  const verweise = [
    ...plattformen.flatMap((p) => p.quellen.map((id) => ({ von: p.name, id }))),
    ...fragen.flatMap((f) => (f.quellen ?? []).map((id) => ({ von: f.frage, id }))),
  ];
  for (const { von, id } of verweise) {
    if (!bekannt.has(id)) {
      throw new Error(`Plattformvergleich: „${von}" verweist auf unbekannte Quelle ${id}`);
    }
  }
}

pruefeQuellenverweise();

/**
 * Alle sichtbaren Texte der Seite, für die Prüfungen im Test (Hausstil,
 * Beträge, Superlative). Wer ein Feld ergänzt, das auf der Seite erscheint,
 * ergänzt es hier — sonst prüft der Test daran vorbei.
 */
export function sichtbareTexte(): string[] {
  return [
    ueberschrift,
    lead,
    transparenzhinweis,
    ...einleitung,
    seitentexte.zurMethodik,
    seitentexte.reihenfolge,
    seitentexte.scrollHinweis,
    ...seitentexte.tabelleBetrieb.spalten,
    seitentexte.tabelleBetrieb.beschriftung,
    ...seitentexte.tabelleNachweise.spalten,
    seitentexte.tabelleNachweise.beschriftung,
    ...Object.values(seitentexte.profilZeilen),
    seitentexte.eigeneArbeitTitel,
    ...Object.values(EIGENE_ARBEIT_ART),
    seitentexte.leistungenLink,
    seitentexte.kriterienTitel,
    seitentexte.grenzenTitel,
    seitentexte.weiterlesen.heading,
    seitentexte.weiterlesen.text,
    seitentexte.cta.heading,
    seitentexte.cta.text,
    ...Object.values(abschnitte).map((abschnitt) => abschnitt.titel),
    ...quellen.map((quelle) => quelle.titel),
    ...plattformen.flatMap((p) => [
      p.name,
      p.hersteller,
      p.sitz,
      p.amBestenFuer,
      p.beschreibung,
      ...p.staerken,
      ...p.grenzen,
      p.besonderheit,
      p.zielgruppe,
      p.preismodell,
      ...Object.values(p.tabelle),
      ...(p.eigeneArbeit ?? []).map((absatz) => absatz.text),
      ...(p.eigeneArbeitLink ? [p.eigeneArbeitLink.label] : []),
    ]),
    umsetzung.kurzlisteZeile,
    ...umsetzung.einordnung,
    umsetzung.aussage,
    ...umsetzung.belege.flatMap((beleg) => [beleg.titel, beleg.text, beleg.linkText]),
    umsetzung.abgrenzung,
    ...ausgangslagen.flatMap((lage) => [lage.wer, lage.dann, lage.ziel.label]),
    ...kriterien.flatMap((kriterium) => [kriterium.name, kriterium.text]),
    ...methodik.grundlage,
    ...methodik.grenzen,
    methodik.korrektur,
    ...fragen.flatMap((eintrag) => [eintrag.frage, ...eintrag.antwort]),
  ];
}
