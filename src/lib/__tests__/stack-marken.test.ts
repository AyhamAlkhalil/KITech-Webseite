import { describe, expect, it } from "vitest";
import { stackMarken } from "../../data/stack-marken";
import { techStack } from "../../data/services";

/**
 * Die Produktnamen im Hero-Laufband gegen den gepflegten Stack.
 *
 * **Warum das ein Test ist.** Die Microsoft-Namen sind seit dem 04.09.2026 die
 * Positionierung, und sie stehen an inzwischen fünf Stellen: `techStack` und
 * der Fließtext in `data/services.ts`, `data/segments.ts` (nur `enterprise`),
 * `data/faq.ts`, `sections/WegeBlock.tsx` — und jetzt hier, direkt im Hero der
 * Startseite, also auf der Fläche mit der meisten Aufmerksamkeit.
 *
 * Falsch geschrieben werden sie immer auf dieselbe Weise: „Dynamic Sales" statt
 * **Dynamics 365 Sales**, „Dynamics BI" statt **Power BI** (dieses Produkt gibt
 * es nicht). Auf der Gegenseite sitzt jemand, der die Namen täglich benutzt;
 * ein falscher Name kostet mehr Glaubwürdigkeit, als die ganze Liste aufbaut.
 *
 * Geprüft wird nur, was in beiden Listen vorkommen *muss* — die Power-Platform-
 * und Dynamics-Produkte. `Microsoft 365`, `Azure`, `n8n` und `Claude` stehen
 * bewusst nur im Laufband oder nur im Stack: das eine ist die Aussenwirkung im
 * Hero, das andere die Aufzählung auf `/leistungen`.
 */

/** Marken, deren Schreibweise an beiden Orten identisch sein muss. */
const GEMEINSAM = /^(Power|Dynamics)/;

describe("Werkzeug-Laufband im Hero", () => {
  it("schreibt Microsoft-Produkte genauso wie der Stack auf /leistungen", () => {
    const imStack = new Set(techStack.map((eintrag) => eintrag.name));

    const abweichend = stackMarken
      .map((marke) => marke.name)
      .filter((name) => GEMEINSAM.test(name) && !imStack.has(name));

    expect(
      abweichend,
      `Diese Namen stehen im Hero-Laufband, aber nicht zeichengenau in techStack ` +
        `(src/data/services.ts): ${abweichend.join(", ")}`
    ).toEqual([]);
  });

  it("kennt kein Produkt, das es nicht gibt", () => {
    const namen = stackMarken.map((marke) => marke.name).join(" | ");

    expect(namen).not.toMatch(/Dynamic Sales|Dynamics BI|Power Bi|PowerBI|Power-Automate/);
  });

  it("führt Microsoft vor den übrigen Werkzeugen", () => {
    /* Die Reihenfolge ist die Positionierung: „Ich möchte keine KI-Agentur
       sein, sondern eine IT-Agentur, die auch KI macht" (Ansage 04.09.2026).
       Stünde Claude vorn, sagte das Laufband das Gegenteil. */
    const ersterNichtMicrosoft = stackMarken.findIndex((marke) =>
      ["n8n", "Claude"].includes(marke.name)
    );
    const letzterMicrosoft = stackMarken.reduce(
      (letzter, marke, index) =>
        /^(Power|Dynamics|Microsoft|Azure)/.test(marke.name) ? index : letzter,
      -1
    );

    expect(ersterNichtMicrosoft).toBeGreaterThan(letzterMicrosoft);
  });

  it("hat zu jeder Marke ein Symbol", () => {
    for (const marke of stackMarken) {
      expect(marke.pfad.length, `${marke.name} ohne SVG-Pfad`).toBeGreaterThan(20);
      expect(marke.kategorie.length, `${marke.name} ohne Kategorie`).toBeGreaterThan(0);
    }
  });
});
