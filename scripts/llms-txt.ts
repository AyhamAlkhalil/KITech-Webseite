import fs from "node:fs";
import path from "node:path";
import { company, addressLine } from "../src/config/company.js";
import { angebot, CHECK_TAG, PLAETZE_PRO_WOCHE } from "../src/config/angebot.js";
import { siteRoutes } from "../src/config/navigation.js";
import { services, techStack } from "../src/data/services.js";
import {
  AGENTEN_AUSSAGE,
  AGENTEN_EINORDNUNG,
  agentenBeleg,
  bedienwege,
} from "../src/data/agentenfaehig.js";
import { principles, commitments } from "../src/data/principles.js";
import { clientResults } from "../src/data/client-results.js";
import { testimonials } from "../src/data/testimonials.js";
import { faq } from "../src/data/faq.js";
import { glossaryTerms } from "../src/data/glossary.js";
import {
  alleAutoren,
  alleCluster,
  artikelImCluster,
  veroeffentlichteArtikel,
} from "../src/lib/wissen/laden.js";

/**
 * Erzeugt `public/llms.txt` und `public/llms-full.txt`.
 *
 * ```
 * npm run llms
 * npm run llms -- --pruefen   # bricht ab, wenn die Dateien veraltet sind
 * ```
 *
 * ## Warum das ein Skript ist und keine gepflegte Datei
 *
 * Beide Dateien waren von Hand geschrieben und am **08.07.2026** zuletzt
 * angefasst worden. Am 20.08.2026 stand darin:
 *
 *   - die **ROI-Garantie** als Aufmacher („wird das vereinbarte ROI-Ziel nicht
 *     erreicht, zahlt der Kunde nicht") — am 12.08. von allen Seiten und am
 *     17.08. aus dem JSON-LD entfernt, hier aber weiter öffentlich abrufbar;
 *   - ein Testimonial von **„Frank Locke, Kanzlei Locke und Partner"**, das am
 *     02.08. aus `testimonials.ts` gelöscht wurde, weil es diesen Kunden nicht
 *     gibt. Erfundene Bewertungen sind nach Anhang zu § 3 Abs. 3 Nr. 23c UWG
 *     abmahnbar;
 *   - sechs Leistungen, die es seit dem 12.08. nicht mehr gibt;
 *   - eine **tote Calendly-Adresse**;
 *   - „§ 5 TMG" — das TMG ist seit Mai 2024 das DDG;
 *   - eine Seitenliste mit fünf Einträgen, in der `/gratis-wissen`, `/warum`,
 *     `/solo`, `/enterprise`, `/glossar` und `/autoren` allesamt fehlten.
 *
 * Nachweis, dass das wirkt: Eine Websuche nach „KITech Software Hannover" gab
 * am 20.08.2026 eine KI-Antwort zurück, die **wörtlich die Eröffnungszeile von
 * llms-full.txt** wiedergab und den alten Seitentitel zitierte. Diese Dateien
 * sind für abrufende Systeme leichter zu lesen als das HTML — und genau deshalb
 * ist eine veraltete Fassung teurer als gar keine.
 *
 * Zwei Dateien von Hand mit dem Rest der Website synchron zu halten,
 * funktioniert nachweislich nicht. Deshalb wird hier nichts mehr geschrieben,
 * sondern aus denselben Quellen abgeleitet, aus denen auch die Seiten kommen.
 *
 * ## Die eine Regel
 *
 * **Hier steht nur, was auf der Website steht.** Keine Kundennamen ohne
 * Eintrag in `client-results.ts`, keine Zitate ohne Eintrag in
 * `testimonials.ts`, keine Zahl, die nicht auf einer Seite sichtbar ist. Wer
 * eine Aussage in llms.txt haben will, trägt sie in die Datendatei ein — dann
 * erscheint sie auf der Seite *und* hier.
 */

const WURZEL = process.cwd();
export const ZIEL_KURZ = path.join(WURZEL, "public", "llms.txt");
export const ZIEL_LANG = path.join(WURZEL, "public", "llms-full.txt");

const BASIS = "https://kitech-software.de";

/**
 * Das Datum steht in beiden Dateien, damit ein abrufendes System den Stand
 * einordnen kann.
 *
 * Bewusst aus dem jüngsten `lastModified` der Routen abgeleitet und **nicht**
 * aus `new Date()`: Ein Zeitstempel, der bei jedem Lauf weiterspringt,
 * behauptet Aktualität, die es nicht gibt — dieselbe Überlegung, aus der in
 * `sitemap.ts` kein Build-Datum steht.
 */
function standDatum(): string {
  const daten = [
    ...siteRoutes.map((route) => route.lastModified),
    ...veroeffentlichteArtikel().map((artikel) => artikel.aktualisiert),
  ].filter(Boolean) as string[];

  return daten.sort().at(-1) ?? "2026-08-20";
}

/** `2026-08-20` → `20.08.2026`. */
function deutsch(iso: string): string {
  const [jahr, monat, tag] = iso.split("-");
  return `${tag}.${monat}.${jahr}`;
}

/* -------------------------------------------------------------------------- */
/* Bausteine, die beide Dateien brauchen                                      */
/* -------------------------------------------------------------------------- */

/**
 * Der Satz zum kostenlosen Angebot — aus `angebot.ts`, damit eine
 * Umbenennung wie die vom 12.08.2026 („Erstgespräch" → „1:1-KI-Check") hier
 * automatisch ankommt.
 *
 * ⚠️ Verlinkt wird `/lass-uns-reden`, **nicht** Calendly. Das ist die
 * CTA-Konvention des Projekts, und die alte Datei stand als Mahnmal dafür da:
 * Sie nannte eine Calendly-Adresse, die es nicht mehr gibt.
 */
function angebotsAbsatz(): string {
  return (
    `**${angebot.name}** — kostenlos, ${angebot.dauer}. ${angebot.beschreibung} ` +
    `Termine jeden ${CHECK_TAG}, ${PLAETZE_PRO_WOCHE} Plätze pro Woche. ` +
    `Buchung: ${BASIS}${angebot.href}`
  );
}

/** Referenzen so, wie sie auf den Karten stehen — Kennzahl, Label, ein Satz. */
function referenzZeilen(): string[] {
  return clientResults.map((fall) => {
    const teile = [
      `- **${fall.company}** (${fall.kategorie}): ${fall.headline.value} ${fall.headline.label}.`,
      fall.summary,
    ];
    if (fall.liveUrl) teile.push(`Live: ${fall.liveUrl}`);
    return teile.join(" ");
  });
}

/**
 * Kundenstimmen — ausschließlich aus `testimonials.ts`.
 *
 * Das ist die Stelle, an der die alte Datei einen Kunden erfunden hat. Sie hat
 * hier keine eigene Liste mehr.
 */
function stimmenZeilen(): string[] {
  return testimonials.map((stimme) => `- „${stimme.quote}" — ${stimme.author}, ${stimme.role}`);
}

/** Alle indexierbaren Seiten, ohne Alias-Routen. */
function seitenZeilen(beschreibungen: Record<string, string>): string[] {
  return siteRoutes
    .filter((route) => route.indexable && !route.aliasOf)
    .map((route) => {
      const text = beschreibungen[route.path];
      return `- [${route.path}](${BASIS}${route.path === "/" ? "" : route.path})${
        text ? `: ${text}` : ""
      }`;
    });
}

const SEITEN_TEXT: Record<string, string> = {
  "/": "Startseite: Positionierung, Kundenergebnisse, Team, häufige Fragen.",
  "/warum": "Einstieg zu den beiden Sales Lettern.",
  /* Ohne Zahl: services.ts ist am 04.09.2026 von vier auf fünf Schritte gewachsen,
     und diese Zeile stand danach falsch da. Eine Anzahl in einer Beschreibung
     veraltet bei jeder Inhaltsänderung und sucht ohnehin niemand. */
  "/leistungen":
    "Die Schritte einer Zusammenarbeit — Prozess-Audit, Power Automate und Power BI, KI-Agenten, Betrieb.",
  "/ki-beratung-mittelstand":
    "KI-Beratung für mittelständische Unternehmen: Audit, Use Cases, Automatisierung und Betrieb.",
  "/solo": "Für Selbstständige und kleine Teams.",
  "/enterprise": "Für Unternehmen mit bestehenden Systemen und Nachweispflichten.",
  "/referenzen": "Kundenprojekte mit Kennzahl, Zeitraum und — wo vorhanden — Live-Adresse.",
  "/gratis-wissen": "Artikel zu KI, Automatisierung und Software im Mittelstand.",
  "/autoren": "Wer die Artikel schreibt.",
  "/haltung": "Werte und Arbeitsweise.",
  "/kontakt": "Kontaktwege, bewusst ohne Formular.",
  "/glossar": "Begriffe aus KI-Projekten, kurz erklärt.",
  "/lass-uns-reden": `Terminbuchung für den ${angebot.kurz}.`,
  "/impressum": "Anbieterkennzeichnung nach § 5 DDG.",
  "/datenschutz": "Datenschutzerklärung nach DSGVO.",
  "/agb": "Allgemeine Geschäftsbedingungen.",
};

/* -------------------------------------------------------------------------- */
/* llms.txt — die kurze Fassung                                               */
/* -------------------------------------------------------------------------- */

export function baueKurz(): string {
  const artikel = veroeffentlichteArtikel();
  const autoren = alleAutoren();

  const zeilen: string[] = [
    `# ${company.shortName}`,
    "",
    `> ${company.tagline} Sitz in ${company.address.city}. ` +
      `Gebaut wird, was im Tagesgeschäft läuft — betrieben in europäischer Region über ` +
      `AWS oder Azure mit Auftragsverarbeitungsvertrag oder auf eigener Hardware.`,
    "",
    `Stand: ${deutsch(standDatum())}. Diese Datei wird aus den Datenquellen der Website ` +
      `erzeugt (\`npm run llms\`) und beschreibt deshalb denselben Stand wie die Seiten.`,
    "",
    "## Unternehmen",
    "",
    `- Firmierung: ${company.legalName}`,
    `- Marke: ${company.shortName}`,
    `- Geschäftsführer: ${company.founder.name}`,
    `- Anschrift: ${addressLine}, ${company.address.country}`,
    `- E-Mail: ${company.email.general}`,
    `- Telefon: ${company.phone.display}`,
    `- Handelsregister: ${company.registry.number} (${company.registry.court})`,
    `- USt-IdNr.: ${company.registry.vatId}`,
    `- LinkedIn (Geschäftsführer): ${company.founder.linkedinUrl}`,
    "",
    "## Kostenloses Angebot",
    "",
    angebotsAbsatz(),
    "",
    "## Leistungen",
    "",
  ];

  for (const leistung of services) {
    zeilen.push(`### ${leistung.step} ${leistung.title}`, leistung.description, "");
  }

  zeilen.push(
    "## Agentenfähig gebaut",
    "",
    ...agentenZeilen(),
    "",
    "## Referenzen",
    "",
    ...referenzZeilen(),
    "",
    "## Kundenstimmen",
    "",
    ...stimmenZeilen(),
    "",
    "## Themen, zu denen wir schreiben",
    ""
  );

  for (const cluster of alleCluster()) {
    const anzahl = artikelImCluster(cluster.slug).length;
    if (anzahl === 0) continue;
    zeilen.push(
      `- [${cluster.titel}](${BASIS}/gratis-wissen/thema/${cluster.slug}) — ${cluster.teaser} (${anzahl} Artikel)`
    );
  }

  zeilen.push("", "## Artikel", "");
  for (const eintrag of artikel) {
    const autor = autoren.find((a) => a.slug === eintrag.autor);
    zeilen.push(
      `- [${eintrag.titel}](${BASIS}/gratis-wissen/${eintrag.slug}) — ${eintrag.teaser}` +
        (autor ? ` (${autor.name}, ${deutsch(eintrag.datum)})` : "")
    );
  }

  zeilen.push(
    "",
    "## Seiten",
    "",
    ...seitenZeilen(SEITEN_TEXT),
    "",
    "## Maschinenlesbare Quellen",
    "",
    `- Ausführliche Fassung: ${BASIS}/llms-full.txt`,
    `- Sitemap: ${BASIS}/sitemap.xml`,
    `- Artikel-Feed: ${BASIS}/gratis-wissen/rss.xml`,
    ""
  );

  return zeilen.join("\n");
}

/**
 * Der Agentenzugang als eigener Abschnitt — in beiden Fassungen.
 *
 * ⚠️ Das ist die eine Aussage der Website, die in dieser Datei **stehen muss**:
 * Wer sie liest, ist die Maschine, über die der Abschnitt spricht. Eine
 * Behauptung über Agentenfähigkeit, die ein Agent nicht findet, widerlegt sich
 * beim Lesen selbst.
 *
 * Quelle ist `src/data/agentenfaehig.ts`, wie überall hier — es wird nichts
 * ergänzt, was nicht auf der Website steht.
 */
function agentenZeilen(): string[] {
  const zeilen = [AGENTEN_AUSSAGE, "", AGENTEN_EINORDNUNG, ""];
  for (const weg of bedienwege) zeilen.push(`- **${weg.titel}** — ${weg.text}`);
  /* Der Beleg-Satz ohne seine Adresse: Auf der Website führt er zu `llms.txt`,
     und dieser Verweis ist genau hier zirkulär — die Datei, die der Leser
     gerade offen hat. Die maschinenlesbaren Quellen stehen ohnehin weiter
     unten unter eigener Überschrift. */
  zeilen.push("", `${agentenBeleg.satz} Diese Datei ist der Beleg dafür.`);
  return zeilen;
}

/* -------------------------------------------------------------------------- */
/* llms-full.txt — die ausführliche Fassung                                   */
/* -------------------------------------------------------------------------- */

export function baueLang(): string {
  const artikel = veroeffentlichteArtikel();
  const autoren = alleAutoren();

  const zeilen: string[] = [
    `# ${company.shortName} — ausführliche Fassung`,
    "",
    `> ${company.tagline}`,
    "",
    `Stand: ${deutsch(standDatum())}. Erzeugt aus den Datenquellen der Website ` +
      `(\`npm run llms\`). Was hier steht, steht auch auf einer Seite.`,
    "",
    "---",
    "",
    "## 1. Unternehmen",
    "",
    `${company.legalName} ist ein Software- und KI-Unternehmen mit Sitz in ` +
      `${company.address.city}. Auftreten und Marke: ${company.shortName}. ` +
      `${company.tagline}`,
    "",
    `- Geschäftsführer: ${company.founder.name} (${company.founder.role})`,
    `- Anschrift: ${addressLine}, ${company.address.country}`,
    `- E-Mail allgemein: ${company.email.general}`,
    `- E-Mail Geschäftsführer: ${company.email.founder}`,
    `- Telefon: ${company.phone.display}`,
    `- Erreichbarkeit: ${company.availability}`,
    `- Handelsregister: ${company.registry.number}, ${company.registry.court}`,
    `- USt-IdNr.: ${company.registry.vatId}`,
    `- LinkedIn: ${company.founder.linkedinUrl}`,
    "",
    "---",
    "",
    "## 2. Das kostenlose Angebot",
    "",
    angebotsAbsatz(),
    "",
    "---",
    "",
    "## 3. Leistungen",
    "",
  ];

  for (const leistung of services) {
    zeilen.push(`### ${leistung.step} — ${leistung.title}`, "", leistung.description, "");
    for (const punkt of leistung.bullets) zeilen.push(`- ${punkt}`);
    if (leistung.bullets.length > 0) zeilen.push("");
  }

  /* Als Unterabschnitt von „Leistungen" und nicht als eigener Punkt: Die
     Nummerierung 1–13 steht in beiden Fassungen und in den Verweisen darauf;
     ein eingeschobener Punkt verschiebt zehn Überschriften für eine Angabe,
     die inhaltlich ohnehin beschreibt, wie die Leistungen ausgeliefert
     werden. */
  zeilen.push("### Agentenfähig gebaut", "", ...agentenZeilen(), "");

  zeilen.push("---", "", "## 4. Haltung", "");
  for (const grundsatz of principles) {
    zeilen.push(`### ${grundsatz.title}`, "", grundsatz.description, "");
  }

  if (commitments.length > 0) {
    zeilen.push("### Was wir zusagen", "");
    for (const zusage of commitments) zeilen.push(`- ${zusage}`);
    zeilen.push("");
  }

  zeilen.push("---", "", "## 5. Referenzen", "");
  for (const fall of clientResults) {
    zeilen.push(
      `### ${fall.company} — ${fall.kategorie}`,
      "",
      `- Ergebnis: **${fall.headline.value}** ${fall.headline.label}`,
      ...(fall.duration ? [`- Zeitraum: ${fall.duration}`] : []),
      ...(fall.before ? [`- Vorher: ${fall.before}`] : []),
      ...(fall.after ? [`- Nachher: ${fall.after}`] : []),
      ...(fall.liveUrl ? [`- Live im Einsatz: ${fall.liveUrl}`] : []),
      ...(fall.companyUrl ? [`- Kunde: ${fall.companyUrl}`] : []),
      "",
      fall.summary,
      ""
    );
    /* Offene Punkte werden mitgeführt, nicht versteckt. Sie sind der Grund,
       warum die Detailseite dieses Falls auf `noindex` steht — ein abrufendes
       System soll denselben Vorbehalt sehen wie ein Mensch im Repo. */
    if (fall.openPoints?.length) {
      zeilen.push(`Noch nicht belegt: ${fall.openPoints.join("; ")}.`, "");
    }
  }

  zeilen.push("---", "", "## 6. Kundenstimmen", "");
  zeilen.push(
    "Vollständig. Es gibt keine weiteren freigegebenen Zitate — was hier nicht steht, wurde nicht abgegeben.",
    ""
  );
  zeilen.push(...stimmenZeilen(), "");

  zeilen.push("---", "", "## 7. Häufige Fragen", "");
  for (const eintrag of faq) {
    zeilen.push(`**${eintrag.frage}**`, "", eintrag.antwort, "");
  }

  zeilen.push("---", "", "## 8. Technologie", "");
  zeilen.push(
    ...techStack.map((eintrag) => `- ${eintrag.name} (${eintrag.category})`),
    ""
  );

  zeilen.push("---", "", "## 9. Wer die Artikel schreibt", "");
  for (const autor of autoren) {
    const eigene = artikel.filter((a) => a.autor === autor.slug).length;
    zeilen.push(
      `### ${autor.name} — ${autor.rolle}`,
      "",
      autor.kurzbeschreibung,
      "",
      `- Profil: ${BASIS}/autoren/${autor.slug}`,
      ...(autor.linkedinUrl ? [`- LinkedIn: ${autor.linkedinUrl}`] : []),
      `- Themen: ${autor.themen.join(", ")}`,
      `- Artikel: ${eigene}`,
      ""
    );
  }

  zeilen.push("---", "", "## 10. Artikel", "");
  for (const cluster of alleCluster()) {
    const imCluster = artikelImCluster(cluster.slug);
    if (imCluster.length === 0) continue;
    zeilen.push(`### ${cluster.titel}`, "", cluster.teaser, "");
    for (const eintrag of imCluster) {
      const autor = autoren.find((a) => a.slug === eintrag.autor);
      zeilen.push(
        `- **[${eintrag.titel}](${BASIS}/gratis-wissen/${eintrag.slug})** — ${eintrag.teaser}` +
          (autor ? ` (${autor.name}, ${deutsch(eintrag.datum)})` : "")
      );
    }
    zeilen.push("");
  }

  zeilen.push("---", "", "## 11. Glossar", "");
  for (const begriff of glossaryTerms) {
    zeilen.push(`- **[${begriff.term}](${BASIS}/glossar/${begriff.slug})**: ${begriff.shortDefinition}`);
  }

  zeilen.push(
    "",
    "---",
    "",
    "## 12. Seiten",
    "",
    ...seitenZeilen(SEITEN_TEXT),
    "",
    "---",
    "",
    "## 13. Maschinenlesbare Quellen",
    "",
    `- Kurzfassung: ${BASIS}/llms.txt`,
    `- Sitemap: ${BASIS}/sitemap.xml`,
    `- Artikel-Feed (RSS 2.0): ${BASIS}/gratis-wissen/rss.xml`,
    `- robots.txt: ${BASIS}/robots.txt`,
    ""
  );

  return zeilen.join("\n");
}

/* -------------------------------------------------------------------------- */

function main(): void {
  const nurPruefen = process.argv.includes("--pruefen");

  const kurz = baueKurz();
  const lang = baueLang();

  if (nurPruefen) {
    const abweichungen: string[] = [];
    for (const [datei, inhalt] of [
      [ZIEL_KURZ, kurz],
      [ZIEL_LANG, lang],
    ] as const) {
      const vorhanden = fs.existsSync(datei) ? fs.readFileSync(datei, "utf8") : null;
      if (vorhanden !== inhalt) abweichungen.push(path.relative(WURZEL, datei));
    }

    if (abweichungen.length > 0) {
      process.stderr.write(
        `Veraltet: ${abweichungen.join(", ")}\n` +
          `Die Datei(en) geben nicht den Stand der Website wieder. ` +
          `Mit \`npm run llms\` neu erzeugen und mitcommitten.\n`
      );
      process.exit(1);
    }

    process.stdout.write("llms.txt und llms-full.txt sind auf dem Stand der Website.\n");
    return;
  }

  fs.writeFileSync(ZIEL_KURZ, kurz, "utf8");
  fs.writeFileSync(ZIEL_LANG, lang, "utf8");

  process.stdout.write(
    `public/llms.txt      ${kurz.length} Zeichen\n` +
      `public/llms-full.txt ${lang.length} Zeichen\n` +
      `Stand: ${deutsch(standDatum())}\n`
  );
}

/* Nur ausfuehren, wenn die Datei direkt aufgerufen wird — der Test importiert
   `baueKurz`/`baueLang` und darf dabei nichts auf die Platte schreiben. */
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main();
}
