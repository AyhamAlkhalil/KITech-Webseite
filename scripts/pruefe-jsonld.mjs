/**
 * Das ausgelieferte JSON-LD einer laufenden Website prüfen.
 *
 *   node scripts/pruefe-jsonld.mjs                       # gegen die Live-Domain
 *   node scripts/pruefe-jsonld.mjs http://127.0.0.1:8124 # gegen den Container
 *
 * **Warum das nicht als Unit-Test geht.** Die Schemas entstehen an mehreren
 * Stellen: in `StructuredData`-Aufrufen der Views, in Sammelfunktionen wie
 * `buildGlossaryIndexSchema()`, und in `PageShell` (Organisation + WebSite).
 * Was am Ende auf einer Seite steht, sieht man erst am gerenderten HTML.
 *
 * Genau so wurde am 23.08.2026 gefunden, dass `/glossar` **zwei**
 * BreadcrumbList-Knoten für denselben Pfad ausgab — einen aus der
 * Sammelfunktion, einen aus der View. Im Quelltext war das nicht zu sehen.
 *
 * Geprüft wird:
 *  - jeder Block ist gültiges JSON und hat `@context`
 *  - kein Typ, der auf einer Seite nur einmal vorkommen darf, kommt doppelt
 *  - jede `@id`-Referenz (`publisher`, `worksFor`, `isPartOf`, `about`) zeigt
 *    auf einen Knoten, der auf derselben Seite auch definiert ist
 */

const BASIS = process.argv[2] || "https://kitech-software.de";

/** Typen, die je Seite höchstens einmal vorkommen dürfen. */
const NUR_EINMAL = ["BreadcrumbList", "Organization", "WebSite", "WebPage", "ProfilePage", "CollectionPage"];

/** Felder, die per `@id` auf einen anderen Knoten zeigen. */
const VERWEISFELDER = ["publisher", "worksFor", "isPartOf", "author", "about", "mainEntityOfPage"];

const SEITEN = [
  "/", "/warum", "/leistungen", "/solo", "/enterprise", "/referenzen", "/haltung",
  "/kontakt", "/glossar", "/glossar/ki-audit", "/gratis-wissen",
  "/gratis-wissen/was-ein-ki-setup-im-betrieb-wirklich-ausmacht",
  "/gratis-wissen/thema/ki-strategie", "/autoren", "/autoren/ayham-alkhalil",
  "/impressum", "/datenschutz", "/agb", "/lass-uns-reden",
];

/** Alle JSON-LD-Knoten einer Seite, flach. */
async function knoten(pfad) {
  const html = await (await fetch(BASIS + pfad)).text();
  const roh = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const alle = [];
  for (const treffer of roh) {
    const wert = JSON.parse(treffer[1]);
    alle.push(...(Array.isArray(wert) ? wert : [wert]));
  }
  return alle;
}

/** Sammelt alle `@id`-Verweise eines Knotens rekursiv. */
function verweise(objekt, gefunden = []) {
  if (!objekt || typeof objekt !== "object") return gefunden;
  for (const [feld, wert] of Object.entries(objekt)) {
    if (VERWEISFELDER.includes(feld) && wert && typeof wert === "object" && !Array.isArray(wert) && wert["@id"]) {
      gefunden.push({ feld, id: wert["@id"], eigenstaendig: Object.keys(wert).length > 1 });
    }
    if (wert && typeof wert === "object") verweise(wert, gefunden);
  }
  return gefunden;
}

let befunde = 0;
let geprueft = 0;

for (const pfad of SEITEN) {
  let alle;
  try {
    alle = await knoten(pfad);
  } catch (ursache) {
    console.log(`✗ ${pfad}: JSON-LD nicht lesbar — ${String(ursache.message).slice(0, 80)}`);
    befunde++;
    continue;
  }
  geprueft += alle.length;

  const meldungen = [];

  for (const k of alle) {
    if (!k["@context"]) meldungen.push(`Block ohne @context (@type ${k["@type"] ?? "?"})`);
  }

  /*
   * Typen rekursiv zählen, nicht nur auf oberster Ebene.
   *
   * Die flache Zählung sah nur die Blöcke selbst. Ein zweiter WebPage- oder
   * Organization-Knoten, der als Wert eines Feldes steckt — etwa in
   * `mainEntity`, `provider` oder `about` — kam dort nie an. Genau solche
   * eingebetteten Knoten sind aber die häufigste Quelle von Dubletten: Sie
   * entstehen, wenn jemand einen Verweis ausschreibt, statt per `@id` zu
   * zeigen.
   *
   * Eingebettete Knoten MIT `@id` zählen nicht als Dublette — sie verweisen
   * auf den definierten Knoten, statt einen zweiten aufzumachen. Das ist der
   * empfohlene Weg und darf nicht bestraft werden.
   */
  const zaehler = {};
  const zaehleTypen = (objekt) => {
    if (!objekt || typeof objekt !== "object") return;
    if (Array.isArray(objekt)) {
      for (const eintrag of objekt) zaehleTypen(eintrag);
      return;
    }
    const typ = objekt["@type"];
    /*
     * Gezählt werden nur Knoten OHNE `@id`. Ein Knoten mit `@id` ist ein
     * Verweis auf eine Entität, die anderswo definiert ist — auch dann, wenn
     * er zur Lesbarkeit `name` oder `url` mitträgt. Das ist der von Google
     * empfohlene Weg und darf nicht als Dublette gelten.
     *
     * Eine echte Dublette entsteht, wenn derselbe Typ ein zweites Mal ohne
     * Kennung auftaucht: Dann steht dort eine zweite, namenlose Entität, und
     * kein Verbraucher der Daten kann wissen, dass beide dasselbe meinen.
     */
    if (typeof typ === "string" && !objekt["@id"]) {
      zaehler[typ] = (zaehler[typ] ?? 0) + 1;
    }
    for (const wert of Object.values(objekt)) zaehleTypen(wert);
  };
  for (const k of alle) zaehleTypen(k);

  for (const typ of NUR_EINMAL) {
    if ((zaehler[typ] ?? 0) > 1) meldungen.push(`${typ} kommt ${zaehler[typ]}× vor — darf nur einmal`);
  }

  const ids = new Set(alle.map((k) => k["@id"]).filter(Boolean));
  for (const k of alle) {
    for (const v of verweise(k)) {
      /* Ein Verweis, der den Knoten selbst mitbringt, braucht kein Ziel. */
      if (v.eigenstaendig) continue;
      if (!ids.has(v.id)) meldungen.push(`${v.feld} zeigt auf ${v.id} — dieser Knoten fehlt auf der Seite`);
    }
  }

  if (meldungen.length) {
    console.log(`✗ ${pfad}`);
    for (const m of [...new Set(meldungen)]) console.log(`    ${m}`);
    befunde += meldungen.length;
  } else {
    console.log(`✓ ${pfad.padEnd(58)} ${alle.length} Knoten`);
  }
}

console.log(`\n${geprueft} JSON-LD-Knoten über ${SEITEN.length} Seiten, ${befunde} Befund(e).`);
process.exit(befunde ? 1 : 0);
