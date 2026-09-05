import { describe, expect, it } from "vitest";
import { imFenster } from "./04-recherche.js";

/**
 * Die Datumsprüfung der Aktualitätsrecherche.
 *
 * **Warum das ein Test ist.** Firecrawl liefert das Erscheinungsdatum einer
 * Meldung relativ und englisch („8 hours ago", „2 months ago") — nicht
 * normalisiert, nicht dokumentiert, jederzeit änderbar. Die Prüfung liest
 * deshalb nur die Einheit. Eine Regex, die still das Falsche tut, wäre hier
 * besonders teuer: Sie würde eine ein Jahr alte Meldung als frisch durchwinken,
 * und der Artikel behauptete dann „seit kurzem" über etwas Verjährtes.
 *
 * Die Kante bei „1 month ago" gegen `qdr:m` ist Absicht — die Suche selbst
 * zählt sie als drin.
 */
describe("Aktualitätsfenster", () => {
  it("erkennt frische Meldungen", () => {
    expect(imFenster("8 hours ago", "qdr:d")).toBe(true);
    expect(imFenster("45 minutes ago", "qdr:d")).toBe(true);
    expect(imFenster("2 days ago", "qdr:w")).toBe(true);
    expect(imFenster("3 weeks ago", "qdr:m")).toBe(true);
  });

  it("erkennt zu alte Meldungen", () => {
    expect(imFenster("2 days ago", "qdr:d")).toBe(false);
    expect(imFenster("3 weeks ago", "qdr:w")).toBe(false);
    expect(imFenster("2 months ago", "qdr:m")).toBe(false);
    expect(imFenster("1 year ago", "qdr:m")).toBe(false);
  });

  it("zählt 1 month bei qdr:m als drin — so wie die Suche selbst", () => {
    expect(imFenster("1 month ago", "qdr:m")).toBe(true);
    expect(imFenster("1 month ago", "qdr:w")).toBe(false);
  });

  it("wirft nichts weg, was es nicht versteht", () => {
    // Ein unbekanntes Format ist kein Grund, eine lesbare Quelle zu verlieren.
    expect(imFenster("", "qdr:d")).toBe(true);
    expect(imFenster("2026-09-05", "qdr:d")).toBe(true);
    expect(imFenster("gestern", "qdr:d")).toBe(true);
  });

  it("liest die Einheit unabhängig von Gross- und Kleinschreibung", () => {
    expect(imFenster("8 Hours Ago", "qdr:d")).toBe(true);
    expect(imFenster("2 Years Ago", "qdr:m")).toBe(false);
  });
});
