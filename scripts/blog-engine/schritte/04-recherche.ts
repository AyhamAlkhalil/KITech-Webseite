import { MODELL_STRUKTUR, frage, type JsonSchema } from "../lib/claude.js";
import {
  FirecrawlKonfigFehler,
  pruefeUmgebung,
  seitenLesen,
  websucheMitInhalt,
} from "../lib/firecrawl.js";
import { melde, warne } from "../lib/protokoll.js";
import type {
  GeleseneSeite,
  RechercheErgebnis,
  SerpBild,
  ThemaAktualitaet,
} from "../lib/typen.js";

/**
 * Schritt 04 — Recherche: *Was steht dort tatsächlich drin?*
 *
 * Schritt 03 hat gesehen, wer auf der Ergebnisseite steht. Hier werden die
 * Seiten gelesen — und zwar aus einem einzigen Grund: um die Frage zu
 * beantworten, an der später alles hängt. *Was steht in unserem Artikel, das
 * nicht auf den ersten zehn Ergebnissen steht?* Ohne die Volltexte wäre das
 * eine Vermutung.
 *
 * Was hier entsteht, sind drei Listen: die Themen, an denen niemand
 * vorbeikommt, die Fragen, die keiner beantwortet — und die Zahlen, die im
 * Artikel zitiert werden dürfen. Genau diese drei und sonst nichts.
 */

/**
 * Wie viele Seiten gelesen werden.
 *
 * Zwei Gründe für die Grenze, und der zweite ist der wichtigere:
 *
 * 1. **Preis.** Jede Seite kostet einen Firecrawl-Credit. Bei täglicher
 *    Produktion ist der Unterschied zwischen sechs und zehn Seiten je Artikel
 *    am Monatsende ein Drittel der Rechnung.
 * 2. **Ertrag.** Ab der siebten Seite wiederholt sich der Konsens. Die Seiten
 *    auf den Plätzen 7 bis 10 sind fast immer dieselben Definitionen in anderen
 *    Worten — sie verschieben weder die Pflichtthemen noch die Lücken, sondern
 *    bestätigen nur, was die ersten sechs schon gesagt haben. Was sie
 *    zuverlässig tun: die Eingabe an das Modell verlängern und damit die
 *    Tokenkosten.
 */
const SEITEN_MAX = 6;

/**
 * Wie viel Text je Seite an das Modell geht.
 *
 * Der Anfang eines Ratgebertextes trägt die Definitionen und die Gliederung,
 * das Ende die Wiederholung und den Call-to-Action. 8.000 Zeichen sind bei
 * sechs Seiten rund 12.000 Token Eingabe — genug, um Zahlen mit Quellenangabe
 * auch im Mittelteil zu erwischen, und wenig genug, um nicht für Fußzeilen zu
 * zahlen.
 */
const AUSZUG_ZEICHEN = 8_000;

/**
 * Unter dieser Wortzahl gilt eine Seite als nicht gelesen.
 *
 * Firecrawl liefert bei Cookie-Wänden, Login-Schranken und leeren
 * Single-Page-Apps einen Erfolg mit 40 Wörtern Text zurück. Wer das nicht
 * aussortiert, füttert das Modell mit „Wir verwenden Cookies" und bekommt
 * daraus Pflichtthemen.
 */
const MINDEST_WORTZAHL = 200;

/** Mehr Belege verarbeitet ein Artikel nicht; das Schema erlaubt 15 Quellen insgesamt. */
const BELEGE_MAX = 10;

const PFLICHTTHEMEN_MAX = 12;
const LUECKEN_MAX = 10;

/**
 * Ausgabegrenze für die Auswertung.
 *
 * Es entstehen drei kurze Listen, keine Prosa — 4.000 Token sind das Doppelte
 * dessen, was eine volle Antwort braucht. Höher anzusetzen kostet nichts,
 * solange das Modell kürzer bleibt, verdeckt aber einen abgeschnittenen
 * Auftrag: Wenn die Antwort ins Limit läuft, ist der Prompt kaputt und nicht
 * das Limit zu klein.
 */
const ANTWORT_TOKEN_MAX = 4_000;

/* -------------------------------------------------------------------------- */
/* Textwerkzeug                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Zieht die Überschriften aus dem Markdown einer Seite.
 *
 * Codeblöcke werden übersprungen: In einem Shell-Beispiel ist `# Datenbank
 * anlegen` ein Kommentar und keine Gliederungsebene. Ohne diese Unterscheidung
 * landen Kommentarzeilen als angebliche H1 der Konkurrenz im Briefing.
 */
function ueberschriftenAus(markdown: string): string[] {
  const gefunden: string[] = [];
  let imCodeblock = false;

  for (const zeile of markdown.split(/\r?\n/)) {
    if (/^\s{0,3}(?:```|~~~)/.test(zeile)) {
      imCodeblock = !imCodeblock;
      continue;
    }
    if (imCodeblock) continue;

    const treffer = /^\s{0,3}(#{1,3})\s+(.+?)\s*#*\s*$/.exec(zeile);
    if (!treffer) continue;

    // Markdown-Auszeichnung und Linkklammern raus — im Briefing steht die
    // Überschrift, nicht ihre Formatierung.
    const text = treffer[2]
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[*_`]/g, "")
      .trim();

    if (text.length >= 3) gefunden.push(text);
  }

  return gefunden;
}

/** Median statt Durchschnitt: ein einzelner 8.000-Wörter-Ratgeber verzerrt sonst alles. */
function median(werte: number[]): number {
  if (werte.length === 0) return 0;
  const sortiert = [...werte].sort((a, b) => a - b);
  const mitte = Math.floor(sortiert.length / 2);
  return sortiert.length % 2 === 0
    ? Math.round((sortiert[mitte - 1] + sortiert[mitte]) / 2)
    : sortiert[mitte];
}

function host(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * PDFs bleiben draußen.
 *
 * Sie kosten dasselbe wie eine HTML-Seite, liefern aber Text ohne verlässliche
 * Überschriftenstruktur — und ein PDF auf Platz 4 ist meistens eine
 * Behördenbroschüre oder ein Whitepaper mit Registrierungsformular, also kein
 * Wettbewerber um dieselbe Suchanfrage.
 */
function istPdf(url: string): boolean {
  return /\.pdf(?:$|[?#])/i.test(url);
}

/* -------------------------------------------------------------------------- */
/* Auswertung durch das Modell                                                */
/* -------------------------------------------------------------------------- */

const ANTWORT_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    pflichtthemen: {
      type: "array",
      maxItems: PFLICHTTHEMEN_MAX,
      items: { type: "string" },
      description:
        "Themen, die auf mindestens der Hälfte der gelesenen Seiten vorkommen. Je ein kurzer Satz.",
    },
    luecken: {
      type: "array",
      maxItems: LUECKEN_MAX,
      items: { type: "string" },
      description:
        "Fragen, die auf KEINER der gelesenen Seiten beantwortet werden. Als Frage formuliert.",
    },
    belege: {
      type: "array",
      maxItems: BELEGE_MAX,
      items: {
        type: "object",
        properties: {
          aussage: { type: "string" },
          quelle: { type: "string" },
          url: { type: "string" },
        },
        required: ["aussage", "quelle", "url"],
        additionalProperties: false,
      },
    },
  },
  required: ["pflichtthemen", "luecken", "belege"],
  additionalProperties: false,
};

/**
 * Der Auftrag an das Modell.
 *
 * **Der Abschnitt über die Belege ist die wichtigste Stelle dieser Datei.** Er
 * ist der einzige Weg, auf dem eine fremde Zahl in einen Artikel gelangt. Das
 * Repo hat dafür eine harte Regel — *keine Zahl ohne Beleg* — und sie hat einen
 * juristischen Kern: Eine erfundene Marktzahl mit erfundener Quelle ist eine
 * irreführende geschäftliche Handlung und damit genau die Sorte Aussage, die
 * abgemahnt wird. Ein Modell, das gebeten wird, „Belege zu sammeln", liefert im
 * Zweifel eine plausible Zahl mit einer plausiblen Quelle. Deshalb steht hier
 * dreimal, dass ein leeres Ergebnis die richtige Antwort sein darf — und
 * deshalb prüft {@link belegeAus} anschließend noch einmal nach.
 */
const SYSTEM_PROMPT = [
  "Du wertest Rechercheergebnisse für einen deutschsprachigen Fachartikel aus.",
  "Du bekommst die Volltexte der Seiten, die für ein Keyword bei Google auf den vorderen",
  "Plätzen stehen, dazu die Fragen, die Google unter „Ähnliche Fragen“ einblendet.",
  "",
  "Du lieferst genau drei Listen:",
  "",
  "1. pflichtthemen — was auf MINDESTENS DER HÄLFTE der gelesenen Seiten vorkommt.",
  "   Das ist die Erwartung des Lesers: Wer darüber schreibt und das auslässt, wirkt",
  "   unvollständig. Je ein kurzer Satz, kein Marketington.",
  "",
  "2. luecken — Fragen, die auf KEINER der Seiten beantwortet werden. Nimm die Fragen",
  "   der Ergebnisseite und naheliegende Folgefragen („was kostet das im Betrieb“,",
  "   „wer ist zuständig, wenn es nachts abbricht“, „was passiert im Fehlerfall“).",
  "   Eine Frage, die irgendwo beantwortet wird, ist keine Lücke — auch nicht,",
  "   wenn die Antwort dort schlecht ist.",
  "",
  "3. belege — Zahlen, Studienergebnisse oder Fremdaussagen, die im Artikel zitiert",
  "   werden dürfen. Ein Beleg ist nur dann ein Beleg, wenn ALLE Bedingungen gelten:",
  "   • Die Aussage steht wörtlich in einem der gelesenen Texte.",
  "   • Dort ist eine Quelle benannt (Institut, Behörde, Studie, Unternehmen, Jahr).",
  "   • Es gibt eine URL, die in dem Text steht oder die Seite selbst ist.",
  "",
  "   ⚠️ Ergänze NICHTS aus deinem eigenen Wissen. Keine Zahl, die du „kennst“.",
  "   Keine Quelle, die du für wahrscheinlich hältst. Keine URL, die es geben müsste.",
  "   Wenn keine einzige Aussage alle drei Bedingungen erfüllt, gib bei belege ein",
  "   leeres Array zurück. Ein leeres Array ist die richtige Antwort und kein",
  "   Versagen — eine erfundene Zahl ist ein Rechtsproblem.",
  "",
  "Antworte ausschließlich auf Deutsch.",
].join("\n");

function baueAuftrag(keyword: string, serp: SerpBild, gelesen: GeleseneSeite[]): string {
  const teile: string[] = [
    `Keyword: ${keyword}`,
    `Gelesene Seiten: ${gelesen.length}`,
    "",
  ];

  if (serp.fragen.length > 0) {
    teile.push("Fragen der Ergebnisseite („Ähnliche Fragen“):");
    for (const frage of serp.fragen) teile.push(`- ${frage}`);
    teile.push("");
  }

  gelesen.forEach((seite, index) => {
    teile.push(`--- Seite ${index + 1}: ${seite.domain} ---`);
    teile.push(`Titel: ${seite.titel || "(ohne Titel)"}`);
    if (seite.datum) teile.push(`Erschienen: vor ${seite.datum} — das ist eine aktuelle Meldung.`);
    teile.push(`URL: ${seite.url}`);
    if (seite.ueberschriften.length > 0) {
      teile.push(`Überschriften: ${seite.ueberschriften.join(" | ")}`);
    }
    teile.push("Text:");
    teile.push(seite.inhalt.slice(0, AUSZUG_ZEICHEN));
    teile.push("");
  });

  return teile.join("\n");
}

/** Aus einer unbekannten Antwort eine saubere, entdoppelte Textliste machen. */
function textliste(roh: unknown, hoechstens: number): string[] {
  if (!Array.isArray(roh)) return [];
  const sauber: string[] = [];

  for (const eintrag of roh) {
    if (typeof eintrag !== "string") continue;
    const wert = eintrag.trim();
    if (wert.length < 8) continue;
    if (sauber.some((vorhanden) => vorhanden.toLowerCase() === wert.toLowerCase())) continue;
    sauber.push(wert);
    if (sauber.length >= hoechstens) break;
  }

  return sauber;
}

/**
 * Prüft die Belege des Modells gegen das, was tatsächlich gelesen wurde.
 *
 * Das Schema erzwingt die Form, nicht die Wahrheit. Diese Funktion ist die
 * zweite Sicherung: Eine Belegstelle wird nur übernommen, wenn ihre URL
 * entweder zu einer der gelesenen Seiten gehört oder in einem der gelesenen
 * Texte wirklich vorkommt.
 *
 * Der zweite Fall ist bewusst erlaubt und keine Nachlässigkeit: Die wertvollen
 * Belege sind gerade die, bei denen ein Ratgeber die Primärquelle verlinkt
 * (Statistisches Bundesamt, Bitkom, ein Amtsblatt). Auf die Primärquelle zu
 * verweisen ist besser, als den Ratgeber zu zitieren, der sie abgeschrieben hat
 * — solange der Link nachweislich dort stand.
 */
function belegeAus(
  roh: unknown,
  gelesen: GeleseneSeite[],
): Array<{ aussage: string; quelle: string; url: string }> {
  if (!Array.isArray(roh)) return [];

  const bekannteHosts = new Set(gelesen.map((seite) => host(seite.url)).filter(Boolean));
  const volltexte = gelesen.map((seite) => seite.inhalt);
  const belege: Array<{ aussage: string; quelle: string; url: string }> = [];
  let verworfen = 0;

  for (const eintrag of roh) {
    if (typeof eintrag !== "object" || eintrag === null) continue;
    const satz = eintrag as Record<string, unknown>;

    const aussage = typeof satz.aussage === "string" ? satz.aussage.trim() : "";
    const quelle = typeof satz.quelle === "string" ? satz.quelle.trim() : "";
    const url = typeof satz.url === "string" ? satz.url.trim() : "";

    if (aussage.length < 10 || quelle.length < 3 || !/^https?:\/\//i.test(url)) {
      verworfen += 1;
      continue;
    }

    const belegHost = host(url);
    const nachweisbar =
      Boolean(belegHost) &&
      (bekannteHosts.has(belegHost) || volltexte.some((text) => text.includes(url)));

    if (!nachweisbar) {
      verworfen += 1;
      continue;
    }

    if (belege.some((vorhanden) => vorhanden.aussage.toLowerCase() === aussage.toLowerCase())) {
      continue;
    }

    belege.push({ aussage, quelle, url });
    if (belege.length >= BELEGE_MAX) break;
  }

  if (verworfen > 0) {
    warne(
      `Recherche: ${verworfen} Beleg(e) verworfen — die Quelle war in keinem der gelesenen ` +
        "Texte nachweisbar. Genau so entstehen erfundene Marktzahlen; sie bleiben draußen.",
    );
  }

  return belege;
}

/* -------------------------------------------------------------------------- */
/* Schritt                                                                    */
/* -------------------------------------------------------------------------- */

function leeresErgebnis(keyword: string, gelesen: GeleseneSeite[] = []): RechercheErgebnis {
  return {
    keyword,
    gelesen,
    pflichtthemen: [],
    luecken: [],
    belege: [],
    medianWortzahl: median(gelesen.map((seite) => seite.wortzahl)),
  };
}

/**
 * Liest die rankenden Seiten und leitet daraus Pflichtthemen, Lücken und
 * zitierfähige Belege ab.
 *
 * Fehlt der Firecrawl-Schlüssel, gibt die Funktion ein leeres Ergebnis zurück
 * und warnt. Der Lauf geht weiter: Der Eigenanteil aus dem Vorrat — das, was
 * den Artikel überhaupt rechtfertigt — steht auch ohne Wettbewerbsanalyse. Was
 * fehlt, ist das Wissen darüber, was die anderen schon gesagt haben.
 *
 * @param serp Ergebnis aus Schritt 03. Ohne Treffer wird nichts gelesen — und
 *   damit auch nichts bezahlt.
 * @param brief Nur das Zielkeyword; mehr braucht dieser Schritt nicht, und
 *   weniger Abhängigkeit heißt: er ist einzeln wiederholbar.
 */
/**
 * Wie viele frische Seiten bei einem Thema mit Aktualitätsbezug gelesen werden.
 *
 * Vier statt sechs: Eine Zeitsuche liefert zur selben Meldung oft dieselbe
 * Agenturmeldung in vier Aufmachungen. Der Ertrag fällt schneller ab als bei
 * einer normalen Ergebnisseite, der Preis nicht — Firecrawl rechnet Suche plus
 * Volltext, hier also rund sechs Credits.
 */
const AKTUELL_MAX = 4;

/**
 * Liegt eine relative Datumsangabe von Firecrawl im gewünschten Fenster?
 *
 * Firecrawl liefert bei der News-Quelle „8 hours ago", „3 days ago",
 * „2 months ago" — englisch, relativ, nicht normalisiert. Hier wird bewusst
 * nicht geparst, sondern nur die Einheit gelesen: Das reicht, um „letzte Woche"
 * von „letztes Jahr" zu unterscheiden, und es bricht nicht, wenn Firecrawl das
 * Format ändert. Was nicht erkannt wird, gilt als im Fenster — eine Warnung ist
 * kein Grund, eine lesbare Quelle wegzuwerfen.
 */
export function imFenster(datum: string, fenster: "qdr:d" | "qdr:w" | "qdr:m"): boolean {
  const wert = datum.toLowerCase();
  const grenze: Record<typeof fenster, RegExp> = {
    "qdr:d": /\b(minute|hour)s?\b/,
    "qdr:w": /\b(minute|hour|day)s?\b/,
    "qdr:m": /\b(minute|hour|day|week)s?\b/,
  };
  // „1 month ago" ist bei qdr:m die Kante — als drin gewertet, wie in der Suche.
  if (fenster === "qdr:m" && /^1\s+month/.test(wert)) return true;
  if (/\b(year|month|week|day|hour|minute)s?\b/.test(wert)) return grenze[fenster].test(wert);
  return true;
}

/**
 * Frische Seiten zu einem Thema mit Aktualitätsbezug.
 *
 * ⚠️ Das ist der **einzige** Weg, auf dem aktuelle Fakten in einen Artikel
 * kommen. Das schreibende Modell kennt nur seinen Trainingsstand und hält ihn
 * für die Gegenwart; die Suchergebnis-Recherche (Schritt 03/04) liefert, was
 * seit Jahren rankt — bei einer Meldung von letzter Woche also nichts. Ohne
 * diesen Aufruf entstünde ein „News"-Artikel aus dem Gedächtnis.
 *
 * Läuft **unabhängig von DataForSEO**: Ist dort das Tagesbudget aufgebraucht,
 * reicht Schritt 03 ein leeres Suchergebnisbild weiter, und die Recherche hätte
 * sonst keine einzige Adresse.
 *
 * Ein Fehler hier bricht den Lauf nicht ab. Der Artikel entsteht dann aus dem,
 * was die reguläre Recherche hergibt — und die Warnung steht im Protokoll.
 */
async function aktuelleSeiten(
  aktualitaet: ThemaAktualitaet,
  keyword: string,
): Promise<GeleseneSeite[]> {
  try {
    /*
     * ⚠️ **Zwei Aufrufe, nicht einer.** Firecrawl liefert bei `tbs` zusammen mit
     * `scrapeOptions` **null Treffer** — kein Fehler, keine Meldung, eine leere
     * Liste. Nachgestellt am 05.09.2026, vier Versuche über zwei Suchanfragen
     * und zwei Zeitfenster: mit Volltext immer 0, ohne Volltext dieselbe Anfrage
     * mit Treffern. Wer hier `mitVolltext: true` einträgt, schaltet die
     * Aktualitätsrecherche stillschweigend ab.
     *
     * Also erst die Adressen holen, dann mit `seitenLesen` lesen — was ohnehin
     * die bessere Leseroutine ist: Sie erkennt Cookie-Wände, Abwehr und zu
     * kurze Seiten, was der Volltext aus der Suche nicht tut.
     */
    const treffer = await websucheMitInhalt(aktualitaet.suche, {
      limit: AKTUELL_MAX,
      quellen: ["news"],
      mitVolltext: false,
    });

    const brauchbar = treffer.filter((eintrag) => eintrag.url && !istPdf(eintrag.url));
    const adressen = brauchbar.map((eintrag) => eintrag.url);
    // Das Erscheinungsdatum kommt nur aus der Trefferliste, nicht aus der
    // gelesenen Seite — hier gemerkt, um es später zuzuordnen.
    const datumJeUrl = new Map(brauchbar.map((eintrag) => [eintrag.url, eintrag.datum]));

    if (adressen.length === 0) {
      warne(
        `Aktualität „${aktualitaet.suche}" (${aktualitaet.fenster}): kein Treffer im ` +
          "Zeitfenster. Bei einem Thema, dessen Wert an der Aktualität hängt, ist das ein " +
          "Grund, es heute nicht zu produzieren.",
      );
      return [];
    }

    const gelesen = await seitenLesen(adressen, { parallel: 3 });
    const seiten: GeleseneSeite[] = [];
    for (const eintrag of gelesen) {
      if (eintrag.ok === false) {
        warne(`Aktualität: ${eintrag.url} nicht lesbar — ${eintrag.fehler}`);
        continue;
      }
      const seite = eintrag.seite;
      if (seite.blockiert || seite.wortzahl < MINDEST_WORTZAHL) {
        warne(
          `Aktualität: ${seite.url} unbrauchbar ` +
            `(${seite.blockiert ? `abgewehrt, HTTP ${seite.statusCode}` : `${seite.wortzahl} Wörter`}).`,
        );
        continue;
      }
      seiten.push({
        url: seite.url,
        domain: host(seite.url),
        titel: seite.titel,
        inhalt: seite.markdown,
        wortzahl: seite.wortzahl,
        ueberschriften: ueberschriftenAus(seite.markdown),
        datum: datumJeUrl.get(seite.url) || undefined,
      });
    }

    if (seiten.length === 0) {
      warne(
        `Aktualität „${aktualitaet.suche}": ${adressen.length} Adresse(n) gefunden, aber ` +
          "keine davon lesbar. Der Artikel entsteht ohne frische Quellen.",
      );
      return [];
    }

    melde(
      `Aktualität „${aktualitaet.suche}": ${seiten.length} frische Seite(n) gelesen — ` +
        seiten.map((seite) => `${seite.domain} (${seite.datum || "ohne Datum"})`).join(", "),
    );

    const zuAlt = seiten.filter((seite) => seite.datum && !imFenster(seite.datum, aktualitaet.fenster));
    if (zuAlt.length === seiten.length) {
      warne(
        `Aktualität „${aktualitaet.suche}": keine Quelle liegt im Fenster ${aktualitaet.fenster} — ` +
          `älteste bis jüngste: ${seiten.map((seite) => seite.datum).join(", ")}. ` +
          "Der Artikel entsteht, aber der Aufhänger ist nicht mehr aktuell.",
      );
    } else if (zuAlt.length > 0) {
      warne(
        `Aktualität: ${zuAlt.length} von ${seiten.length} Quellen liegen ausserhalb von ` +
          `${aktualitaet.fenster} (${zuAlt.map((seite) => seite.datum).join(", ")}).`,
      );
    }

    return seiten;
  } catch (problem: unknown) {
    warne(
      `Aktualität „${aktualitaet.suche}": Zeitsuche fehlgeschlagen — ` +
        `${problem instanceof Error ? problem.message : String(problem)}. ` +
        "Der Artikel entsteht ohne frische Quellen.",
    );
    return [];
  }
}

export async function recherchiere(
  serp: SerpBild,
  brief: { zielKeyword: string; aktualitaet?: ThemaAktualitaet },
): Promise<RechercheErgebnis> {
  const keyword = brief.zielKeyword.trim() || serp.keyword;

  try {
    pruefeUmgebung();
  } catch (problem: unknown) {
    if (problem instanceof FirecrawlKonfigFehler) {
      warne(
        `Recherche „${keyword}": kein Firecrawl-Schlüssel — der Artikel entsteht ohne ` +
          "Kenntnis der Konkurrenztexte. " +
          problem.message,
      );
      return leeresErgebnis(keyword);
    }
    throw problem;
  }

  // Frische Quellen zuerst: Sie sind der Grund, aus dem dieses Thema heute
  // läuft, und sie hängen nicht am DataForSEO-Budget. Ihre Domains sind danach
  // gesperrt — dieselbe Meldung ein zweites Mal zu lesen kostet einen Credit
  // und bringt kein Wort.
  const frisch = brief.aktualitaet ? await aktuelleSeiten(brief.aktualitaet, keyword) : [];

  // Je Domain nur eine Seite: Zwei Unterseiten desselben Ratgebers zählen als
  // ein Wettbewerber, kosten aber zwei Credits und verschieben die
  // „Hälfte der Seiten"-Schwelle bei den Pflichtthemen.
  const gesehen = new Set<string>(frisch.map((seite) => seite.domain).filter(Boolean));
  // Frische Seiten zählen gegen dasselbe Budget: Sechs Volltexte sind rund
  // 12.000 Token Eingabe, und die zahlt jeder Lauf. Mindestens zwei
  // Wettbewerberseiten bleiben trotzdem — ohne sie fehlt die Vergleichsgröße,
  // an der die Lücken überhaupt erkannt werden.
  const serpMax = Math.max(2, SEITEN_MAX - frisch.length);

  const urls: string[] = [];
  for (const treffer of serp.treffer) {
    if (urls.length >= serpMax) break;
    if (!treffer.url || istPdf(treffer.url)) continue;
    const domain = host(treffer.url) || treffer.domain;
    if (!domain || gesehen.has(domain)) continue;
    gesehen.add(domain);
    urls.push(treffer.url);
  }

  if (urls.length === 0 && frisch.length === 0) {
    warne(
      `Recherche „${keyword}": keine lesbare Adresse in den Suchergebnissen ` +
        "(nur PDFs, oder die Ergebnisseite war leer).",
    );
    return leeresErgebnis(keyword);
  }

  if (urls.length > 0) melde(`Recherche „${keyword}": ${urls.length} Seite(n) werden gelesen.`);

  const ergebnisse = urls.length > 0 ? await seitenLesen(urls, { parallel: 3 }) : [];
  const gelesen: GeleseneSeite[] = [...frisch];

  for (const eintrag of ergebnisse) {
    if (eintrag.ok === false) {
      warne(`Recherche: ${eintrag.url} nicht lesbar — ${eintrag.fehler}`);
      continue;
    }
    const seite = eintrag.seite;
    if (seite.blockiert) {
      // Ein erneuter Versuch kostet denselben Credit und ändert nichts, solange
      // die Gegenseite blockt.
      warne(`Recherche: ${seite.url} hat abgewehrt (HTTP ${seite.statusCode}).`);
      continue;
    }
    if (seite.wortzahl < MINDEST_WORTZAHL) {
      warne(
        `Recherche: ${seite.url} lieferte nur ${seite.wortzahl} Wörter — vermutlich Cookie-Wand ` +
          "oder Login-Schranke, wird nicht ausgewertet.",
      );
      continue;
    }

    gelesen.push({
      url: seite.url,
      domain: host(seite.url),
      titel: seite.titel,
      inhalt: seite.markdown,
      wortzahl: seite.wortzahl,
      ueberschriften: ueberschriftenAus(seite.markdown),
    });
  }

  if (gelesen.length === 0) {
    warne(
      `Recherche „${keyword}": keine einzige Seite war auswertbar. Das Modell wird nicht ` +
        "gefragt — ohne Texte gäbe es nur erfundene Pflichtthemen und erfundene Belege.",
    );
    return leeresErgebnis(keyword);
  }

  let antwort: unknown;
  try {
    antwort = await frage<unknown>({
      modell: MODELL_STRUKTUR,
      system: SYSTEM_PROMPT,
      nachricht: baueAuftrag(keyword, serp, gelesen),
      schema: ANTWORT_SCHEMA,
      maxTokens: ANTWORT_TOKEN_MAX,
      zweck: "recherche",
    });
  } catch (problem: unknown) {
    warne(
      `Recherche „${keyword}": die Auswertung durch das Modell ist fehlgeschlagen — ` +
        "die gelesenen Seiten bleiben erhalten, Pflichtthemen und Lücken fehlen. " +
        (problem instanceof Error ? problem.message : String(problem)),
    );
    return leeresErgebnis(keyword, gelesen);
  }

  const gerueste = typeof antwort === "object" && antwort !== null ? (antwort as Record<string, unknown>) : {};

  const ergebnis: RechercheErgebnis = {
    keyword,
    gelesen,
    pflichtthemen: textliste(gerueste.pflichtthemen, PFLICHTTHEMEN_MAX),
    luecken: textliste(gerueste.luecken, LUECKEN_MAX),
    belege: belegeAus(gerueste.belege, gelesen),
    medianWortzahl: median(gelesen.map((seite) => seite.wortzahl)),
  };

  melde(
    `Recherche „${keyword}": ${gelesen.length} Seite(n) ausgewertet, ` +
      `${ergebnis.pflichtthemen.length} Pflichtthemen, ${ergebnis.luecken.length} Lücken, ` +
      `${ergebnis.belege.length} belegte Zahlen, Median ${ergebnis.medianWortzahl} Wörter.`,
  );

  if (ergebnis.luecken.length === 0) {
    warne(
      `Recherche „${keyword}": keine unbeantwortete Frage gefunden. Das Thema ist bereits ` +
        "erschöpfend behandelt — der Eigenanteil aus dem Vorrat muss den Artikel allein tragen.",
    );
  }

  return ergebnis;
}
