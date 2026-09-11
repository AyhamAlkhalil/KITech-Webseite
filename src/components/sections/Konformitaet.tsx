import Link from "next/link";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { konformitaetsPunkte, siegel } from "@/data/konformitaet";

/**
 * Der Konformitätsblock am Seitenende: vier Angaben, jede mit Beleg auf dieser
 * Website, darunter — sobald vorhanden — die verliehenen Prüfzeichen.
 * Inhalt und die Regeln dafür: `src/data/konformitaet.ts`.
 *
 * **Warum jede Zeile verlinkt ist.** Eine Konformitätsaussage, die man nicht
 * nachschlagen kann, ist eine Behauptung wie jede andere — und wird auch so
 * gelesen. Der Link daneben ist deshalb nicht Beiwerk, sondern der Unterschied
 * zwischen einem Siegel und einem Bild von einem Siegel. Wer eine Zeile ohne
 * `beleg` ergänzen will, hat die falsche Zeile.
 *
 * ⚠️ Der Bereich für echte Prüfzeichen erscheint **nur**, wenn `siegel`
 * gefüllt ist. Kein Platzhalter, kein graues Kästchen, kein „Zertifizierung in
 * Vorbereitung": Eine angedeutete Zertifizierung wirkt wie eine vorhandene.
 *
 * Gestaltung nach der Hausregel: Trennlinien statt Kacheln, nichts abgerundet,
 * kein Icon im Quadrat. Am Desktop stehen die vier Angaben nebeneinander und
 * sind durch senkrechte Linien getrennt — das liest sich als Leiste, ohne dass
 * es vier Karten werden.
 *
 * ⚠️ Die Spaltenzahl in `dt:grid-cols-*` muss zur Zahl der Einträge passen.
 * Sie stand bis zum 11.09.2026 auf fünf; als der fünfte Eintrag fiel, wäre
 * sonst eine leere Spalte stehen geblieben.
 */
export function Konformitaet() {
  return (
    <section
      className={`${SITE_CONTAINER} pb-16 pt-4 sm:pb-20`}
      aria-labelledby="konformitaet-heading"
    >
      <h2
        id="konformitaet-heading"
        className="kinetic-display max-w-[720px] text-balance text-[26px] leading-[1.15] text-foreground sm:text-[30px]"
      >
        In Hannover gebaut, in Deutschland betrieben.
      </h2>
      <ul className="mt-8 grid divide-y divide-border border-y border-border sm:grid-cols-2 sm:gap-x-10 dt:grid-cols-4 dt:gap-x-0 dt:divide-x dt:divide-y-0">
        {konformitaetsPunkte.map((punkt) => (
          <li
            key={punkt.titel}
            /* Kein waagerechter Innenabstand, solange es keine senkrechten
               Trennlinien gibt — bei zwei Spalten schiebt `gap-x` sie
               auseinander. Erst ab `dt` trennt eine Linie, und erst dann
               braucht sie Luft. `first`/`last` halten die Leiste an beiden
               Enden buendig mit der Ueberschrift darueber. */
            className="flex flex-col py-6 dt:px-5 dt:py-7 dt:first:pl-0 dt:last:pr-0"
          >
            {/* Der Strich in der Signalfarbe ersetzt das Icon: er ordnet die
                Spalte, ohne ein Symbol zu erfinden, das nichts bedeutet. */}
            <span className="h-[3px] w-8 bg-primary" aria-hidden="true" />

            <h3 className="mt-4 text-fliess font-bold leading-snug text-foreground">
              {punkt.titel}
            </h3>
            <p className="mt-2 flex-1 text-mini font-normal leading-[1.55] text-muted-foreground">
              {punkt.text}
            </p>

            <Link
              href={punkt.beleg.href}
              className="mt-4 inline-flex w-fit text-mini font-bold text-primary transition-opacity hover:opacity-75"
            >
              {punkt.beleg.label} →
            </Link>
          </li>
        ))}
      </ul>

      {/*
        Nur wenn wirklich Prüfzeichen vorliegen — siehe Kopf von
        `data/konformitaet.ts`. Kein Platzhalter, kein graues Kästchen: Eine
        angedeutete Zertifizierung wirkt wie eine vorhandene.

        ⚠️ **Die Datei wird gezeigt, nicht gerahmt.** Die Kachel mit dem
        schwarzen Fußbalken, die man von Microsoft-Badges kennt, steckt bereits
        im gelieferten Bild. Ein eigener Rahmen, ein eigener Balken oder eine
        Einfärbung darum wäre eine Veränderung des Zeichens — und die ist auch
        mit vorhandenem Status untersagt. Deshalb steht hier nur eine
        einheitliche Höhe und der Abstand dazwischen.
      */}
      {siegel.length > 0 && (
        <div className="mt-12">
          <h3 className="text-mini font-semibold uppercase tracking-[0.08em] text-foreground/60">
            Verliehen und nachprüfbar
          </h3>

          <ul className="mt-6 flex flex-wrap items-start gap-x-8 gap-y-6">
            {siegel.map((zeichen) => {
              /* Der Alternativtext trägt die Designation mit: Drei Badges
                 desselben Programms sind sonst dreimal derselbe Satz. */
              const bezeichnung = zeichen.designation
                ? `${zeichen.name} — ${zeichen.designation}`
                : zeichen.name;

              return (
                <li key={bezeichnung}>
                  <a
                    href={zeichen.nachweisUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block transition-opacity hover:opacity-75"
                    title={`${bezeichnung}, vergeben von ${zeichen.aussteller}${
                      zeichen.gueltigBis ? `, gültig bis ${zeichen.gueltigBis}` : ""
                    }`}
                  >
                    <img
                      src={zeichen.logo}
                      alt={`${bezeichnung}, vergeben von ${zeichen.aussteller}`}
                      className="h-[104px] w-auto object-contain sm:h-[124px]"
                      loading="lazy"
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
