import { SITE_CONTAINER } from "@/components/layout/site-container";
import { AGENTEN_AUSSAGE, AGENTEN_LABEL, agentenMarken } from "@/data/agentenfaehig";

/**
 * „Alle unsere Apps und Automatisierungen können per Claude und Codex bedient
 * werden" — die Aussage groß, darunter die beiden Marken. Inhalt und die Regeln
 * dafür: `src/data/agentenfaehig.ts`.
 *
 * Steht auf der Startseite unter dem Kundenlaufband und auf `/referenzen` unter
 * den Kundenkarten. Beide Male direkt hinter dem Beweis: Wer gerade gelesen
 * hat, was wir gebaut haben, erfährt hier, was jedes dieser Dinge zusätzlich
 * kann.
 *
 * ## Was hier dreimal gescheitert ist
 *
 * Der Block hatte am 07.09.2026 vier Zugänge mit je einem Erklärabsatz, dann
 * vier Zugänge mit je einem Satz, dann vier nackte Zeilen in einer Leiste mit
 * Trennstrichen. Alle drei Fassungen sind an derselben Stelle gescheitert
 * (Ansage 11.09.2026): „Der Abschnitt ist komisch — wieder nur Karten mit Text
 * drinne."
 *
 * ⚠️ Daraus die Regel für diesen Block: **Hier kommt keine Liste mehr hinein.**
 * Weder als Kacheln noch als Spalten mit `divide-x`, auch nicht mit nur zwei
 * Wörtern je Spalte — eine Reihe gleich gebauter Textfelder liest sich als
 * Baukasten, egal wie kurz die Felder sind. Was der Block trägt, ist ein Satz
 * und zwei Zeichen.
 *
 * Ebenfalls auf Ansage raus: der Knopf auf `llms.txt`. Er war der einzige
 * Beleg, den der Leser selbst aufmachen konnte — dafür hat der Block jetzt zwei
 * Marken, die jeder kennt. Die Datei wird weiter erzeugt und ausgeliefert, sie
 * steht nur nicht mehr hier.
 *
 * ## Das Label
 *
 * Das Muster *Rechteck-Label → Überschrift → Erklärabsatz* ist als
 * Sektionsaufbau ausdrücklich raus (Vorgabe Ayham). Das Label bleibt trotzdem —
 * auf ebenso ausdrückliche Ansage vom 07.09.2026 („als kleines Button so oder
 * als kleines Label"): Es ist keine Kategorie über der Überschrift, sondern der
 * Marker selbst. Darunter folgt kein Erklärabsatz.
 *
 * ## Die Bewegung
 *
 * Aussage und Marken laufen beim Hereinscrollen versetzt von unten ein —
 * `agenten-einlauf` auf beiden, `agenten-einlauf-spaet` zusaetzlich auf der
 * Markenreihe, damit sie nach der Aussage ankommt (Regeln in `src/index.css`). Scroll-getrieben in CSS, ohne
 * JavaScript: Der Block bleibt eine Server Component, animiert wird
 * ausschließlich `transform`, und ohne Timeline-Unterstützung oder bei
 * `prefers-reduced-motion: reduce` passiert schlicht nichts.
 *
 * ## Die Zeichen
 *
 * Einfarbig über `currentColor`, 24×24-Raster, Quelle wie im Hero-Laufband.
 * ⚠️ Fehlt ein Zeichen (`pfad: null`, derzeit Codex), rendert diese Komponente
 * an seiner Stelle **nichts** — keinen Kasten, keinen Rahmen, kein
 * Ersatzsymbol. Die Zeile hält die Höhe, damit beide Namen auf einer Linie
 * sitzen. Ein angedeutetes Logo wäre dasselbe Problem wie ein angedeutetes
 * Prüfzeichen: Es wirkt wie ein vorhandenes.
 *
 * Kein JSON-LD: Es gibt keinen Schema.org-Typ für „diese Software hat einen
 * Agentenzugang". Was es gäbe, wäre `SoftwareApplication` — das würde die
 * Bauweise zu einem Produkt erklären, das es so nicht gibt.
 */
export function Agentenfaehig() {
  return (
    <section
      id="agentenfaehig"
      className={`${SITE_CONTAINER} scroll-mt-8 pb-16 pt-12 sm:pb-20 sm:pt-16`}
      aria-labelledby="agentenfaehig-heading"
    >
      {/* Der Marker. Eckig, in der Signalfarbe, `w-fit` — er soll die Zeile
          nicht füllen, sondern in ihr stehen. */}
      <p className="inline-flex w-fit bg-primary px-3 py-1.5 text-mini font-bold uppercase tracking-[0.1em] text-primary-foreground">
        {AGENTEN_LABEL}
      </p>

      {/* Größer als die bisherigen Fassungen: Der Satz ist jetzt der Block.
          `max-w` hält ihn auf zwei bis drei Zeilen — über die volle
          Containerbreite gelesen, verliert eine Aussage ihre Wucht. */}
      <h2
        id="agentenfaehig-heading"
        className="agenten-einlauf kinetic-display mt-6 max-w-[900px] text-balance text-[28px] leading-[1.12] text-foreground sm:text-[40px] dt:text-[48px]"
      >
        {AGENTEN_AUSSAGE}
      </h2>

      {/*
        Die Marken. Bewusst kein Raster, keine Trennlinien, keine Kästen: zwei
        Zeichen mit Namen, weit gesetzt, mit Luft darum. Auf dem Handy
        untereinander, ab `sm` nebeneinander.

        `gap-x-14` statt einer Trennlinie — der Abstand ordnet die beiden
        Marken, ohne einen Strich zu setzen, der sie wieder zu Spalten macht.
      */}
      <ul className="agenten-einlauf agenten-einlauf-spaet mt-12 flex flex-col gap-y-8 sm:flex-row sm:flex-wrap sm:items-start sm:gap-x-14">
        {agentenMarken.map((marke) => (
          <li key={marke.id} className="flex flex-col">
            {/*
              Feste Höhe, damit die Namen beider Marken auf einer Linie sitzen —
              auch solange für eine kein Zeichen vorliegt. Dort steht dann
              einfach Luft, siehe Warnung im Kopf.
            */}
            <div className="flex h-11 items-center" aria-hidden="true">
              {marke.pfad && (
                <svg viewBox="0 0 24 24" className="h-10 w-10 text-foreground" fill="currentColor">
                  <path d={marke.pfad} />
                </svg>
              )}
            </div>

            <p className="kinetic-display mt-4 text-[26px] leading-none text-foreground sm:text-[30px]">
              {marke.name}
            </p>
            <p className="mt-2 text-mini font-normal text-muted-foreground">{marke.hersteller}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
