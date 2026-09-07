/**
 * Navigation und Routen-Register — die einzige Wahrheit für Kopfzeile, Fußzeile,
 * Sitemap und den Routen-Test.
 *
 * Vorher pflegte jede Stelle ihre eigene Liste: die Kopfzeile vier Punkte, die
 * Alt-Fußzeile fünf andere, die Sitemap eine dritte, und die Rechtstext-Links
 * standen in vier Seiten einzeln als `legalLinks`-Array. Dabei sind mehrere
 * Routen komplett aus der Navigation gefallen — es gab sie, aber kein Weg führte
 * hin. Wer hier etwas einträgt, trägt es überall ein.
 *
 * Diese Datei ist bewusst frei von JSX und React: sie wird auch von
 * `src/app/sitemap.ts` (Server) und vom Routen-Test (Node) importiert.
 */

export interface NavLink {
  label: string;
  href: string;
  /** Ein Satz für Untermenü, Übersichtskacheln und Fußzeile. */
  description?: string;
}

export interface NavEntry extends NavLink {
  /**
   * Unterpunkte. Der Elternpunkt bleibt ein echter Link auf eine eigene Seite —
   * ein Menüpunkt, der nur aufklappt und selbst nirgendwohin führt, ist auf dem
   * Handy eine Sackgasse.
   */
  children?: NavLink[];
}

/**
 * Die beiden Funnel-Seiten hängen unter einem gemeinsamen Punkt "Warum?"
 * (Vorgabe Ayham, 05.08.2026). Vorher standen beide vollen Seitentitel
 * nebeneinander in der Kopfzeile und haben sie allein gefüllt — für die
 * restlichen Themen war schlicht kein Platz.
 *
 * Die vollen Titel bleiben erhalten, sie stehen jetzt im Untermenü. Dort tragen
 * sie sich, weil sie untereinander stehen statt in einer Zeile.
 */
export const warumEntry: NavEntry = {
  label: "Warum?",
  href: "/warum",
  description: "Der Grund, warum KI bei den meisten kein Geld verdient.",
  children: [
    {
      label: "Warum du mit KI kein Geld verdienst",
      href: "/warum-du-mit-ki-kein-geld-verdienst",
      description: "Für Einzelunternehmer und Selbstständige.",
    },
    {
      label: "Warum Unternehmen mit KI kein Geld verdienen",
      href: "/warum-unternehmen-mit-ki-kein-geld-verdienen",
      description: "Für Geschäftsführung und Bereichsleitung.",
    },
  ],
};

export const leistungenEntry: NavEntry = {
  label: "Leistungen",
  href: "/leistungen",
  description: "Was wir bauen — vom Prozess-Audit bis zum laufenden Betrieb.",
  children: [
    {
      label: "KI-Beratung Mittelstand",
      href: "/ki-beratung-mittelstand",
      description: "Use Cases, ROI, Datenschutz und Betrieb vor der Umsetzung klären.",
    },
    {
      label: "Für Selbstständige",
      href: "/solo",
      description: "Ein bis sechs Leute, kein IT-Team im Rücken.",
    },
    {
      label: "Für Unternehmen",
      href: "/enterprise",
      description: "Gewachsene Prozesse, echte Compliance-Anforderungen.",
    },
  ],
};

/**
 * Der Content-Bereich: Artikel, Tipps, Ratgeber. Auf Ansage angelegt
 * (12.08.2026) — "ein Ort, wo ich ganz viel Content raushaue", Name ebenfalls
 * vorgegeben ("Gratis-Wissen").
 *
 * Er steht in der Kopfzeile an der Stelle, an der bis heute "Warum?" stand.
 */
export const wissenEntry: NavEntry = {
  label: "Gratis-Wissen",
  href: "/gratis-wissen",
  description: "Tipps, Ratgeber und die Fehler, die fast jeder mit KI macht.",
};

/**
 * Kopfzeile. Reihenfolge = Reihenfolge in der Leiste.
 *
 * "Warum?" ist am 12.08.2026 auf Ansage aus der Kopfzeile genommen worden
 * ("das ist noch schlecht, ich würde das erstmal auslassen"). Die Übersicht
 * `/warum` steht weiter in der Fußzeile, die beiden Sales Letter seit dem
 * 20.08.2026 nicht mehr — `warumEntry` wird trotzdem weiter exportiert, weil
 * `/warum` selbst die Weiche auf beide rendert.
 */
export const mainNavigation: NavEntry[] = [
  leistungenEntry,
  { label: "Referenzen", href: "/referenzen", description: "Kundenfälle mit Zahlen." },
  wissenEntry,
  { label: "Haltung", href: "/haltung", description: "Wonach wir entscheiden." },
  { label: "Karriere", href: "/karriere", description: "Offene Stellen bei KITech." },
  { label: "Kontakt", href: "/kontakt", description: "Direkter Draht, ohne Formularschleife." },
];

/**
 * Fußzeile. Deckt bewusst jede öffentliche Route ab — auch die, die nicht in die
 * Kopfzeile passen (Glossar, Selbstcheck, Terminseite). Der Footer ist die Stelle,
 * an der nichts unauffindbar sein darf.
 */
export const footerNavigation: Array<{ title: string; links: NavLink[] }> = [
  {
    title: "Angebot",
    links: [
      { label: "Leistungen", href: "/leistungen" },
      { label: "KI-Beratung Mittelstand", href: "/ki-beratung-mittelstand" },
      { label: "Für Selbstständige", href: "/solo" },
      { label: "Für Unternehmen", href: "/enterprise" },
      { label: "1:1-KI-Check sichern", href: "/lass-uns-reden" },
    ],
  },
  {
    title: "Unternehmen",
    links: [
      { label: "Haltung", href: "/haltung" },
      { label: "Referenzen", href: "/referenzen" },
      { label: "Karriere", href: "/karriere" },
      { label: "Kontakt", href: "/kontakt" },
    ],
  },
  {
    title: "Wissen",
    links: [
      { label: "Gratis-Wissen", href: "/gratis-wissen" },
      // Die beiden Sales Letter standen hier bis zum 20.08.2026 mit vollem Titel
      // und haben die Spalte allein gefuellt. Auf Ansage raus; erreichbar
      // bleiben sie ueber "Warum?" und die Segmentseiten /solo und /enterprise.
      { label: "Warum?", href: "/warum" },
      { label: "Glossar", href: "/glossar" },
      { label: "Wer hier schreibt", href: "/autoren" },
    ],
  },
];

/**
 * Rechtstexte. Standen bis zum 05.08.2026 als kopiertes `legalLinks`-Array in
 * Home, Community, Referenzen, ReferenzDetail, LassUnsReden und der
 * Baustellenseite — sechsmal dieselbe Liste.
 */
export const legalNavigation: NavLink[] = [
  { label: "Impressum", href: "/impressum" },
  { label: "Datenschutz", href: "/datenschutz" },
  { label: "AGB", href: "/agb" },
];

/* ------------------------------------------------------------------------- */
/* Routen-Register                                                            */
/* ------------------------------------------------------------------------- */

/**
 * Eine statische Route mit ihrem Indexierungs-Status.
 *
 * **`changeFrequency` und `priority` sind am 19.08.2026 entfallen.** Beide
 * standen hier für jede Route gepflegt — und wurden nie ausgewertet. Googles
 * Sitemap-Dokumentation sagt wörtlich: „Google ignores <priority> and
 * <changefreq> values." Gary Illyes dazu ausführlicher: changefreq überschneidet
 * sich begrifflich mit lastmod, und priority sei „a heavily subjective field
 * and based on our internal studies, it generally doesn't accurately reflect the
 * actual priority of a page relative to other pages on a site."
 *
 * Sie zu pflegen kostete Aufmerksamkeit und suggerierte eine Steuerung, die es
 * nicht gibt. Wer sie zurückholt, holt beides zurück.
 */
export interface RouteDefinition {
  path: string;
  /**
   * Darf die Seite in den Suchindex? `false` bedeutet: die Seite setzt
   * `noindex` in ihrer Metadata und gehört damit nicht in die Sitemap.
   */
  indexable: boolean;
  /**
   * Alias auf eine andere Route (gleicher Inhalt, Canonical zeigt woanders hin).
   * Aliase bleiben aus der Sitemap draußen, sonst entsteht Duplicate Content.
   */
  aliasOf?: string;
  /**
   * Datum der letzten inhaltlichen Aenderung. Das einzige Sitemap-Feld, das
   * Google auswertet — und nur, solange es stimmt: „it needs to consistently
   * match reality: if your page changed 7 years ago, but you're telling us in
   * the lastmod element that it changed yesterday, eventually we're not going to
   * believe you anymore" (Gary Illyes). Im Zweifel weglassen statt raten.
   */
  lastModified: string;
}

/**
 * Alle statischen Routen der Website. Dynamische Detailseiten
 * (`/referenzen/[slug]`, `/glossar/[slug]`, `/karriere/[slug]`) stehen hier
 * nicht — die Sitemap leitet sie aus den jeweiligen Datendateien ab, damit sie
 * nicht auseinanderlaufen können.
 *
 * Der Routen-Test in `src/lib/__tests__/routes.test.ts` gleicht diese Liste
 * gegen die tatsächlich vorhandenen `src/app/**\/page.tsx` ab. Eine Route, die
 * hier fehlt oder dort nicht existiert, lässt den Test fehlschlagen.
 */
export const siteRoutes: RouteDefinition[] = [
  { path: "/", indexable: true, lastModified: "2026-09-07" },

  // Warum? — die Übersicht ist indexierbar, die beiden Letter bleiben draußen,
  // solange sie Platzhaltertext tragen (isPlaceholder in sales-letters.ts).
  { path: "/warum", indexable: true, lastModified: "2026-08-05" },
  {
    path: "/warum-du-mit-ki-kein-geld-verdienst",
    indexable: false,
    lastModified: "2026-08-05",
  },
  {
    path: "/warum-unternehmen-mit-ki-kein-geld-verdienen",
    indexable: false,
    lastModified: "2026-08-05",
  },

  { path: "/leistungen", indexable: true, lastModified: "2026-09-07" },
  { path: "/ki-beratung-mittelstand", indexable: true, lastModified: "2026-09-02" },
  { path: "/solo", indexable: true, lastModified: "2026-09-07" },
  { path: "/enterprise", indexable: true, lastModified: "2026-09-07" },

  { path: "/referenzen", indexable: true, lastModified: "2026-09-07" },
  {
    path: "/gratis-wissen",
    indexable: true,
    lastModified: "2026-08-19",
  },
  /**
   * Autorenseiten. Angelegt am 19.08.2026 zusammen mit der Blog-Automatik.
   *
   * Sie sind kein Beiwerk: Googles Prüfliste für hilfreiche Inhalte fragt
   * ausdrücklich „Do bylines lead to further information about the author?",
   * und die Bewertungsanleitung stellt „first-hand or life experience" in den
   * Mittelpunkt von E-E-A-T. Beides lässt sich nur an einer benannten Person
   * festmachen. Die Detailseiten unter `/autoren/[slug]` leitet die Sitemap
   * aus `content/seo/autoren.json` ab.
   */
  { path: "/autoren", indexable: true, lastModified: "2026-08-19" },
  { path: "/haltung", indexable: true, lastModified: "2026-08-05" },
  { path: "/glossar", indexable: true, lastModified: "2026-08-05" },
  { path: "/kontakt", indexable: true, lastModified: "2026-08-05" },

  // Stellenanzeigen sind noch Platzhalter (isPlaceholder in jobs.ts). Bis echte
  // Stellen drinstehen: kein Index — erfundene Stellenanzeigen in der Suche
  // ziehen echte Bewerbungen auf eine Stelle, die es nicht gibt.
  { path: "/karriere", indexable: false, lastModified: "2026-08-05" },

  {
    path: "/lass-uns-reden",
    indexable: true,
    lastModified: "2026-07-11",
  },
  {
    path: "/termin",
    indexable: true,
    aliasOf: "/lass-uns-reden",
    lastModified: "2026-07-11",
  },
  // Der Selbstcheck gehoert nicht zur Website: markenfreie Einzelseite, die
  // ausserhalb eingesetzt wird (siehe CLAUDE.md, "Markenfreier Selbstcheck").
  // Deshalb bewusst in keiner Navigation, nicht in der Sitemap und auf noindex
  // — dieselbe Behandlung wie die Kampagnenseiten /funnel und /fokus. Auch der
  // Routen-Test nimmt beide Pfade aus der Erreichbarkeitspruefung aus.
  {
    path: "/selbstcheck_eu_ai_act",
    indexable: false,
    lastModified: "2026-08-11",
  },
  {
    path: "/selbstcheck",
    indexable: false,
    aliasOf: "/selbstcheck_eu_ai_act",
    lastModified: "2026-08-11",
  },

  { path: "/impressum", indexable: true, lastModified: "2026-08-23" },
  { path: "/datenschutz", indexable: true, lastModified: "2026-07-10" },
  { path: "/agb", indexable: true, lastModified: "2026-07-10" },

  // Eingeloggter Bereich: eigene Domain (app.kitech-software.de über src/proxy.ts),
  // gehört nie in den Index.
  { path: "/app", indexable: false, lastModified: "2026-08-05" },

  // LinkedIn-"Featured"-Landingpages, je eigene Domain über src/proxy.ts
  // (funnel.kitech-software.de, fokus.kitech-software.de). Bewusst nicht in
  // mainNavigation/footerNavigation — reine Kampagnenseiten ohne
  // Website-internen Zugang, siehe Ausnahme im Routen-Test. noindex, solange
  // Pattern-Interrupt-Text Platzhalter ist (siehe src/data/funnel.ts, fokus.ts).
  { path: "/funnel", indexable: false, lastModified: "2026-08-11" },
  { path: "/fokus", indexable: false, lastModified: "2026-08-11" },
];

/**
 * Weiterleitungen aus `next.config.ts`. Hier gespiegelt, damit der Routen-Test
 * einen Link auf eine entfallene Adresse nicht als toten Link meldet — die
 * Adresse ist gültig, sie landet nur woanders.
 *
 * `/community` und `/skool` sind am 05.08.2026 entfallen (siehe CLAUDE.md,
 * Abschnitt "Entfernt"). Beide leiten auf die Startseite, statt ins Leere zu
 * laufen: die Adressen standen in der Navigation und wurden geteilt.
 *
 * Der Selbstcheck hat hier bewusst *keinen* Eintrag: seine alte Adresse
 * `/eu-ai-act-selbstcheck` laeuft seit dem 11.08.2026 auf eine 404, auf Ansage.
 * Die Seite soll auf der Website an keiner Stelle mehr vorkommen — auch nicht
 * als Weiterleitung.
 */
export const permanentRedirects: Record<string, string> = {
  "/skool": "/",
  "/community": "/",
};

/** Alle statischen Pfade als Menge — praktisch für Prüfungen. */
export const staticRoutePaths: string[] = siteRoutes.map((route) => route.path);
