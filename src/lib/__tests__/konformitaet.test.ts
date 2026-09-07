import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { konformitaetsPunkte, siegel } from "../../data/konformitaet";
import { staticRoutePaths } from "../../config/navigation";

/**
 * Der Konformitätsblock: keine Angabe ohne Beleg, kein Siegel ohne Datei.
 *
 * **Warum das ein Test ist.** Der Block sagt aus, dass hier nach europäischen
 * Regeln gearbeitet wird — ausgerechnet dort fällt eine unbelegte Behauptung am
 * meisten auf, und sie ist eine irreführende geschäftliche Angabe nach § 5
 * Abs. 1 UWG wie jede andere. Die Regel steht ausführlich im Kopf von
 * `data/konformitaet.ts`; ein Kommentar hält aber niemanden auf, der in Eile
 * eine sechste Zeile ergänzt.
 *
 * Geprüft wird deshalb genau das, was sich maschinell prüfen lässt:
 *
 *   1. Jede Angabe verlinkt eine Seite, **die es gibt** — ein toter Beleglink
 *      ist schlimmer als keiner, weil er Prüfbarkeit vortäuscht.
 *   2. Jedes Siegel hat eine Bilddatei, die tatsächlich im Repo liegt. Ein
 *      kaputtes Bild an dieser Stelle liest sich wie ein entzogenes Zeichen.
 *   3. Jedes Siegel hat einen Aussteller und eine Nachweisadresse.
 *
 * Was der Test **nicht** kann: prüfen, ob das Zeichen wirklich verliehen wurde.
 * Das bleibt die Verantwortung dessen, der den Eintrag anlegt — die drei
 * Bedingungen stehen in `public/images/siegel/README.md`.
 */

const OEFFENTLICH = path.join(process.cwd(), "public");

describe("Konformitätsangaben", () => {
  it("belegt jede Angabe mit einer Seite, die es gibt", () => {
    const tot = konformitaetsPunkte
      .filter((punkt) => !staticRoutePaths.includes(punkt.beleg.href))
      .map((punkt) => `${punkt.titel} → ${punkt.beleg.href}`);

    expect(
      tot,
      `Diese Belege zeigen auf Routen, die es nicht gibt: ${tot.join(", ")}`
    ).toEqual([]);
  });

  it("lässt keine Angabe ohne Beleg stehen", () => {
    for (const punkt of konformitaetsPunkte) {
      expect(punkt.beleg.href, `${punkt.titel} ohne Beleg`).toBeTruthy();
      expect(punkt.beleg.label, `${punkt.titel} ohne Beschriftung des Belegs`).toBeTruthy();
      expect(punkt.text.length, `${punkt.titel} ohne Text`).toBeGreaterThan(20);
    }
  });

  it("behauptet nicht, dass alle Daten in der EU bleiben", () => {
    /* Die Firmenerkennung läuft über ipinfo.io auf US-Servern, gestützt auf
       Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO) — die
       Datenschutzerklärung benennt das. Eine Zeile hier, die das überdeckt,
       wäre genau der Widerspruch, den ein aufmerksamer Leser findet. */
    const alles = konformitaetsPunkte.map((p) => `${p.titel} ${p.text}`).join(" ");

    expect(alles).not.toMatch(/Daten bleiben in (der )?(EU|Europa)/i);
    expect(alles).not.toMatch(/100\s*%\s*DSGVO|vollständig DSGVO-konform/i);
  });
});

describe("Siegel", () => {
  it("zeigt kein Siegel ohne Bilddatei im Repo", () => {
    const fehlend = siegel
      .filter((zeichen) => !fs.existsSync(path.join(OEFFENTLICH, zeichen.logo)))
      .map((zeichen) => `${zeichen.name}: ${zeichen.logo}`);

    expect(
      fehlend,
      `Diese Siegel verweisen auf Dateien, die es nicht gibt: ${fehlend.join(", ")}`
    ).toEqual([]);
  });

  it("nennt zu jedem Siegel Aussteller und Nachweis", () => {
    for (const zeichen of siegel) {
      expect(zeichen.aussteller, `${zeichen.name} ohne Aussteller`).toBeTruthy();
      expect(zeichen.nachweisUrl, `${zeichen.name} ohne Nachweisadresse`).toMatch(/^https:\/\//);
    }
  });

  it("führt kein Zeichen doppelt", () => {
    /* Drei Microsoft-Badges unterscheiden sich nur in der Designation — ohne
       sie wären es drei identische Einträge, und einer davon ein Versehen. */
    const kennungen = siegel.map((z) => `${z.name}|${z.designation ?? ""}`);

    expect(new Set(kennungen).size).toBe(kennungen.length);
  });
});
