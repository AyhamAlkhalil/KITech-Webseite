import type { Artikel } from "../../../src/lib/wissen/schema";

/**
 * Der Vertrag zwischen den Schritten der Blog-Automatik.
 *
 * Jeder Schritt unter `schritte/` bekommt das Ergebnis des vorigen und gibt
 * seines zurück. Die Typen stehen hier zentral, damit ein Schritt geändert
 * werden kann, ohne die anderen zu lesen — und damit `lauf.ts` den Ablauf
 * zusammensteckt, statt ihn zu kennen.
 *
 * DIE REIHENFOLGE IST NICHT BELIEBIG:
 *
 *   01 Themenfindung   Was könnte man schreiben? (Vorrat + Keyword-Daten)
 *   02 Auswahl         Was schreibt man heute? (Bewertung, Dublettenschutz)
 *   03 SERP            Was steht schon da? (Top-Ergebnisse, Fragen der Nutzer)
 *   04 Recherche       Was steht dort tatsächlich drin? (Volltexte, Lücken)
 *   05 Brief           Was soll drinstehen, das dort nicht steht?
 *   06 Schreiben       Der Artikel
 *   07 Prüfen          Hausstil, Belege, Substanz — hartes Tor
 *   08 Verlinken       Der Artikel wird eingehängt, alte Artikel zeigen auf ihn
 *   09 Veröffentlichen Ablegen, bauen, ausliefern, melden
 *
 * Schritt 03 und 04 sind getrennt, weil sie unterschiedlich teuer sind: Eine
 * SERP-Abfrage kostet Bruchteile eines Cents, das Auslesen von zehn Seiten
 * kostet ein Vielfaches. Wer nach 03 abbricht, weil das Thema besetzt ist, hat
 * fast nichts ausgegeben.
 */

/* -------------------------------------------------------------------------- */
/* 01 Themenfindung                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Ein Thema aus dem Vorrat (`content/seo/themen-pool.json`).
 *
 * **Der Vorrat ist der Grund, warum diese Automatik verantwortbar ist.** Googles
 * Prüfliste für hilfreiche Inhalte nennt als Warnsignal wörtlich: „Are you
 * producing lots of content on many different topics in hopes that some of it
 * might perform well in search results?" Genau das entsteht, wenn eine Maschine
 * sich ihre Themen selbst aus Keyword-Vorschlägen zieht. Hier kommen sie aus
 * einer gepflegten Liste innerhalb weniger Themenfelder — und jedes trägt einen
 * Eigenanteil, den nur KITech hat.
 */
export interface ThemaImVorrat {
  /** Eindeutige Kennung im Vorrat. */
  id: string;
  /** Arbeitstitel. Der endgültige Titel entsteht beim Schreiben. */
  arbeitstitel: string;
  zielKeyword: string;
  /** Cluster-Slug aus `content/seo/cluster.json`. */
  cluster: string;
  /** Autor-Slug aus `content/seo/autoren.json`. */
  autor: string;

  /**
   * Der nicht generierbare Anteil — **ohne den wird nicht produziert**.
   *
   * Das ist die Stelle, an der ein Mensch etwas beisteuern muss, das keine
   * Recherche ersetzt: eine gemessene Zahl, eine Konfiguration aus einem echten
   * Projekt, eine Entscheidung mit Begründung, ein Fehler mit Kosten. Schritt 02
   * überspringt jedes Thema, dessen `substanz` leer ist.
   *
   * Googles eigene Formulierung dazu: nichts veröffentlichen, was „could easily
   * be produced by a generative AI model".
   */
  substanz: {
    art: Artikel["substanz"]["art"];
    beschreibung: string;
    herkunft: string;
    /**
     * Optionale Textbausteine, Zahlen oder Codeausschnitte, die wörtlich in den
     * Artikel dürfen. Von einem Menschen eingetragen und damit belegt.
     */
    material?: string[];
  } | null;

  /** Priorität, kleiner ist wichtiger. Steuert die Reihenfolge in Schritt 02. */
  prioritaet: number;
  /** Frühestens ab diesem Datum sinnvoll (Stichtage, Saison). ISO. */
  fruehestens?: string;
  /** Danach nicht mehr veröffentlichen (abgelaufene Stichtage). ISO. */
  spaetestens?: string;
  /** Bereits produziert — Slug des entstandenen Artikels. */
  erledigt?: string;
  /** Notiz für den nächsten Menschen, der hier reinsieht. */
  notiz?: string;

  /**
   * Themen, deren Wert an der **Aktualität** hängt: ein neues Modell, eine
   * Ankündigung, eine Rechtsänderung von letzter Woche.
   *
   * Ist das Feld gesetzt, holt Schritt 04 zusätzlich zur Suchergebnis-Recherche
   * frische Seiten über eine Websuche mit Zeitfilter. Das ist der einzige Weg,
   * auf dem aktuelle Fakten überhaupt in einen Artikel kommen — das schreibende
   * Modell kennt sie nicht und kann sie nicht kennen.
   *
   * ⚠️ Das Feld ersetzt `substanz` **nicht**. Aktualität allein ist kein
   * Eigenanteil: „Modell X ist erschienen" steht am selben Tag auf hundert
   * Seiten. Die Meldung ist der Anlass, `substanz` ist der Artikel — eine eigene
   * Messung am neuen Modell, die gelesene Modellkarte, die Entscheidung, die
   * daraus folgt. Ein Thema mit `aktualitaet` und `substanz: null` wird genauso
   * wenig produziert wie jedes andere.
   */
  aktualitaet?: ThemaAktualitaet;
}

/** Siehe `ThemaImVorrat.aktualitaet`. Eigener Export, weil Schritt 04 ihn braucht. */
export interface ThemaAktualitaet {
  /**
   * Die Suchanfrage für die Zeitsuche. Bewusst getrennt vom `zielKeyword`:
   * Das Zielkeyword ist auf Suchvolumen optimiert („ki modelle vergleich"),
   * hier braucht es die Formulierung, unter der die Meldung tatsächlich
   * berichtet wird.
   */
  suche: string;
  /** Zeitfenster: Tag, Woche oder Monat. Firecrawl reicht es als `tbs` durch. */
  fenster: "qdr:d" | "qdr:w" | "qdr:m";
}

export interface KeywordDaten {
  keyword: string;
  suchvolumen: number | null;
  schwierigkeit: number | null;
  /** `informational` | `commercial` | `navigational` | `transactional` */
  intention: string | null;
  cpc: number | null;
}

export interface ThemenfindungErgebnis {
  /** Themen, die heute grundsätzlich in Frage kommen. */
  kandidaten: Array<ThemaImVorrat & { daten: KeywordDaten | null }>;
  /** Verwandte Suchbegriffe je Kandidat — Rohstoff für die Sekundärkeywords. */
  verwandte: Record<string, KeywordDaten[]>;
}

/* -------------------------------------------------------------------------- */
/* 02 Auswahl                                                                 */
/* -------------------------------------------------------------------------- */

export interface AuswahlErgebnis {
  gewaehlt: Array<ThemaImVorrat & { daten: KeywordDaten | null; sekundaer: string[] }>;
  /** Warum die anderen nicht drankamen — steht im Protokoll. */
  verworfen: Array<{ id: string; grund: string }>;
}

/* -------------------------------------------------------------------------- */
/* 03 SERP                                                                    */
/* -------------------------------------------------------------------------- */

export interface SerpTreffer {
  position: number;
  domain: string;
  titel: string;
  url: string;
  beschreibung: string;
}

export interface SerpBild {
  keyword: string;
  treffer: SerpTreffer[];
  /** Fragen aus „Ähnliche Fragen". Die stärksten Kandidaten für H2 und FAQ. */
  fragen: string[];
  /** Hervorgehobenes Ergebnis, falls vorhanden. */
  featuredSnippet: { titel: string; url: string; text: string } | null;
  /** Welche Elemente die Ergebnisseite zeigt — Hinweis auf die Erwartung. */
  merkmale: string[];
  /** Steht eine KI-Übersicht darüber? Dann ist mit weniger Klicks zu rechnen. */
  hatKiUebersicht: boolean;
  /**
   * Ist das Ergebnis von Portalen besetzt, gegen die eine kleine Domain nicht
   * ankommt (Behörden, große Verlage, Wikipedia)? Schritt 05 senkt dann die
   * Erwartung oder das Thema fällt raus.
   */
  aussichtslos: boolean;
}

/* -------------------------------------------------------------------------- */
/* 04 Recherche                                                               */
/* -------------------------------------------------------------------------- */

export interface GeleseneSeite {
  url: string;
  domain: string;
  titel: string;
  /** Volltext als Markdown. */
  inhalt: string;
  wortzahl: number;
  /** Überschriften der Seite — daraus entsteht das Bild der Konkurrenz. */
  ueberschriften: string[];
  /**
   * Wann die Seite erschien — nur bei Quellen aus der Aktualitätssuche gefüllt,
   * und dann relativ („8 hours ago"), so wie Firecrawl es liefert.
   *
   * Geht mit in den Auftrag an das Modell. Ohne die Angabe kann es eine frische
   * Meldung nicht von einem alten Ratgebertext unterscheiden — beides ist für
   * das Modell nur Text.
   */
  datum?: string;
}

export interface RechercheErgebnis {
  keyword: string;
  gelesen: GeleseneSeite[];
  /** Fragen, die überall beantwortet werden — die Pflichtthemen. */
  pflichtthemen: string[];
  /** Fragen, die nirgends beantwortet werden — die eigentliche Chance. */
  luecken: string[];
  /**
   * Belegbare Fremdzahlen mit Quelle, die im Artikel zitiert werden dürfen.
   * Jede muss aus einer der gelesenen Seiten stammen und dort mit Quelle stehen.
   */
  belege: Array<{ aussage: string; quelle: string; url: string }>;
  /** Durchschnittliche Länge der rankenden Seiten — Anhaltspunkt, keine Vorgabe. */
  medianWortzahl: number;
}

/* -------------------------------------------------------------------------- */
/* 05 Brief                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Das Redaktionsbriefing. Der Schritt, der über die Qualität entscheidet.
 *
 * Es entsteht aus SERP, Recherche und dem Eigenanteil aus dem Vorrat — und es
 * beantwortet vor dem Schreiben die eine Frage, an der sich alles entscheidet:
 * *Was steht hier drin, das nicht auf den ersten zehn Ergebnissen steht?*
 */
export interface Brief {
  themaId: string;
  titelVorschlaege: string[];
  zielKeyword: string;
  sekundaerKeywords: string[];
  cluster: string;
  autor: string;

  /** Wer liest das, und mit welcher Frage im Kopf? */
  leser: string;
  /** Die eine Aussage, die hängen bleiben soll. */
  kernthese: string;
  /** Was der Artikel liefert, das die Top-10 nicht liefern. Pflichtfeld. */
  eigenanteil: string;

  /** Gliederung: H2 als Frage oder Aussage, dazu was hineingehört. */
  gliederung: Array<{ heading: string; inhalt: string; istFrage: boolean }>;
  /** Fragen für den FAQ-Block, aus „Ähnliche Fragen" der Ergebnisseite. */
  fragen: string[];
  /** Zahlen mit Quelle, die verwendet werden dürfen — und nur diese. */
  belege: Array<{ aussage: string; quelle: string; url: string }>;
  /** Material aus dem Vorrat, das wörtlich verwendet werden darf. */
  material: string[];
  /** Vorschläge für interne Links: Ziel plus warum es hier passt. */
  verlinkungsziele: Array<{ ziel: string; anlass: string }>;
  /** Was in diesem Artikel nicht vorkommen darf (Abgrenzung zu Nachbarartikeln). */
  abgrenzung: string[];
  /** Anhaltspunkt für den Umfang, aus der Recherche abgeleitet. */
  zielWortzahl: number;
}

/* -------------------------------------------------------------------------- */
/* 06–07 Schreiben und Prüfen                                                 */
/* -------------------------------------------------------------------------- */

export interface SchreibErgebnis {
  artikel: Artikel;
  /** Wie oft nachgebessert wurde, bis die Prüfung durchging. */
  durchgaenge: number;
}

/* -------------------------------------------------------------------------- */
/* 08–09 Verlinken und Veröffentlichen                                        */
/* -------------------------------------------------------------------------- */

export interface VerlinkungsAenderung {
  /** Slug des Artikels, der geändert wird. */
  slug: string;
  ziel: string;
  ankertext: string;
  abschnitt: number | "intro";
}

export interface LaufProtokoll {
  /** Kennung des Laufs, z. B. `2026-08-19-1`. */
  id: string;
  gestartet: string;
  beendet?: string;
  modus: "entwurf" | "auto";
  themen: string[];
  /** Was tatsächlich entstanden ist. */
  artikel: Array<{
    slug: string;
    titel: string;
    status: Artikel["status"];
    durchgaenge: number;
    harteFehler: number;
    warnungen: number;
  }>;
  /** Was schiefging, in Klartext. */
  fehler: string[];
  kosten: {
    dataforseoUsd: number;
    firecrawlCredits: number;
    claudeTokenEin: number;
    claudeTokenAus: number;
  };
}
