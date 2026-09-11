"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { angebot, konditionen } from "@/config/angebot";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { trackEvent } from "@/lib/plausible";

/**
 * Abschluss-CTA am Fuß einer Seite: Aussage links, dunkelblaue Pille rechts.
 *
 * Aufbau und Maße standen bis zum 05.08.2026 zweimal wörtlich gleich im Repo
 * (`FinalCta`, `ReferenceCta`) und wären mit jeder neuen Seite ein drittes und
 * viertes Mal dazugekommen. Beide bauen jetzt hierauf auf und geben nur noch
 * ihren Text und ihre Tracking-Position mit.
 *
 * Der Text bleibt bewusst pro Seite verschieden: wer von der Startseite über die
 * Referenzen zu den Leistungen läuft, soll nicht dreimal denselben Block lesen.
 * Die *Form* ist überall gleich, die *Aussage* nicht.
 */
export function CtaBanner({
  heading,
  /** Eine Zeile, die die Überschrift beantwortet — kein Erklärabsatz. */
  text,
  /** Landet als `position` im Plausible-Event. Muss pro Einbaustelle eindeutig sein. */
  position,
  label = angebot.cta,
  /**
   * Die zweite Zeile in der Pille: Preis und Dauer.
   *
   * Bis zum 11.09.2026 stand hier die Platzangabe ("Donnerstags — noch 2 von 5
   * Plätzen"). Sie ist auf Ansage von der ganzen Website genommen worden; die
   * Begruendung steht in `config/angebot.ts`. Wer eine eigene Zeile setzen
   * will, uebergibt `hint` — sie muss in eine 360-px-Pille passen.
   */
  hint = konditionen(),
  href = angebot.href,
}: {
  heading: string;
  text: string;
  position: string;
  label?: string;
  hint?: string;
  href?: string;
}) {
  /** Aus der Position eine gültige, eindeutige DOM-ID für die Überschrift bauen. */
  const headingId = `cta-${position.replace(/[^a-z0-9]+/gi, "-")}`;

  return (
    <section className="border-t border-border bg-background py-[64px]" aria-labelledby={headingId}>
      <div className={SITE_CONTAINER}>
        {/* Weisse Karte auf weissem Grund: der Ring und der weiche Schatten
            heben den Block ab, ohne einen zweiten Farbton einzufuehren. So
            sitzt der Abschluss-CTA auf jeder Seite gleich, egal ob der
            Abschnitt darueber weiss oder auf `bg-surface` steht. */}
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-[560px]">
            <h2
              id={headingId}
              className="kinetic-display text-balance text-[28px] leading-[1.12] text-foreground sm:text-h2"
            >
              {heading}
            </h2>
            {/* Nur eine Zeile statt eines Erklärabsatzes: Dauer und Platzangabe
                und "unverbindlich" stehen bereits im Button — sie hier zu wiederholen
                spült den CTA weich. Übrig bleibt der Satz, der wehtut. Er steht
                zurueckgenommen in `muted-foreground`, damit die Überschrift und
                die dunkelblaue Pille die Aufmerksamkeit behalten. */}
            <p className="mt-4 text-pretty text-fliess font-normal text-muted-foreground">
              {text}
            </p>
          </div>

          {/* Der eine Knopf der Seite: Pille, dunkelblau gefuellt, fetter Text.
              Weisse Schrift steht hier auf `bg-primary` — der einzige Grund
              im hellen Design, auf dem sie lesbar ist.

              **`min-h`, nicht `h` (17.08.2026).** Die Pille war auf 56 px
              festgenagelt. Solange die Beschriftung "Kostenloses Erstgespraech"
              hiess, passte das; mit "Kostenlosen 1:1-KI-Check sichern" brach der
              Text zweizeilig um und lief oben und unten aus der Pille heraus —
              der Knopf sah kaputt aus. Feste Hoehen vertragen keinen laengeren
              Text: wer hier wieder `h-[…]` setzt, baut denselben Fehler ein.
              Dieselbe Lehre wie im Hero der Startseite. */}
          <Link
            href={href}
            onClick={() => trackEvent("Calendly_Klick", { position })}
            className="inline-flex min-h-[60px] w-full max-w-[360px] shrink-0 items-center justify-between gap-4 rounded-full bg-primary px-6 py-3 text-primary-foreground shadow-soft transition-colors hover:bg-primary/90 sm:px-7"
          >
            <span className="flex min-w-0 flex-col text-left">
              <span className="text-fliess font-bold leading-tight">{label}</span>
              <span className="mt-1 text-mini font-normal leading-tight text-primary-foreground/75">
                {hint}
              </span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
