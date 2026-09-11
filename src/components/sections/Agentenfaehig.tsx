import { SITE_CONTAINER } from "@/components/layout/site-container";
import { AGENTEN_AUSSAGE, AGENTEN_LABEL, agentenMarken } from "@/data/agentenfaehig";

/**
 * Der Agentenhinweis: **eine Zeile unter den Referenzen.** Marker, Satz,
 * Markenzeichen. Inhalt und die Regeln dafür: `src/data/agentenfaehig.ts`.
 *
 * Steht auf der Startseite unter dem Kundenlaufband und auf `/referenzen` unter
 * den Kundenkarten — direkt hinter dem Beweis, wo er hingehört: Wer gerade
 * gelesen hat, was wir gebaut haben, erfährt hier in einem Satz, was jedes
 * dieser Dinge zusätzlich kann.
 *
 * ## ⚠️ Hier wird kein Abschnitt mehr daraus
 *
 * Vier Fassungen sind an derselben Stelle gescheitert, alle am 07. und
 * 11.09.2026:
 *
 *   1. Vier Zugänge mit je einem Erklärabsatz — „viel zu lang".
 *   2. Vier Zugänge mit je einem Satz — „viel weiter kürzen".
 *   3. Vier nackte Zeilen in einer Leiste mit Trennstrichen — „wieder nur
 *      Karten mit Text drinne".
 *   4. Große Aussage plus zwei Marken mit Herstellern — „extrem langweilig,
 *      wieder fetter schwarzer Text und zwei Logos".
 *
 * Die Ansage danach: „einfach so als Hinweis unter den Referenzen, nicht als
 * eigener Abschnitt." Daraus folgt, was hier **nicht** wieder hineinkommt:
 * keine eigene Überschrift, keine `<section>` mit `aria-labelledby`, keine
 * Liste in irgendeiner Form, keine große Schrift, keine Hersteller unter den
 * Markennamen. Der Block ist eine Fußnote zum Beweis darüber — nicht sein
 * eigener Beweis.
 *
 * Wer ihn wieder aufbläst, holt sich die fünfte Fassung.
 *
 * ## Aufbau
 *
 * Eine Zeile, oben mit einer Haarlinie vom Laufband abgesetzt: der Marker in
 * der Signalfarbe, der Satz in der kleinen Textgröße, rechts die Zeichen der
 * Marken. Auf schmalen Displays bricht die Zeile um; die Zeichen rutschen dann
 * unter den Satz, nicht in ihn hinein.
 *
 * Die Bewegung ist geblieben (`agenten-einlauf`, Regeln in `src/index.css`):
 * scroll-getrieben in CSS, ohne JavaScript, nur `transform`. Bei
 * `prefers-reduced-motion: reduce` oder ohne Timeline-Unterstützung passiert
 * nichts.
 *
 * ## Die Zeichen
 *
 * Einfarbig über `currentColor`, 24×24-Raster, Quelle wie im Hero-Laufband.
 * ⚠️ Fehlt eines (`pfad: null`, derzeit Codex), rendert diese Komponente an
 * seiner Stelle **nichts** — keinen Kasten, kein Ersatzsymbol. Der Name steht
 * ohnehin im Satz. Begründung in `data/agentenfaehig.ts`.
 */
export function Agentenfaehig() {
  const zeichen = agentenMarken.filter((marke) => marke.pfad);

  return (
    <div id="agentenfaehig" className={`${SITE_CONTAINER} scroll-mt-8 pb-12 sm:pb-14`}>
      <div className="agenten-einlauf flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-5">
        {/* Der Marker. Eckig, klein, in der Signalfarbe — er ersetzt die
            Überschrift, die dieser Block bewusst nicht mehr hat. */}
        <span className="bg-primary px-2 py-0.5 text-mini font-bold uppercase tracking-[0.1em] text-primary-foreground">
          {AGENTEN_LABEL}
        </span>

        {/* `min-w-0` lässt den Satz umbrechen, statt die Zeichen aus der Zeile
            zu schieben — dieselbe Regel wie in jeder Zeile aus Text und
            Beiwerk. */}
        <p className="min-w-0 flex-1 text-mini font-normal text-muted-foreground">
          {AGENTEN_AUSSAGE}
        </p>

        {zeichen.length > 0 && (
          <span className="flex shrink-0 items-center gap-3" aria-hidden="true">
            {zeichen.map((marke) => (
              <svg
                key={marke.id}
                viewBox="0 0 24 24"
                className="h-[18px] w-[18px] text-foreground/70"
                fill="currentColor"
              >
                <path d={marke.pfad as string} />
              </svg>
            ))}
          </span>
        )}
      </div>
    </div>
  );
}
