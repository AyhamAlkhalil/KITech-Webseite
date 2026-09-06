import { stackMarken, type StackMarke } from "@/data/stack-marken";

/**
 * Die Werkzeuge, mit denen wir arbeiten — als langsam laufende Spur im Hero
 * der Startseite. Inhalt und Reihenfolge: `src/data/stack-marken.ts`.
 *
 * **Warum überhaupt (Ansage Ayham, 04.09.2026):** „Damit man erst mal sieht,
 * was ich alles kann, was Microsoft aber auch kann. Ich möchte keine KI-Agentur
 * sein, sondern eine IT-Agentur, die auch KI macht." Der Hero trägt weiterhin
 * genau **eine** Aussage — die Spur steht daneben, nicht darin, und beantwortet
 * still die Frage, die ein Einkäufer mit Microsoft im Haus zuerst stellt.
 *
 * ## Zwei Fassungen, dieselben Daten
 *
 *   `StackSaeule`  ab 1025 px (`dt`), absolut in der freien Spalte links neben
 *                  der Überschrift, läuft nach oben.
 *   `StackBand`    darunter, im Fluss unter dem Knopf, läuft nach links.
 *
 * Die Grenze ist dieselbe wie beim Hero-Portrait und aus demselben Grund: Bis
 * 1024 px ist der Knopf `w-full` und die H1 zentriert — links ist dort keine
 * freie Spalte, in die etwas passt. Wer die Grenze verschiebt, legt die Spur
 * über die Überschrift.
 *
 * ## Wie die Endlosschleife funktioniert
 *
 * Die Liste steht **zweimal** hintereinander, die Spur fährt um genau die
 * Hälfte (`.animate-stack-hoch` / `.animate-stack-quer` in `src/index.css`).
 * Weil beide Kopien gleich groß sind, ist die Hälfte exakt eine Kopienlänge —
 * die Wiederholung ist unsichtbar, ohne dass irgendwo eine Pixelhöhe gepflegt
 * werden muss. **Zahl der Kopien und Prozentwert im Keyframe gehören zusammen:**
 * drei Kopien wie beim Kundenlaufband bräuchten ein Drittel, sonst springt es.
 *
 * Kein `"use client"`: reines Markup plus CSS-Animation. Ein Zustand oder ein
 * Handler hier zöge die ganze Startseite zurück in den Browser (siehe Kopf von
 * `views/Home.tsx`).
 *
 * ## Rücksichten, die eingebaut bleiben
 *
 *   - Bei `prefers-reduced-motion` steht die Spur still (Regel in `index.css`).
 *     Eine Dauerbewegung direkt neben der Überschrift ist für Menschen mit
 *     vestibulären Beschwerden ein echtes Problem.
 *   - Die Marken sind für Screenreader **ein** Satz in `StackBand`, nicht
 *     sechzehn Fragmente. Alles Sichtbare trägt deshalb `aria-hidden`.
 *   - `pointer-events-none` an der Säule: Sie liegt neben der Überschrift und
 *     dürfte sonst beim Markieren von Text dazwischenkommen.
 *
 * Das `left-[15px]` der Säule ist der Innenabstand des Hero-Containers, nicht
 * Geschmack: Bei genau 1025 px — der Breite, ab der sie erscheint — fallen
 * Containerrand und Fensterrand zusammen, und ohne das Padding klebte die Spur
 * samt Trennlinien an der Fensterkante.
 */

/** Ein Symbol, einfarbig über `currentColor`. Größe kommt von außen. */
function MarkenSymbol({ marke, className }: { marke: StackMarke; className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d={marke.pfad} />
    </svg>
  );
}

/*
  Weiches Aus- und Einblenden an den Enden der Spur. Ohne die Maske schneidet
  der Rahmen die Symbole hart ab, und die Bewegung sieht aus, als säße sie in
  einem Kasten. `-webkit-mask-image` steht daneben für Safari vor 16.4.
*/
const MASKE_HOCH =
  "[mask-image:linear-gradient(to_bottom,transparent,black_16%,black_84%,transparent)] " +
  "[-webkit-mask-image:linear-gradient(to_bottom,transparent,black_16%,black_84%,transparent)]";

const MASKE_QUER =
  "[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] " +
  "[-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]";

/** Ein Element der senkrechten Säule: Symbol, darunter der Produktname. */
function SaeulenEintrag({ marke }: { marke: StackMarke }) {
  return (
    <div className="flex min-h-[92px] flex-col items-center justify-center gap-2 border-b border-foreground/10 px-2 text-center">
      <MarkenSymbol marke={marke} className="h-6 w-6 text-foreground/70" />
      <span className="text-[11px] font-medium leading-[1.25] text-foreground/75">
        {marke.name}
      </span>
    </div>
  );
}

/**
 * Die senkrechte Spur links neben der Überschrift. Gehört in ein Elternelement
 * mit `relative` — im Hero ist das der innere Container.
 */
export function StackSaeule() {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-0 left-[15px] top-0 hidden w-[112px] select-none overflow-hidden dt:block ${MASKE_HOCH}`}
    >
      <div className="animate-stack-hoch flex flex-col">
        {[0, 1].map((durchlauf) => (
          <div key={durchlauf} className="flex flex-col">
            {stackMarken.map((marke) => (
              <SaeulenEintrag key={`${durchlauf}-${marke.name}`} marke={marke} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Das waagerechte Band unter dem Knopf, bis 1024 px. Trägt zusätzlich den
 * einen Satz, den Screenreader vorlesen — **auf allen Breiten**, auch wenn das
 * Band selbst per `dt:hidden` verschwindet. Er steht deshalb außerhalb.
 */
export function StackBand() {
  return (
    <>
      <p className="sr-only">
        Wir arbeiten mit {stackMarken.map((m) => m.name).join(", ")}.
      </p>

      <div
        aria-hidden="true"
        className={`mt-8 w-full select-none overflow-hidden dt:hidden ${MASKE_QUER}`}
      >
        <div className="animate-stack-quer flex w-max">
          {[0, 1].map((durchlauf) => (
            <div key={durchlauf} className="flex">
              {stackMarken.map((marke) => (
                <div
                  key={`${durchlauf}-${marke.name}`}
                  className="flex items-center gap-2.5 whitespace-nowrap border-l border-foreground/10 px-5"
                >
                  <MarkenSymbol marke={marke} className="h-5 w-5 shrink-0 text-foreground/70" />
                  <span className="text-[12px] font-medium text-foreground/75">{marke.name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
