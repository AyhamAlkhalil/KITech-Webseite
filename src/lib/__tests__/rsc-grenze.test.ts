import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ohneKommentare } from "./quelltext";

/**
 * Kein Wert wandert von einem `"use client"`-Modul in eine Server Component.
 *
 * **Warum das ein Test ist.** `Gruenderwort.tsx` ist eine Server Component und
 * zog `founderInfo` aus `FounderPortrait.tsx` — einem `"use client"`-Modul.
 * Über diese Grenze reicht React für einen Nicht-Komponenten-Export keinen
 * Wert durch, sondern einen Modulproxy. Auf der Startseite stand deshalb live
 * unter dem Gründerzitat „ — , KITech Software", und der LinkedIn-Anker trug
 * `target` und `rel`, aber kein `href`. Der Build lief durch, `npm test` lief
 * durch, kein Fehler in der Konsole. Aufgefallen ist es erst im ausgelieferten
 * HTML — bei dem Element, das auf der ganzen Seite am meisten Vertrauen tragen
 * soll.
 *
 * Geprüft wird nur der Import von **Werten**: Ein Name, der klein anfängt, ist
 * keine Komponente. `PascalCase` ist erlaubt — genau dafür ist die Grenze
 * gebaut. `import type` ebenfalls: Typen sind zur Laufzeit nicht da.
 *
 * `src/views/legacy/` ist ausgenommen, wie in `tsconfig` und `eslint` auch:
 * nicht geroutet, nicht gebaut.
 */

const WURZEL = path.join(process.cwd(), "src");
const AUSGENOMMEN = [path.join("views", "legacy")];

function dateien(verzeichnis: string): string[] {
  return fs.readdirSync(verzeichnis, { withFileTypes: true }).flatMap((eintrag) => {
    const voll = path.join(verzeichnis, eintrag.name);
    if (AUSGENOMMEN.some((teil) => voll.includes(teil))) return [];
    if (eintrag.isDirectory()) return dateien(voll);
    return /\.tsx?$/.test(eintrag.name) ? [voll] : [];
  });
}

/** Ein Modul gilt als Client-Modul, wenn die Direktive vor allem Code steht. */
function istClientModul(quelltext: string): boolean {
  return /^\s*(?:\/\*[\s\S]*?\*\/\s*)*["']use client["']/.test(quelltext);
}

/** Löst `@/…` und relative Angaben auf eine echte Datei auf. */
function aufloesen(spezifizierer: string, vonDatei: string): string | null {
  let basis: string;
  if (spezifizierer.startsWith("@/")) basis = path.join(WURZEL, spezifizierer.slice(2));
  else if (spezifizierer.startsWith(".")) basis = path.resolve(path.dirname(vonDatei), spezifizierer);
  else return null;

  for (const endung of [".tsx", ".ts", "/index.tsx", "/index.ts"]) {
    const kandidat = basis + endung;
    if (fs.existsSync(kandidat) && fs.statSync(kandidat).isFile()) return kandidat;
  }
  return null;
}

describe("Grenze zwischen Server und Client", () => {
  it("importiert keine Werte aus einem \"use client\"-Modul in eine Server Component", () => {
    const verstoesse: string[] = [];

    for (const datei of dateien(WURZEL)) {
      const roh = fs.readFileSync(datei, "utf8");
      if (istClientModul(roh)) continue; // Client darf aus Client importieren

      const code = ohneKommentare(roh);
      const importe = code.matchAll(/import\s+([^;]*?)\s+from\s+["']([^"']+)["']/g);

      for (const [, klausel, spezifizierer] of importe) {
        if (klausel.trimStart().startsWith("type ")) continue; // reiner Typ-Import

        const ziel = aufloesen(spezifizierer, datei);
        if (!ziel || !istClientModul(fs.readFileSync(ziel, "utf8"))) continue;

        const geschweift = klausel.match(/\{([^}]*)\}/)?.[1] ?? "";
        const werte = geschweift
          .split(",")
          .map((teil) => teil.trim())
          .filter(Boolean)
          .filter((teil) => !teil.startsWith("type "))
          .map((teil) => teil.split(/\s+as\s+/)[0].trim())
          .filter((name) => /^[a-z_]/.test(name)); // klein => keine Komponente

        for (const name of werte) {
          verstoesse.push(
            `${path.relative(process.cwd(), datei)} holt "${name}" aus ` +
              `${path.relative(process.cwd(), ziel)} ("use client")`
          );
        }
      }
    }

    expect(
      verstoesse,
      "Über die RSC-Grenze kommt für einen Nicht-Komponenten-Export ein Modulproxy " +
        "statt eines Werts. Das rendert leer, ohne Fehler. Werte gehören in eine " +
        "reine Datendatei (src/data/, src/config/), aus der beide Seiten lesen:\n" +
        verstoesse.map((zeile) => `  - ${zeile}`).join("\n")
    ).toEqual([]);
  });
});
