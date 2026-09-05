/* Muss der erste Import bleiben: fuellt process.env aus .env, bevor ein
   anderes Modul nach einem Zugang fragt. Siehe lib/umgebung.ts. */
import "./lib/umgebung.js";
import { findeThemen } from "./schritte/01-themenfindung.js";
import { waehleThemen } from "./schritte/02-auswahl.js";
import { analysiereSerp } from "./schritte/03-serp.js";
import { recherchiere } from "./schritte/04-recherche.js";
import { erstelleBrief } from "./schritte/05-brief.js";
import { schreibeArtikel as verfasse } from "./schritte/06-schreiben.js";
import { pruefeUndBessere } from "./schritte/07-pruefen.js";
import { haengeEin } from "./schritte/08-verlinken.js";
import { legeAb } from "./schritte/09-ablegen.js";
import { veroeffentliche, pruefeBereitschaft } from "./lib/veroeffentlichen.js";
import { ladeAlleArtikel, markiereErledigt } from "./lib/artikel-io.js";
import {
  melde,
  warne,
  fehler,
  schritt,
  starteProtokoll,
  schreibeProtokoll,
  meldeAnWebhook,
} from "./lib/protokoll.js";
import { getAusgaben } from "./lib/dataforseo.js";
import { getVerbrauch } from "./lib/firecrawl.js";
import { getTokenverbrauch } from "./lib/claude.js";
import type { Artikel } from "../../src/lib/wissen/schema.js";

/**
 * Der tägliche Lauf der Blog-Automatik.
 *
 * ```
 * npm run blog:lauf                  # zwei Entwürfe
 * npm run blog:lauf -- --anzahl 3    # drei
 * npm run blog:lauf -- --trocken     # nichts schreiben, nur zeigen, was passieren würde
 * ```
 *
 * **Ohne `--auto` steht am Ende ein Entwurf.** Kein Commit, kein Deploy, nichts
 * Öffentliches. Die Begründung steht im Kopf von `schritte/09-ablegen.ts`.
 *
 * **Mit `--auto` läuft die Kette durch** — freigeben, committen, ausliefern,
 * an IndexNow melden. Was dabei aufgegeben wird und was ausdrücklich nicht,
 * steht im Kopf von `lib/veroeffentlichen.ts`. Kurz: die Prüfungen bleiben
 * vollständig und sind im Auto-Modus sogar härter (kein `--trotzdem`); was
 * entfällt, ist der Mensch, der sie auslöst. Der Modus ist eingerichtet, nicht
 * eingeschaltet: ohne `BLOG_ENGINE_FREIGABE_VON` veröffentlicht er nicht.
 *
 * **Der Lauf bricht bei einem einzelnen Thema nicht ab.** Schlägt die Recherche
 * für Thema zwei fehl, wird Thema drei trotzdem geschrieben. Was schiefging,
 * steht im Protokoll unter `content/seo/laeufe/`.
 *
 * **Fehlende Schlüssel machen den Lauf schlechter, nicht kaputt.** Ohne
 * DataForSEO fehlen Suchvolumen und Wettbewerbsbild, ohne Firecrawl die
 * Recherche in den rankenden Seiten. Nur ohne `ANTHROPIC_API_KEY` geht gar
 * nichts — dann gibt es niemanden, der schreibt.
 */

interface Argumente {
  anzahl: number;
  trocken: boolean;
  hilfe: boolean;
  /** Ein bestimmtes Thema aus dem Vorrat erzwingen, statt auszuwählen. */
  thema: string | null;
  /** Durchlaufen bis zur Veröffentlichung, statt beim Entwurf zu enden. */
  auto: boolean;
}

function leseArgumente(argv: string[]): Argumente {
  const args: Argumente = { anzahl: 2, trocken: false, hilfe: false, thema: null, auto: false };

  for (let i = 0; i < argv.length; i += 1) {
    const wert = argv[i];
    if (wert === "--anzahl") args.anzahl = Math.max(1, Number(argv[++i]) || 2);
    else if (wert === "--trocken") args.trocken = true;
    else if (wert === "--thema") args.thema = argv[++i] ?? null;
    else if (wert === "--auto") args.auto = true;
    else if (wert === "--hilfe" || wert === "-h") args.hilfe = true;
  }

  return args;
}

function zeigeHilfe(): void {
  process.stdout.write(
    [
      "",
      "Täglicher Lauf der Blog-Automatik.",
      "",
      "Ohne --auto endet er beim Entwurf: kein Commit, kein Deploy.",
      "Mit --auto läuft er bis zur ausgelieferten Seite durch.",
      "",
      "  npm run blog:lauf",
      "  npm run blog:lauf -- --anzahl 3",
      "  npm run blog:lauf -- --thema <id-aus-dem-vorrat>",
      "  npm run blog:lauf -- --trocken",
      "  npm run blog:lauf -- --anzahl 2 --auto",
      "",
      "Optionen:",
      "  --anzahl <n>   wie viele Artikel (Standard 2)",
      "  --thema <id>   ein bestimmtes Thema aus content/seo/themen-pool.json",
      "  --trocken      nur zeigen, was ausgewählt würde. Kostet nichts.",
      "  --auto         durchlaufen bis zur Veröffentlichung: freigeben,",
      "                 committen, schieben, deployen, an IndexNow melden.",
      "                 Verlangt BLOG_ENGINE_FREIGABE_VON; deployt nur mit",
      "                 BLOG_ENGINE_DEPLOY=1.",
      "",
      "Danach (ohne --auto):",
      "  Entwürfe lesen, dann npm run blog:freigeben -- <slug> --von \"Dein Name\"",
      "",
    ].join("\n")
  );
}

/** Kennung des Laufs: Datum plus laufende Nummer innerhalb des Tages. */
function laufId(): string {
  const jetzt = new Date();
  const monat = String(jetzt.getMonth() + 1).padStart(2, "0");
  const tag = String(jetzt.getDate()).padStart(2, "0");
  const zeit = `${String(jetzt.getHours()).padStart(2, "0")}${String(jetzt.getMinutes()).padStart(2, "0")}`;
  return `${jetzt.getFullYear()}-${monat}-${tag}-${zeit}`;
}

export async function main(): Promise<number> {
  const args = leseArgumente(process.argv.slice(2));

  if (args.hilfe) {
    zeigeHilfe();
    return 0;
  }

  /* Die Bereitschaft wird VOR dem ersten Aufruf geprüft, der Geld kostet. Ein
     Lauf, der zwei Artikel schreibt und dann an einer fehlenden Variablen
     scheitert, hat bezahlt und nichts erreicht. */
  if (args.auto) {
    const bereitschaft = pruefeBereitschaft();
    if (bereitschaft.bereit) {
      melde(`Auto-Modus: Freigabe läuft auf "${bereitschaft.von}".`);
    } else if (args.trocken) {
      /* Im Trockenlauf abbrechen wäre unfreundlich: Wer prüft, ob der Vorrat
         trägt, will das auch dann sehen, wenn der Auto-Modus noch nicht
         eingerichtet ist. Melden genügt — es kostet ja nichts. */
      warne(`--auto wäre jetzt nicht möglich: ${bereitschaft.grund}`);
    } else {
      fehler(`--auto ist verlangt, aber nicht möglich: ${bereitschaft.grund}`);
      return 1;
    }
  }

  const protokoll = starteProtokoll(laufId(), args.auto ? "auto" : "entwurf");
  const bestand = ladeAlleArtikel();
  const fertige: Artikel[] = [];

  melde(`Lauf ${protokoll.id} — Ziel: ${args.anzahl} Entwurf/Entwürfe`);
  melde(`Bestand: ${bestand.length} Artikel, davon ${bestand.filter((a) => a.status === "veroeffentlicht").length} veröffentlicht`);

  /* ---------------------------------------------------------------------- */
  schritt(1, "Themenfindung");
  /* ---------------------------------------------------------------------- */

  const gefunden = await findeThemen(Math.max(args.anzahl * 4, 8), args.anzahl);
  melde(`${gefunden.kandidaten.length} Kandidat(en) aus dem Vorrat`);

  /* ---------------------------------------------------------------------- */
  schritt(2, "Auswahl");
  /* ---------------------------------------------------------------------- */

  const auswahl = waehleThemen(gefunden, args.anzahl, bestand);

  for (const verworfen of auswahl.verworfen) {
    melde(`  übersprungen: ${verworfen.id} — ${verworfen.grund}`);
  }

  let gewaehlt = auswahl.gewaehlt;

  if (args.thema) {
    const erzwungen = gefunden.kandidaten.find((kandidat) => kandidat.id === args.thema);
    if (!erzwungen) {
      fehler(`Thema "${args.thema}" steht nicht im Vorrat oder ist bereits erledigt.`);
      return 1;
    }
    if (!erzwungen.substanz) {
      fehler(
        `Thema "${args.thema}" hat keinen belegten Eigenanteil. Das Tor gilt auch für ` +
          `erzwungene Themen — sonst wäre es keins. Trage substanz im Vorrat ein.`
      );
      return 1;
    }
    gewaehlt = [{ ...erzwungen, sekundaer: [] }];
  }

  if (gewaehlt.length === 0) {
    warne("Kein Thema mit belegtem Eigenanteil verfügbar. Heute erscheint nichts.");
    melde("");
    melde("Das ist kein Ausfall, sondern der vorgesehene Zustand. Googles eigene Prüfliste");
    melde("nennt es als Warnsignal, Inhalte zu veröffentlichen, nur damit die Website frisch");
    melde("wirkt — mit dem Klammersatz: (No, it won't).");
    melde("");
    melde("Was zu tun ist: content/seo/themen-pool.json öffnen und bei einem Thema das Feld");
    melde("substanz füllen. Was dort hineingehört, steht in");
    melde(".claude/skills/blog-seo/reference/substanz-gate.md");

    protokoll.fehler.push("Kein Thema mit Substanz verfügbar");
    beendeProtokoll(protokoll);
    return 0;
  }

  melde(`Gewählt: ${gewaehlt.map((t) => t.id).join(", ")}`);
  protokoll.themen = gewaehlt.map((t) => t.id);

  if (args.trocken) {
    melde("");
    melde("Trockenlauf — hier wäre Schluss. Was passieren würde:");
    for (const thema of gewaehlt) {
      melde(`  • ${thema.arbeitstitel}`);
      melde(`    Keyword: ${thema.zielKeyword}`);
      melde(`    Eigenanteil: ${thema.substanz?.art} — ${thema.substanz?.beschreibung.slice(0, 90)}…`);
    }
    return 0;
  }

  /* ---------------------------------------------------------------------- */
  /* Je Thema: SERP, Recherche, Brief, Schreiben, Prüfen                     */
  /* ---------------------------------------------------------------------- */

  for (const [nummer, thema] of gewaehlt.entries()) {
    melde("");
    melde("═".repeat(72));
    melde(`Thema ${nummer + 1} von ${gewaehlt.length}: ${thema.arbeitstitel}`);
    melde("═".repeat(72));

    try {
      schritt(3, `Ergebnisseite zu „${thema.zielKeyword}"`);
      const serp = await analysiereSerp(thema.zielKeyword);

      if (serp.aussichtslos) {
        warne(
          `Die Ergebnisseite ist von sehr starken Domains besetzt. Der Artikel entsteht ` +
            `trotzdem — er zahlt dann auf das Thema und auf Zitierbarkeit ein, nicht auf ` +
            `Platz eins.`
        );
      }

      schritt(4, "Recherche in den rankenden Seiten");
      const recherche = await recherchiere(serp, {
        zielKeyword: thema.zielKeyword,
        aktualitaet: thema.aktualitaet,
      });
      melde(
        `${recherche.gelesen.length} Seite(n) gelesen, ${recherche.luecken.length} Lücke(n), ` +
          `${recherche.belege.length} belegbare Fremdzahl(en)`
      );

      schritt(5, "Redaktionsbriefing");
      /* ⚠️ Kein Artikel ohne gelesene Konkurrenz.
       *
       * Bleibt die Recherche leer, setzt `zielWortzahl(0)` still auf 900 statt
       * auf den gemessenen Median, und der Schreib-Prompt bestellt woertlich
       * „Keine Belege. Der Artikel enthaelt keine einzige Fremdzahl". Genau so
       * entstand am 31.08.2026 ein 815-Woerter-Text ohne eine einzige Zahl —
       * der war kein Ausrutscher des Modells, sondern die praezise Ausfuehrung
       * eines Auftrags, den niemand haette erteilen duerfen.
       *
       * Ein Tag ohne Artikel ist der dokumentierte Normalzustand. Ein
       * quellenloser Artikel ist es nicht. Das Thema bleibt im Vorrat. */
      if (recherche.gelesen.length === 0 && recherche.belege.length === 0) {
        warne(
          `Thema "${thema.id}" uebersprungen: keine einzige Seite gelesen, keine Belege. ` +
            `Ohne Konkurrenzbild kann der Artikel die Frage nicht beantworten, ` +
            `was hier steht, das nicht auf den ersten zehn Ergebnissen steht.`
        );
        protokoll.fehler.push(
          `${thema.id}: uebersprungen — Recherche leer (0 Seiten, 0 Belege). ` +
            `Meist ist das Tagesbudget vorher erschoepft; siehe Kosten im Protokoll.`
        );
        continue;
      }

      const brief = await erstelleBrief(thema, serp, recherche);
      melde(`Eigenanteil laut Briefing: ${brief.eigenanteil}`);

      schritt(6, "Schreiben");
      const roh = await verfasse(brief, thema, [...bestand, ...fertige]);

      schritt(7, "Prüfen und nachbessern");
      const geprueft = await pruefeUndBessere(roh, brief, bestand);

      const befundZahl = { hart: 0, weich: 0 };
      try {
        const { pruefeArtikel } = await import("./lib/qualitaet.js");
        const befund = pruefeArtikel(geprueft.artikel);
        befundZahl.hart = befund.harteFehler.length;
        befundZahl.weich = befund.warnungen.length;
      } catch {
        /* Die Zahlen sind nur fürs Protokoll — sie dürfen den Lauf nicht kippen. */
      }

      if (befundZahl.hart > 0) {
        warne(
          `${befundZahl.hart} harte Befund(e) bleiben nach ${geprueft.durchgaenge} Durchgang/` +
            `Durchgängen stehen. Der Entwurf wird trotzdem abgelegt — ein Mensch entscheidet.`
        );
      }

      schritt(8, "In den Bestand einhängen");
      const aenderungen = await haengeEin(geprueft.artikel, [...bestand, ...fertige]);
      melde(`${aenderungen.length} Bestandsartikel verweisen jetzt auf den neuen`);

      fertige.push(geprueft.artikel);
      markiereErledigt(thema.id, geprueft.artikel.slug);

      protokoll.artikel.push({
        slug: geprueft.artikel.slug,
        titel: geprueft.artikel.titel,
        status: "entwurf",
        durchgaenge: geprueft.durchgaenge,
        harteFehler: befundZahl.hart,
        warnungen: befundZahl.weich,
      });
    } catch (ausnahme) {
      const text = ausnahme instanceof Error ? ausnahme.message : String(ausnahme);
      fehler(`Thema "${thema.id}" abgebrochen: ${text}`);
      protokoll.fehler.push(`${thema.id}: ${text}`);
      /* Weiter mit dem nächsten Thema. Ein einzelner Fehlschlag darf den Lauf
         nicht beenden — sonst kostet ein blockierter Seitenabruf den ganzen Tag. */
    }
  }

  /* ---------------------------------------------------------------------- */
  schritt(9, "Ablegen und gegenprüfen");
  /* ---------------------------------------------------------------------- */

  if (fertige.length === 0) {
    warne("Kein Artikel fertig geworden. Einzelheiten im Protokoll.");
    beendeProtokoll(protokoll);
    return 1;
  }

  const ablage = await legeAb(fertige, { autoModus: args.auto });

  if (!ablage.testsGruen || !ablage.buildGruen) {
    fehler("Der Bestand ist nach dem Ablegen nicht stimmig. Ausgabe:");
    process.stdout.write((ablage.pruefausgabe ?? "") + "\n");
    protokoll.fehler.push("Tests oder Build nach dem Ablegen fehlgeschlagen");
    beendeProtokoll(protokoll);
    return 1;
  }

  if (!args.auto) {
    beendeProtokoll(protokoll);
    return 0;
  }

  /* ---------------------------------------------------------------------- */
  schritt(10, "Freigeben und ausliefern");
  /* ---------------------------------------------------------------------- */

  const veroeffentlichung = await veroeffentliche(fertige, protokoll.id);

  /* Das Protokoll trägt den Status, den der Artikel am Ende wirklich hat —
     nicht den, den er beim Ablegen hatte. Wer morgen nachliest, warum ein
     Artikel nicht online ist, findet die Antwort hier und nicht erst in git. */
  for (const eintrag of protokoll.artikel) {
    if (veroeffentlichung.freigegeben.includes(eintrag.slug)) {
      eintrag.status = "veroeffentlicht";
    }
  }

  for (const abgelehnt of veroeffentlichung.blockiert) {
    protokoll.fehler.push(`${abgelehnt.slug} blieb Entwurf: ${abgelehnt.grund}`);
  }

  if (veroeffentlichung.abbruch) {
    protokoll.fehler.push(`Auslieferung: ${veroeffentlichung.abbruch}`);
  }

  melde("");
  melde(`Veröffentlicht: ${veroeffentlichung.freigegeben.length}`);
  melde(`Als Entwurf geblieben: ${veroeffentlichung.blockiert.length}`);
  melde(`Commit: ${veroeffentlichung.commit ?? "keiner"}`);
  melde(`Geschoben: ${veroeffentlichung.geschoben ? "ja" : "nein"}`);
  melde(`Deployt: ${veroeffentlichung.deployt ? "ja" : "nein"}`);
  melde(`IndexNow: ${veroeffentlichung.indexnowGemeldet ? "gemeldet" : "nicht gemeldet"}`);

  beendeProtokoll(protokoll);

  /* Rückgabe 1, sobald irgendetwas nicht durchlief — auch wenn Artikel
     entstanden sind. Der Cron-Dienst meldet dann einen Fehlschlag, und genau
     das soll er: ein Lauf, der zwei Artikel schreibt und keinen ausliefert, ist
     kein Erfolg. */
  const vollstaendig =
    veroeffentlichung.freigegeben.length > 0 &&
    veroeffentlichung.blockiert.length === 0 &&
    !veroeffentlichung.abbruch;

  return vollstaendig ? 0 : 1;
}

function beendeProtokoll(protokoll: ReturnType<typeof starteProtokoll>): void {
  protokoll.beendet = new Date().toISOString();

  const token = getTokenverbrauch();
  protokoll.kosten = {
    dataforseoUsd: getAusgaben().gesamtUsd,
    firecrawlCredits: getVerbrauch().credits,
    /* Zwischengespeicherte Eingabe zählt mit — sie ist billiger, aber nicht
       umsonst, und ein Protokoll, das sie verschweigt, unterschätzt den Lauf. */
    claudeTokenEin: token.ein + token.cacheGeschrieben + token.cacheGelesen,
    claudeTokenAus: token.aus,
  };

  const pfad = schreibeProtokoll(protokoll);

  melde("");
  melde("─".repeat(72));
  melde(`Protokoll: ${pfad}`);
  melde(
    `Kosten: DataForSEO ${protokoll.kosten.dataforseoUsd.toFixed(4)} USD · ` +
      `Firecrawl ${protokoll.kosten.firecrawlCredits} Credits · ` +
      `Claude ${protokoll.kosten.claudeTokenEin + protokoll.kosten.claudeTokenAus} Token`
  );

  void meldeAnWebhook(protokoll);
}

const direktAufgerufen = process.argv[1]?.includes("lauf");
if (direktAufgerufen) {
  main()
    .then((code) => process.exit(code))
    .catch((ausnahme: unknown) => {
      fehler(ausnahme instanceof Error ? ausnahme.message : String(ausnahme));
      process.exit(1);
    });
}
