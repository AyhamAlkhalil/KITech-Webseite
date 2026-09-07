"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { clientResults, kartenLink, type ClientResult } from "@/data/client-results";
import { ReferencePortrait } from "@/components/sections/ReferencePortrait";
import { StarRating } from "@/components/sections/StarRating";
import { StattSterne } from "@/components/sections/StattSterne";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { trackEvent } from "@/lib/plausible";

/**
 * Kundenkarten als endlos durchlaufendes Laufband, direkt unter dem Hero.
 *
 * Vorgabe (12.08.2026): "Darunter sollen noch die Bilder der Kunden sein, aber
 * das sollen Karten sein, die einfach nach rechts links durchlaufen. Die gehen
 * automatisch durch." Es laufen **alle sechs** Faelle durch, die mit Foto
 * zuerst — so bestimmt `sortiert` weiter unten.
 *
 * Aufbau der Bewegung: die Liste steht **dreimal** hintereinander im DOM, und
 * die Spur faehrt per CSS-Animation um genau ein Drittel nach links
 * (`.animate-marquee` in src/index.css). Nach einem Durchlauf steht wieder
 * dasselbe Bild wie am Anfang — die Wiederholung ist dadurch unsichtbar und es
 * braucht kein JavaScript, das Positionen nachrechnet.
 *
 * Zwei Ruecksichten sind fest eingebaut:
 *   - Beim Ueberfahren mit der Maus haelt das Band an, damit man eine Karte
 *     lesen und anklicken kann, statt ihr hinterherzuzielen.
 *   - Bei `prefers-reduced-motion` steht es still (Regel in src/index.css).
 *     Ein dauerhaft laufendes Band ist fuer Menschen mit vestibulaeren
 *     Beschwerden ein echtes Problem, nicht nur eine Geschmacksfrage.
 *
 * Die beiden Kopien tragen `aria-hidden`: fuer Screenreader gibt es die Liste
 * genau einmal, sonst laese sie jeden Kunden dreimal vor.
 */

/** Faelle mit Foto zuerst, danach der Rest in Datenreihenfolge. */
const sortiert = [...clientResults].sort((a, b) => {
  const foto = (r: ClientResult) => (r.person?.photo ? 0 : 1);
  return foto(a) - foto(b);
});

function LaufbandKarte({
  result,
  /** Karte ohne Verlinkung rendern — siehe `ohneLinks` an `KundenLaufband`. */
  ohneLinks = false,
}: {
  result: ClientResult;
  ohneLinks?: boolean;
}) {
  /* Ziel und Beschriftung kommen aus den Daten (`klickZiel`), damit dieselbe
     Karte im Laufband und in der Uebersicht dasselbe tut. klargehalt fuehrt
     zum Beispiel direkt auf klargehalt.de. */
  const ziel = kartenLink(result);

  const klasse =
    "flex w-[260px] shrink-0 flex-col items-center border border-border px-5 pb-6 pt-6 text-center transition-colors hover:border-primary sm:w-[290px]";

  const inhalt = (
    <>
      {/*
        ERGEBNIS ZUERST (Vorgabe 12.08.2026): "Das Ergebnis muss deutlicher
        sein, es muss oben sein." Vorher stand die Kennzahl ganz unten, unter
        Bild, Name, Firma und Sternen — wer am Band vorbeischaut, las zuerst
        einen ihm unbekannten Namen und erst zuletzt, was dabei herauskam.

        Reihenfolge jetzt: Zahl, was es war, wer es war.
      */}
      <p className="kinetic-data text-[40px] font-light leading-none text-primary">
        {result.headline.value}
      </p>
      <p className="mt-2 text-fliess font-bold leading-snug text-foreground">
        {result.headline.label}
      </p>

      {/* Was gebaut wurde — ohne diese Zeile sagt "4 Wochen" nichts. */}
      <span className="mt-4 inline-block bg-primary px-3 py-1 text-mini font-bold uppercase tracking-wide text-primary-foreground">
        {result.kategorie}
      </span>

      {/*
        Feste Bildhoehe, damit alle Karten gleich aufgebaut sind. Ohne festen
        Platz saessen Name und Zahl in jeder Karte auf einer anderen Hoehe, und
        beim Durchlaufen wirkt das wie ein Wackeln.

        Reihenfolge: Portrait, sonst Firmenlogo, sonst leer.
      */}
      <div className="mt-5 flex h-[104px] items-center justify-center">
        {result.person?.photo ? (
          <ReferencePortrait
            person={result.person}
            className="w-[90px]"
            imageClassName="h-[104px]"
          />
        ) : result.logo ? (
          <img
            src={result.logo}
            alt=""
            aria-hidden="true"
            className="max-h-[56px] w-auto max-w-[150px] object-contain"
            loading="lazy"
          />
        ) : null}
      </div>

      {/* Ohne Person traegt die Firma die Karte allein — dann steht sie in der
          Zeile, in der sonst der Name steht, und nicht klein darunter. */}
      {result.person ? (
        <>
          <p className="mt-3 text-fliess font-bold leading-tight text-foreground">
            {result.person.name}
          </p>
          <p className="mt-1 text-mini font-normal text-muted-foreground">{result.company}</p>
        </>
      ) : (
        <p className="mt-3 text-fliess font-bold leading-tight text-foreground">
          {result.company}
        </p>
      )}

      {result.rating !== null ? (
        <div className="mt-2.5">
          <StarRating value={result.rating} />
        </div>
      ) : (
        result.stattSterne && (
          <div className="mt-2.5">
            <StattSterne text={result.stattSterne} />
          </div>
        )
      )}
    </>
  );

  const melden = () => trackEvent("CTA_Klick", { position: `laufband-${result.slug}` });

  /* Auf Kampagnenseiten zeigt die Karte nur — sie fuehrt nirgendwohin.
     `hover:border-primary` faellt mit weg: ein Rahmen, der auf Mausberuehrung
     reagiert, kuendigt einen Klick an, den es hier nicht gibt. */
  if (ohneLinks) {
    return <div className={klasse.replace(" transition-colors hover:border-primary", "")}>{inhalt}</div>;
  }

  if (ziel.extern) {
    return (
      <a
        href={ziel.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={melden}
        className={klasse}
      >
        {inhalt}
      </a>
    );
  }

  return (
    <Link href={ziel.href} onClick={melden} className={klasse}>
      {inhalt}
    </Link>
  );
}

/**
 * @param ohneLinks Karten ohne Verlinkung rendern. Auf den Kampagnenseiten
 *   (`/funnel`) gesetzt: sechs anklickbare Karten waeren sechs Ausgaenge aus
 *   einer Seite, die genau ein Ziel hat — dieselbe Ueberlegung, aus der dort
 *   auch die Hauptnavigation fehlt. Auf der Startseite bleibt es bei Links.
 */
export function KundenLaufband({ ohneLinks = false }: { ohneLinks?: boolean } = {}) {
  return (
    <section
      id="ergebnisse"
      className="scroll-mt-8 overflow-hidden bg-background pb-[50px] pt-[50px]"
      aria-labelledby="ergebnisse-heading"
    >
      {/*
        Bis zum 07.09.2026 stand hier „Kundenreferenzen" als `sr-only` — der
        stärkste Beleg der Website lief also unbeschriftet durchs Bild, und die
        Aussage dazu stand hinter dem FAQ-Akkordeon auf Position 2 von 6.

        „Wochen, keine Quartale." ist Ayhams eigener Satz aus `data/faq.ts`,
        hierher versetzt statt neu getextet. Bewusst **ohne** Erklärabsatz
        darunter: Die Karten tragen die Zahlen selbst („40 Tage bis live",
        „60 Tage bis live", „2 Wochen bis betriebsbereit"), und ein Satz, der
        sie ankündigt, stünde zwischen Behauptung und Beweis.
      */}
      <div className={`${SITE_CONTAINER} pb-8`}>
        <h2
          id="ergebnisse-heading"
          className="kinetic-display max-w-[720px] text-balance text-[26px] leading-[1.15] text-foreground sm:text-[30px]"
        >
          Wochen, keine Quartale.
        </h2>
      </div>

      {/* Das Band laeuft ueber die volle Fensterbreite, nicht im Seitencontainer:
          eine Bewegung, die an einer Containerkante beginnt und endet, sieht aus
          wie ein Fehler. Der Container gilt erst wieder fuer den Link darunter. */}
      <div className="group relative">
        {/*
          Die Pause beim Überfahren gilt nur für echte Zeigergeräte
          (`hover:hover`). Auf dem Handy löst eine Berührung beim Scrollen
          ebenfalls `:hover` aus — und der Zustand bleibt danach hängen, weil es
          kein "Wegbewegen" gibt. Das Band stand dort also nach dem ersten
          Antippen still, bis die Seite neu geladen wurde. Vorgabe 12.08.2026:
          "auf dem Handy nicht stoppen, auch wenn ich da langscrolle".
        */}
        <div className="flex w-max animate-marquee gap-6 [@media(hover:hover)]:group-hover:[animation-play-state:paused]">
          {[0, 1, 2].map((durchlauf) => (
            <div
              key={durchlauf}
              className="flex gap-6"
              aria-hidden={durchlauf > 0 ? "true" : undefined}
              /*
               * `inert` gehoert zwingend zu `aria-hidden` dazu: die Karten sind
               * Links und blieben sonst mit der Tabulatortaste erreichbar,
               * obwohl kein Screenreader sie ansagt (WCAG 4.1.2). Es waren zwoelf
               * solcher Stellen — der Fokus verschwand fuer Tastaturnutzer
               * scheinbar ins Nichts, und weil die Kopien ausserhalb des
               * sichtbaren Bereichs liegen, verschob der Browser beim Tabben
               * zusaetzlich das ganze Band.
               */
              inert={durchlauf > 0}
            >
              {sortiert.map((result) => (
                <LaufbandKarte
                  key={`${durchlauf}-${result.slug}`}
                  result={result}
                  ohneLinks={ohneLinks}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Auch dieser Link ist ein Ausgang — auf Kampagnenseiten bleibt er weg. */}
      {!ohneLinks && (
      <div className="mx-auto mt-10 flex w-full max-w-site justify-center px-[15px]">
        <Link
          href="/referenzen"
          onClick={() => trackEvent("CTA_Klick", { position: "laufband-alle-referenzen" })}
          className="inline-flex items-center gap-3 text-fliess font-bold text-primary transition-opacity hover:opacity-75"
        >
          Alle Referenzen ansehen
          <ArrowRight className="h-6 w-6 animate-pulse-nudge" strokeWidth={2.5} aria-hidden="true" />
        </Link>
      </div>
      )}
    </section>
  );
}
