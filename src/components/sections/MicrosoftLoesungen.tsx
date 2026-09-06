import { SITE_CONTAINER } from "@/components/layout/site-container";
import { microsoftLoesungen } from "@/data/microsoft-loesungen";

/**
 * „Was wir im Microsoft-Umfeld bauen" — drei Aufbauten mit Kette und
 * Werkzeugen, auf `/referenzen` unter den Kundenfällen. Inhalt und die Regeln
 * dafür: `src/data/microsoft-loesungen.ts`.
 *
 * **Der Block steht UNTER den Kundenfällen, nicht dazwischen.** Oben stehen
 * echte Projekte mit Kunde, Zahl und Beleg; hier steht die Bauweise. Wer beides
 * mischt — als vierte Karte im selben Raster, in derselben Optik — macht aus
 * einer Aussage über uns eine Aussage über einen Kunden, den es nicht gibt.
 * Deshalb sieht dieser Abschnitt bewusst anders aus als eine Referenzkarte und
 * sagt im ersten Satz, was er ist.
 *
 * Kein JSON-LD: Ein Schema würde Suchmaschinen genau die Gleichsetzung anbieten,
 * die der Aufbau vermeidet.
 *
 * Gestaltung nach der Hausregel — Aussage als Überschrift, Listen mit
 * Trennlinien statt Kacheln, keine `rounded-*`. Die Zeile aus Produktnamen ist
 * bewusst Text und kein Logo-Raster: Logos an dieser Stelle lesen sich als
 * Partnerschaft oder Zertifizierung, und beides ist es nicht.
 */
export function MicrosoftLoesungen() {
  return (
    <section
      id="microsoft-umfeld"
      className={`${SITE_CONTAINER} scroll-mt-8 pb-20 pt-4 sm:pb-24`}
      aria-labelledby="microsoft-umfeld-heading"
    >
      <h2
        id="microsoft-umfeld-heading"
        className="kinetic-display max-w-[820px] text-balance text-[30px] leading-[1.15] text-foreground sm:text-h2"
      >
        Was wir im Microsoft-Umfeld bauen.
      </h2>

      {/* Der Kennzeichnungssatz. Er steht hier vorn und nicht klein am Ende:
          Was er sagt, entscheidet darüber, ob der Abschnitt eine Beschreibung
          oder eine Behauptung ist. */}
      <p className="mt-5 max-w-[660px] text-pretty text-lead font-normal text-muted-foreground">
        Drei Aufbauten, so wie wir sie umsetzen — die Bauweise, nicht ein einzelner
        Kundenfall. Die echten Projekte mit Namen und Zahlen stehen oben.
      </p>

      <div className="mt-12 divide-y divide-border border-y border-border">
        {microsoftLoesungen.map((loesung) => (
          <article
            key={loesung.id}
            className="grid gap-8 py-10 dt:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] dt:gap-14 dt:py-12"
          >
            <div>
              <h3 className="kinetic-display text-balance text-[21px] leading-[1.2] text-foreground">
                {loesung.titel}
              </h3>
              <p className="mt-4 text-fliess font-normal text-muted-foreground">
                {loesung.aufgabe}
              </p>

              {/* Die Produktnamen als eine Zeile. Zeichengenau — siehe
                  `stack-marken.test.ts` für den Grund. */}
              <p className="mt-6 text-mini font-semibold uppercase tracking-[0.08em] text-foreground/60">
                {loesung.werkzeuge.join(" · ")}
              </p>
            </div>

            <div>
              <ol className="space-y-4">
                {loesung.aufbau.map((schritt, index) => (
                  <li key={schritt.slice(0, 24)} className="flex gap-4">
                    <span
                      className="kinetic-data w-5 shrink-0 text-fliess font-normal leading-[22.5px] text-primary"
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <span className="text-fliess font-normal text-foreground">{schritt}</span>
                  </li>
                ))}
              </ol>

              {/* Was danach anders ist — ohne Kennzahl. Der senkrechte Strich
                  setzt den Satz ab, ohne ihn in eine Karte zu stecken. */}
              <p className="mt-7 border-l-2 border-primary pl-5 text-fliess font-semibold text-foreground">
                {loesung.wasSichAendert}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
