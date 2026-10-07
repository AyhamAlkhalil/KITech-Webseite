import { describe, expect, it } from "vitest";
import { siteRoutes } from "@/config/navigation";
import { clientResults } from "@/data/client-results";
import { alleCluster, veroeffentlichteArtikel } from "@/lib/wissen/laden";
import {
  STAND,
  VEROEFFENTLICHT,
  VERGLEICH_PFAD,
  WEITERLESEN_THEMEN,
  abschnitte,
  ausgangslagen,
  einleitung,
  fragen,
  kriterien,
  lead,
  methodik,
  plattformen,
  quellen,
  quellenNummer,
  seitentexte,
  sichtbareTexte,
  transparenzhinweis,
  ueberschrift,
  umsetzung,
} from "@/data/vergleich-prozessautomatisierung";
import { vergleichArtikelSchema, vergleichBreadcrumbSchema } from "@/lib/vergleich-schema";
import { MUSTER, saetze, woerter } from "../../../scripts/blog-engine/lib/qualitaet";

/**
 * Der Plattformvergleich unter `/vergleich/prozessautomatisierung`.
 *
 * Eine Vergleichsseite ist vergleichende Werbung (§ 6 UWG), sobald der
 * Herausgeber selbst am Markt ist — und die Darlegungslast für jede Angabe über
 * einen Mitbewerber liegt beim Werbenden. Deshalb steht hier unter Test, was
 * die Seite belastbar macht: gleiche Gliederung für alle, jede Herstellerangabe
 * mit Quelle und Abrufdatum, keine Beträge, keine Rangfolge, und eigene
 * Erfahrung nur dort, wo es sie gibt — sauber getrennt in Kundenfall, eigenen
 * Betrieb und Bauweise.
 */

describe("Gleiche Kriterien für alle", () => {
  it("vergleicht sechs Plattformen", () => {
    expect(plattformen).toHaveLength(6);
  });

  it("ordnet alphabetisch — keine Rangfolge", () => {
    const namen = plattformen.map((p) => p.name);
    const sortiert = [...namen].sort((a, b) => a.localeCompare(b, "de", { sensitivity: "base" }));
    expect(namen, "Die Reihenfolge ist auf der Seite als alphabetisch ausgewiesen").toEqual(sortiert);
  });

  it("gibt jeder Plattform dieselbe Gliederung", () => {
    for (const p of plattformen) {
      expect(p.staerken, `${p.name}: Stärken`).toHaveLength(3);
      expect(p.grenzen.length, `${p.name}: Grenzen`).toBeGreaterThanOrEqual(2);
      expect(p.grenzen.length, `${p.name}: Grenzen`).toBeLessThanOrEqual(3);

      const pflichtfelder = [
        p.amBestenFuer,
        p.beschreibung,
        p.besonderheit,
        p.zielgruppe,
        p.preismodell,
        ...Object.values(p.tabelle),
      ];
      for (const feld of pflichtfelder) {
        expect(feld.trim().length, `${p.name}: leeres Feld`).toBeGreaterThan(0);
      }
    }
  });

  it("nennt eigene Erfahrung nur bei Power Automate und n8n", () => {
    /* Für Make, Zapier, UiPath und Camunda gibt es keinen Kundenfall und keinen
       eigenen Betrieb. Ein „Aus eigener Arbeit"-Kasten dort wäre eine
       Behauptung ohne Grundlage. */
    const mitErfahrung = plattformen.filter((p) => p.eigeneArbeit).map((p) => p.id);
    expect(mitErfahrung.sort()).toEqual(["n8n", "power-automate"]);
  });

  it("stellt einen Kundenfall nie ungekennzeichnet neben eine Bauweise", () => {
    /* „Referenz oder Bauweise, nie dazwischen" (CLAUDE.md). Steht beides in
       einem Kasten, muss jede Zeile ihre Art tragen — und die Bauweise sagt
       selbst, dass sie kein Kundenprojekt ist. */
    for (const p of plattformen) {
      for (const absatz of p.eigeneArbeit ?? []) {
        if (absatz.art === "bauweise") {
          expect(absatz.text, `${p.name}: Bauweise ohne Abgrenzung`).toMatch(/unabhängig von diesem Fall/i);
        }
      }
    }
  });

  it("verlinkt Website und Preisseite des Herstellers über https", () => {
    for (const p of plattformen) {
      expect(p.website, p.name).toMatch(/^https:\/\//);
      expect(p.preisseite, p.name).toMatch(/^https:\/\//);
      expect(p.wikidata, p.name).toMatch(/^https:\/\/www\.wikidata\.org\/wiki\/Q\d+$/);
    }
  });
});

describe("Belege", () => {
  const ids = new Set(quellen.map((q) => q.id));

  it("vergibt jede Quellen-ID und jede Adresse nur einmal", () => {
    expect(ids.size, "Doppelte Quellen-ID — Belegnummern zeigten auf die falsche Quelle").toBe(quellen.length);
    const urls = quellen.map((q) => q.url);
    expect(new Set(urls).size, "Doppelte Quellenadresse").toBe(urls.length);
    expect(quellenNummer(quellen[0].id)).toBe(1);
  });

  it("jede Plattform verweist auf mindestens zwei Quellen, jede genau einmal", () => {
    for (const p of plattformen) {
      expect(p.quellen.length, `${p.name} hat zu wenige Belege`).toBeGreaterThanOrEqual(2);
      expect(new Set(p.quellen).size, `${p.name} nennt eine Quelle doppelt`).toBe(p.quellen.length);
      for (const id of p.quellen) {
        expect(ids.has(id), `${p.name} verweist auf unbekannte Quelle ${id}`).toBe(true);
      }
    }
  });

  it("Belege unter den Fragen gibt es wirklich", () => {
    for (const f of fragen) {
      const eigene = f.quellen ?? [];
      expect(new Set(eigene).size, `${f.frage}: doppelte Quelle`).toBe(eigene.length);
      for (const id of eigene) {
        expect(ids.has(id), `${f.frage} verweist auf unbekannte Quelle ${id}`).toBe(true);
      }
    }
  });

  it("jede Quelle wird verwendet, hat eine Adresse und ein Abrufdatum", () => {
    const verwendet = new Set([
      ...plattformen.flatMap((p) => p.quellen),
      ...fragen.flatMap((f) => f.quellen ?? []),
    ]);
    for (const quelle of quellen) {
      expect(verwendet.has(quelle.id), `Quelle ${quelle.id} wird nirgends verwendet`).toBe(true);
      expect(quelle.url, quelle.id).toMatch(/^https:\/\//);
      expect(quelle.abgerufen, quelle.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("der Stand der Seite ist der jüngste Abruf", () => {
    /* Ein Stand nach dem letzten Abruf behauptet eine Prüfung, die nicht
       stattgefunden hat; einer davor verschweigt eine. */
    const juengster = quellen.map((q) => q.abgerufen).sort().at(-1);
    expect(juengster).toBe(STAND);
  });

  it("übernimmt die Kundenfälle wörtlich aus client-results.ts", () => {
    /* Die Zahlen der Fälle dürfen hier nicht neu formuliert werden — eine
       sinngemäße Fassung hat schon einmal aus einer gemessenen Aufwands-
       Äquivalenz einen behaupteten Dauerzustand gemacht. */
    const zusammenfassungen = clientResults.map((fall) => fall.summary);
    const belegt = umsetzung.belege.filter((beleg) => beleg.fall);
    expect(belegt.length).toBeGreaterThanOrEqual(2);
    for (const beleg of belegt) {
      expect(zusammenfassungen, beleg.titel).toContain(beleg.text);
    }
  });
});

describe("Was auf dieser Seite nicht stehen darf", () => {
  const alle = sichtbareTexte();

  it("enthält keinen ungeprüften Platzhalter", () => {
    /* Die Sperrmarke beim Schreiben ist das großgeschriebene „PRÜFEN" — ohne
       Unterscheidung der Schreibweise träfe die Prüfung jedes „prüfen" im Text. */
    expect(alle.filter((text) => /PRÜFEN|TODO/.test(text) || /Platzhalter/i.test(text))).toEqual([]);
  });

  it("keine Beträge und keine Preisversprechen (Entscheidung 05.09.2026)", () => {
    const verboten =
      /€|\$|£|\bEUR\b|\bUSD\b|\bCHF\b|\bEuro\b|\bDollar\b|\bCent\b|günstig|Festpreis|preiswert|billig|\d+\s*(?:pro|je)\s+(?:Nutzer|Monat|Bot)\b/i;
    const treffer = alle.filter((text) => verboten.test(text));
    expect(treffer, "Preisangabe im sichtbaren Text").toEqual([]);
  });

  it("keine unbelegten Superlative", () => {
    /* Die Frage „Welche Software … ist die beste?" ist die Suchanfrage, keine
       Behauptung — Fragen sind deshalb ausgenommen. Ebenso „am besten für":
       Das ist die Eignungskategorie jeder Plattform, keine Spitzenstellung. */
    const fragenTexte = new Set(fragen.map((f) => f.frage));
    const verboten =
      /\b(?:beste[nrs]?|\w*führend\w*|Marktführer\w*|größte[nrs]?|meiste[nrs]?|Nummer eins|Nr\.\s?1|revolution\w*|unschlagbar\w*)\b/i;
    const treffer = alle.filter(
      (text) => !fragenTexte.has(text) && verboten.test(text.replace(/\bam besten für\b/gi, ""))
    );
    expect(treffer, "Superlativ ohne Beleg").toEqual([]);
  });

  it("kein pauschales Datenschutz-Versprechen", () => {
    const verboten = /100\s?Prozent DSGVO|vollständig DSGVO-konform|DSGVO-konform garantiert|Daten bleiben in der EU/i;
    expect(alle.filter((text) => verboten.test(text))).toEqual([]);
  });

  it("hält den Hausstil der Website", () => {
    /* Die Regeln, die auf der ganzen Website gelten, nicht nur im Blog:
       Typografie, Abkürzungen, Weichspüler und die bekannten Floskeln. Anrede
       und Firmenname sind hier erlaubt — der Vergleich spricht offen als
       KITech, und die Entscheidungshilfe darf „wer" ansprechen. */
    const regeln = new Set([
      "hausstil-en-dash",
      "hausstil-em-dash-ohne-leerzeichen",
      "hausstil-anfuehrungszeichen",
      "hausstil-satzzeichen",
      "hausstil-abkuerzung",
      "hausstil-konjunktiv-weichspueler",
      "floskel-heutige-welt",
      "floskel-digitales-zeitalter",
      "floskel-in-einer-welt",
      "floskel-eintauchen",
      "floskel-naechstes-level",
      "floskel-zahlreiche-vorteile",
      "floskel-leerformel",
      "nicht-nur-sondern-auch",
      "sowohl-als-auch",
      "dreier-adjektivkette",
      "uebergang-darueber-hinaus",
      "uebergang-letztendlich",
      "leere-superlative",
      "consulting-buzzword",
      "aufwertungsverben",
      "typo-doppelte-leerzeichen",
      "typo-leerzeichen-vor-satzzeichen",
    ]);
    const gefunden = MUSTER.filter((m) => regeln.has(m.regel));
    /* Benennt jemand eine Regel im Prüfer um, liefe die Prüfung hier sonst
       still an ihr vorbei. */
    expect(gefunden.map((m) => m.regel).sort()).toEqual([...regeln].sort());

    const befunde: string[] = [];
    for (const muster of gefunden) {
      for (const text of alle) {
        muster.regex.lastIndex = 0;
        const treffer = muster.regex.exec(text);
        if (treffer) befunde.push(`${muster.regel}: „${text.slice(Math.max(0, treffer.index - 30), treffer.index + 40)}"`);
      }
    }
    expect(befunde, befunde.join("\n")).toEqual([]);
  });

  it("hält Sätze unter 33 Wörtern — gezählt wie im Blog", () => {
    /* Dieselben Zählfunktionen wie das Qualitätstor der Artikel, damit es
       nicht zwei Prüfer mit zwei Zählweisen gibt. */
    const zuLang = alle.flatMap(saetze).filter((satz) => woerter(satz).length > 32);
    expect(zuLang, zuLang.join("\n")).toEqual([]);
  });
});

describe("Verweise und Daten", () => {
  it("datiert die Sitemap auf denselben Stand wie die Seite", () => {
    const route = siteRoutes.find((r) => r.path === VERGLEICH_PFAD);
    expect(route, "Route fehlt im Routen-Register").toBeDefined();
    expect(route?.indexable).toBe(true);
    expect(route?.lastModified).toBe(STAND);
    expect(VEROEFFENTLICHT <= STAND).toBe(true);
  });

  it("vergibt jede Sprungmarke im Dokument nur einmal", () => {
    /* Doppelte IDs brechen `aria-labelledby` und das Inhaltsverzeichnis — der
       Browser springt dann immer zum ersten Treffer. */
    const domIds = [
      ...Object.values(abschnitte).map((a) => a.id),
      ...plattformen.flatMap((p) => [p.id, `${p.id}-titel`]),
      ...quellen.map((_, index) => `quelle-${index + 1}`),
      "autor",
    ];
    expect(new Set(domIds).size, "Doppelte ID im Dokument").toBe(domIds.length);
  });

  it("jeder interne Verweis zeigt auf eine Route, einen Artikel oder einen Anker der Seite", () => {
    const anker = new Set([...plattformen.map((p) => p.id), ...Object.values(abschnitte).map((a) => a.id)]);
    const routen = new Set(siteRoutes.map((r) => r.path));
    const artikel = new Set(veroeffentlichteArtikel().map((a) => `/gratis-wissen/${a.slug}`));

    const ziele = [
      ...ausgangslagen.map((lage) => lage.ziel.href),
      ...umsetzung.belege.filter((b) => !b.extern).map((b) => b.href),
      ...plattformen.flatMap((p) => (p.eigeneArbeitLink ? [p.eigeneArbeitLink.href] : [])),
    ];

    for (const ziel of ziele) {
      /* Ein Anker auf einer anderen Seite (`/referenzen#microsoft-umfeld`)
         wird am Pfad geprüft; ob es die Marke dort gibt, prüft der Routentest
         nicht — deshalb steht die Stelle im Kommentar der Datendatei. */
      const pfad = ziel.split("#")[0];
      const ok = ziel.startsWith("#") ? anker.has(ziel.slice(1)) : routen.has(pfad) || artikel.has(pfad);
      expect(ok, `Verweis ins Leere: ${ziel}`).toBe(true);
    }
  });

  it("wählt die Artikel unter dem Vergleich aus Themenbereichen, die es gibt", () => {
    const vorhanden = new Set(alleCluster().map((c) => c.slug));
    for (const thema of WEITERLESEN_THEMEN) {
      expect(vorhanden.has(thema), `Themenbereich ${thema} gibt es nicht`).toBe(true);
    }
  });

  it("baut ein Article-Schema mit Autor, Herausgeber und eindeutigen Plattformen", () => {
    const schema = vergleichArtikelSchema({
      slug: "ayham-alkhalil",
      name: "Ayham Alkhalil",
      rolle: "Geschäftsführer",
      kurzbeschreibung: "x",
      themen: ["x"],
    } as Parameters<typeof vergleichArtikelSchema>[0]);

    expect(schema["@type"]).toBe("Article");
    expect(schema.headline).toBe(ueberschrift);
    expect(String(schema.headline).length).toBeLessThanOrEqual(110);
    expect(schema.dateModified).toBe(STAND);
    expect((schema.publisher as Record<string, string>)["@id"]).toBe("https://kitech-software.de/#organisation");
    expect((schema.author as Record<string, string>)["@id"]).toBe(
      "https://kitech-software.de/autoren/ayham-alkhalil#person"
    );

    /* Keine Typen, die Google als Rich Result prüft und ohne Preis oder
       Bewertung als ungültig meldet. */
    const json = JSON.stringify(schema);
    expect(json).not.toMatch(/SoftwareApplication|"Product"|aggregateRating|"Review"|FAQPage/);
    expect((schema.mentions as unknown[]).length).toBe(plattformen.length);
  });

  it("liefert genau eine Brotkrume mit zwei Stufen, beginnend mit „Startseite“", () => {
    const krume = vergleichBreadcrumbSchema();
    const liste = krume.itemListElement as { name: string; item: string }[];
    expect(liste).toHaveLength(2);
    expect(liste[0].name).toBe("Startseite");
    expect(liste[1].item).toBe(`https://kitech-software.de${VERGLEICH_PFAD}`);
  });

  it("sammelt alle sichtbaren Texte für die Prüfungen oben", () => {
    /* Gegenprobe, damit die Stilprüfung nicht still an einer leeren Liste
       vorbeiläuft, wenn jemand ein Feld umbenennt. */
    const alle = sichtbareTexte();
    for (const stichprobe of [
      ueberschrift,
      lead,
      transparenzhinweis,
      einleitung[0],
      umsetzung.aussage,
      methodik.grundlage[0],
      kriterien[0].text,
      fragen[0].antwort[0],
      seitentexte.cta.text,
      seitentexte.tabelleBetrieb.beschriftung,
      plattformen[0].tabelle.anbieter,
    ]) {
      expect(alle).toContain(stichprobe);
    }
  });
});
