import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { substanzSchema } from "../wissen/schema";

/**
 * Der Themen-Vorrat gegen dasselbe Schema wie der fertige Artikel.
 *
 * **Warum das ein Test ist.** Am 07.09.2026 brach der Automatiklauf ab, nachdem
 * er alles richtig gemacht hatte: Er las vier frische Quellen (`openai.com`
 * drei Minuten alt), wertete sechs Seiten aus, fand zehn Lücken und schrieb
 * einen vollständigen Artikel. Verworfen wurde der erst am Datenmodell —
 * `substanz.beschreibung` 439 Zeichen statt 400, `herkunft` 349 statt 300.
 *
 * Die Werte kamen aus dem Themen-Vorrat und standen dort seit zwei Tagen. Das
 * Modell hat sie übernommen, wie es soll; sie waren von Anfang an zu lang.
 * Geprüft wurde bis dahin nur das Ergebnis, nie die Eingabe — der Fehler war
 * also erst nach 0,13 $ DataForSEO, acht Firecrawl-Credits und 50.000 Token
 * sichtbar, und der Tag blieb ohne Artikel.
 *
 * Ein Eintrag im Vorrat ist zwei Minuten Arbeit. Ihn hier zu prüfen kostet
 * nichts und verschiebt den Abbruch von 6:33 Uhr auf `npm test`.
 */

const POOL = path.join(process.cwd(), "content", "seo", "themen-pool.json");

interface ThemaRoh {
  id: string;
  cluster: string;
  autor: string;
  substanz: unknown;
  aktualitaet?: { suche?: string; fenster?: string };
}

const themen: ThemaRoh[] = JSON.parse(fs.readFileSync(POOL, "utf8"));

function slugsAus(datei: string, feld: string): Set<string> {
  const roh = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content", "seo", datei), "utf8"));
  const liste = Array.isArray(roh) ? roh : (roh[feld] ?? []);
  return new Set(liste.map((eintrag: { slug: string }) => eintrag.slug));
}

describe("Themen-Vorrat", () => {
  it("hält bei jedem Thema mit Substanz die Grenzen des Artikelschemas ein", () => {
    const verstoesse = themen
      .filter((thema) => thema.substanz !== null)
      .map((thema) => {
        const befund = substanzSchema.safeParse(thema.substanz);
        if (befund.success) return null;
        const meldungen = befund.error.issues
          .map((problem) => `${problem.path.join(".")}: ${problem.message}`)
          .join("; ");
        return `${thema.id} — ${meldungen}`;
      })
      .filter(Boolean);

    expect(
      verstoesse,
      "Diese Einträge bringen den Lauf erst nach dem Schreiben zum Absturz — also nach " +
        "DataForSEO, Firecrawl und dem vollen Modellaufruf, und der Tag bleibt ohne Artikel:\n" +
        verstoesse.map((zeile) => `  - ${zeile}`).join("\n")
    ).toEqual([]);
  });

  it("verweist nur auf Cluster und Autoren, die es gibt", () => {
    const cluster = slugsAus("cluster.json", "cluster");
    const autoren = slugsAus("autoren.json", "autoren");

    const unbekannt = themen.flatMap((thema) => [
      ...(cluster.has(thema.cluster) ? [] : [`${thema.id}: Cluster „${thema.cluster}“`]),
      ...(autoren.has(thema.autor) ? [] : [`${thema.id}: Autor „${thema.autor}“`]),
    ]);

    // Ein unbekannter Cluster bricht später den Build ab (lib/wissen/laden.ts),
    // ein unbekannter Autor verletzt das Tor „namentlicher Autor, nie ein Modell".
    expect(unbekannt, `Unbekannte Verweise:\n${unbekannt.join("\n")}`).toEqual([]);
  });

  it("gibt jedem Aktualitätsthema eine Suche und ein gültiges Fenster", () => {
    const fenster = new Set(["qdr:d", "qdr:w", "qdr:m"]);
    const kaputt = themen
      .filter((thema) => thema.aktualitaet)
      .filter(
        (thema) =>
          !thema.aktualitaet!.suche?.trim() || !fenster.has(thema.aktualitaet!.fenster ?? "")
      )
      .map((thema) => thema.id);

    // Ohne `suche` liefe die Zeitsuche ins Leere; ein unbekanntes Fenster käme
    // erst im Lauf heraus, und dann als stille Warnung statt als Fehler.
    expect(kaputt, `Unvollständiges aktualitaet-Feld: ${kaputt.join(", ")}`).toEqual([]);
  });
});
