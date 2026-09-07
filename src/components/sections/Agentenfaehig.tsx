import { SITE_CONTAINER } from "@/components/layout/site-container";
import {
  AGENTEN_AUSSAGE,
  AGENTEN_EINORDNUNG,
  AGENTEN_LABEL,
  agentenBeleg,
  bedienwege,
} from "@/data/agentenfaehig";

/**
 * „Alles, was wir bauen, ist agentenfähig" — vier Zugänge als Leiste, darunter
 * der Beleg. Inhalt und die Regeln dafür: `src/data/agentenfaehig.ts`.
 *
 * Steht auf der Startseite unter dem Kundenlaufband und auf `/referenzen` unter
 * den Kundenkarten. Beide Male direkt hinter dem Beweis: Wer gerade gelesen
 * hat, was wir gebaut haben, erfährt hier, was jedes dieser Dinge zusätzlich
 * kann. Weiter unten stünde es hinter der Entscheidung.
 *
 * ## Zum Label
 *
 * Das Muster *Rechteck-Label → Überschrift → Erklärabsatz* ist als
 * Sektionsaufbau ausdrücklich raus (Vorgabe Ayham). Hier steht trotzdem ein
 * Label — auf ebenso ausdrückliche Ansage vom 07.09.2026 („als kleines Button
 * so oder als kleines Label"). Der Unterschied, wegen dem beides zusammengeht:
 * Das Label ist keine Kategorie über der Überschrift, sondern der Marker selbst
 * („Agentenfähig" ist die Eigenschaft, um die es geht), und darunter folgt kein
 * Erklärabsatz, sondern ein Satz und dann die vier Zugänge. Wer hier einen
 * zweiten Absatz einzieht, hat genau das Muster wieder da.
 *
 * Gestaltung nach der Hausregel: Trennlinien statt Kacheln, nichts abgerundet,
 * kein Icon im Quadrat. Die Leiste folgt bewusst demselben Aufbau wie
 * `Konformitaet` — vier kurze Angaben nebeneinander, senkrecht getrennt. Der
 * ausführliche Zeilenaufbau von `MicrosoftLoesungen` wäre hier falsch: Auf
 * `/referenzen` stehen beide Blöcke untereinander, und zweimal dasselbe Muster
 * liest sich als ein einziger langer Block.
 *
 * Der Beleg-Link ist der „Button" aus der Ansage: eckig, mit Rahmen, mit Ziel.
 * Ein Knopf ohne Ziel wäre an dieser Stelle Dekoration — und `llms.txt` ist der
 * einzige Beleg für Maschinenlesbarkeit, den der Leser sofort selbst aufmacht.
 *
 * Kein JSON-LD: Es gibt keinen Schema.org-Typ für „diese Software hat einen
 * Agentenzugang". Was es gäbe, wäre `SoftwareApplication` — das würde die
 * Bauweise zu einem Produkt erklären, das es so nicht gibt.
 */
export function Agentenfaehig() {
  return (
    <section
      id="agentenfaehig"
      className={`${SITE_CONTAINER} scroll-mt-8 pb-16 pt-14 sm:pb-20 sm:pt-20`}
      aria-labelledby="agentenfaehig-heading"
    >
      {/* Der Marker. Eckig, in der Signalfarbe, `w-fit` — er soll die Zeile
          nicht füllen, sondern in ihr stehen. */}
      <p className="inline-flex w-fit bg-primary px-3 py-1.5 text-mini font-bold uppercase tracking-[0.1em] text-primary-foreground">
        {AGENTEN_LABEL}
      </p>

      <h2
        id="agentenfaehig-heading"
        className="kinetic-display mt-5 max-w-[820px] text-balance text-[30px] leading-[1.15] text-foreground sm:text-h2"
      >
        {AGENTEN_AUSSAGE}
      </h2>

      <p className="mt-5 max-w-[720px] text-pretty text-lead font-normal text-muted-foreground">
        {AGENTEN_EINORDNUNG}
      </p>

      {/* Vier Spalten erst ab `dt`. Bei zwei Spalten trennt nur die waagerechte
          Linie — senkrechte Striche brauchen `gap-x`, und der schiebt die
          Spalten bei `sm` unnötig auseinander. Gleiche Rechnung wie in
          `Konformitaet`. */}
      <ul className="mt-11 grid divide-y divide-border border-y border-border sm:grid-cols-2 sm:gap-x-10 dt:grid-cols-4 dt:gap-x-0 dt:divide-x dt:divide-y-0">
        {bedienwege.map((weg) => (
          <li
            key={weg.id}
            className="flex flex-col py-6 dt:px-5 dt:py-7 dt:first:pl-0 dt:last:pr-0"
          >
            {/* Der Strich ordnet die Spalte, ohne ein Symbol zu erfinden, das
                nichts bedeutet. */}
            <span className="h-[3px] w-8 bg-primary" aria-hidden="true" />

            <h3 className="mt-4 text-fliess font-bold leading-snug text-foreground">
              {weg.titel}
            </h3>
            <p className="mt-2 flex-1 text-mini font-normal leading-[1.55] text-muted-foreground">
              {weg.text}
            </p>
          </li>
        ))}
      </ul>

      {/* Beleg und Knopf in einer Zeile — aber erst ab `sm`.
          ⚠️ Bei 360 px nachgesehen: Mit `flex-1` von Anfang an blieben dem Satz
          neben dem 187 px breiten Knopf noch 131 px, und er brach auf vier
          Wortfetzen um. Deshalb `w-full` bis `sm` (der Knopf rutscht darunter)
          und erst darüber die gemeinsame Zeile. `min-w-0` bleibt: ohne das
          gibt der Text nicht nach, sondern schiebt den Knopf aus dem Bild. */}
      <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
        <p className="w-full min-w-0 text-fliess font-normal text-muted-foreground sm:w-auto sm:flex-1">
          {agentenBeleg.satz}
        </p>

        {/* `min-h` statt `h`: die Beschriftung steht in der Datendatei und kann
            länger werden — bei fester Höhe liefe sie oben und unten heraus. */}
        <a
          href={agentenBeleg.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center border border-border px-5 py-2 text-fliess font-bold text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          {agentenBeleg.linkLabel} →
        </a>
      </div>
    </section>
  );
}
