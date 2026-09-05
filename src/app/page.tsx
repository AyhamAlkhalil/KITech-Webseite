import { existsSync } from "node:fs";
import path from "node:path";
import { buildMetadata } from "@/lib/metadata";
import Home from "@/views/Home";
import { empfehlungenFuer } from "@/lib/wissen/empfehlungen";

/**
 * Beschreibung neu gefasst am 20.08.2026 — aus zwei Gründen.
 *
 * Sie war mit 230 Zeichen deutlich zu lang und wurde im Suchergebnis hinten
 * abgeschnitten, also genau dort, wo das Angebot stand. Und sie eröffnete mit
 * „99 % der KI-Projekte scheitern an der falschen KI" — eine harte Zahl **ohne
 * Quelle, die auf der Seite selbst an keiner Stelle vorkommt**. Ein Ausschnitt,
 * der etwas verspricht, was die Seite nicht sagt, ist doppelt ungünstig: als
 * unbelegte Werbeaussage und als Erwartung, die der erste Blick enttäuscht.
 *
 * Was jetzt dort steht, steht auch auf der Seite: die Aussage aus dem Hero und
 * das Angebot aus `angebot.ts`.
 *
 * **Titel gedreht am 05.09.2026.** Er lautete „Anwendungspartner für KI im
 * Mittelstand" und sagte damit genau das Gegenteil der Positionierung: IT
 * kam nicht vor. Jetzt steht IT zuerst, KI daneben, Hannover hinten — die
 * Reihenfolge *ist* die Aussage (siehe „Wofür die Website gebaut ist" in
 * CLAUDE.md). Die Beschreibung bleibt unangetastet: Sie führt mit Ayhams H1.
 */
export const metadata = buildMetadata({
  title: "KITech Software – IT und KI für den Mittelstand, Hannover",
  description:
    "Falsche KI kostet mehr als keine KI. Wir bauen Automatisierungen und Software, die im Tagesgeschäft läuft — Hannover. Kostenloser 1:1-KI-Check, 30 Minuten.",
  path: "/",
});

/**
 * Pfad des Hero-Portraits: die freigestellte Aufnahme von Ayham (getrimmt und
 * auf 700 px Höhe gerechnet — 295 x 700, 29 KB).
 *
 * ⚠️ Freigestellt heißt hier: **transparenter Hintergrund, keine Kante.** Der
 * Hero-Grund ist `bg-surface-strong` (0 0% 94 %), fast weiß — ein Foto mit
 * Hintergrund säße dort als sichtbares Rechteck. Wer die Datei austauscht,
 * tauscht sie gegen einen Freisteller, sonst klebt ein Kasten im Hero.
 * Dieselbe Datei zeigen auch `/funnel` und die beiden Sales Letter.
 *
 * Die Prüfung läuft **hier**, in der Server Component, und damit beim Build:
 * liegt die Datei, wird sie ausgeliefert; liegt sie nicht, fällt die Startseite
 * auf das vorhandene Team-Portrait zurück. Ein `<picture>`-Element hätte das
 * nicht geleistet — es wählt nach Dateityp, nicht danach, ob die Datei
 * existiert, und hätte bei fehlender Datei ein kaputtes Bild gezeigt.
 */
const HERO_PORTRAIT = "/images/team/ayham-hero.webp";
const heroPortrait = existsSync(path.join(process.cwd(), "public", HERO_PORTRAIT))
  ? HERO_PORTRAIT
  : null;

export default function Page() {
  return <Home heroPortrait={heroPortrait} wissen={empfehlungenFuer("/")} />;
}
