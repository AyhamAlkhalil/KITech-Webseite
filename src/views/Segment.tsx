"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { angebot } from "@/config/angebot";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { PageHeading } from "@/components/sections/PageHeading";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { ClientResults } from "@/components/sections/ClientResults";
import { Konformitaet } from "@/components/sections/Konformitaet";
import {
  StructuredData,
  getWebPageSchema,
  getBreadcrumbSchema,
} from "@/components/seo/StructuredData";
import type { SegmentContent } from "@/data/segments";
import { BASE_URL } from "@/lib/metadata";
import { WeiterlesenBlock } from "@/components/sections/WeiterlesenBlock";
import type { ArtikelTeaser } from "@/lib/wissen/empfehlungen";

/**
 * Gemeinsame Vorlage für `/solo` und `/enterprise`.
 *
 * Eine Vorlage statt zweier Seiten, weil beide dieselbe Argumentationskette
 * haben — Ausgangslage, was gebaut wird, wie es abläuft, Beweis, Termin. Nur die
 * Zielgruppe wechselt. Die beiden Alt-Seiten waren zusammen über 1600 Zeilen und
 * hatten trotzdem denselben Aufbau; jede Änderung musste zweimal gemacht werden.
 *
 * Inhalte in `src/data/segments.ts`.
 */
export function Segment({
  content,
  wissen = [],
}: {
  content: SegmentContent;
  wissen?: ArtikelTeaser[];
}) {
  return (
    <PageShell backdropClassName="absolute inset-x-0 top-0 -z-10 h-[560px] sm:h-[640px]">
      <StructuredData
        data={[
          getWebPageSchema(
            `${content.headline} ${content.headlineHighlight}`,
            content.lead,
            `${BASE_URL}/${content.slug}`
          ),
          getBreadcrumbSchema([
            { name: "Startseite", url: `${BASE_URL}/` },
            { name: "Leistungen", url: `${BASE_URL}/leistungen` },
            {
              name: content.key === "solo" ? "Für Selbstständige" : "Für Unternehmen",
              url: `${BASE_URL}/${content.slug}`,
            },
          ]),
        ]}
      />

      <PageHeading
        /* Überschrift und Hervorhebung stehen in `segments.ts` getrennt, weil
           der zweite Teil früher im blauen Marker stand. Der ist seit dem
           14.08.2026 überall raus — jetzt bilden beide einen Satz. */
        title={`${content.headline} ${content.headlineHighlight}`}
        lead={content.lead}
      >
        <Link
          href="/lass-uns-reden"
          /* `min-h` statt fester Hoehe — dieselbe Stelle wie im `CtaBanner`:
             die laengere Beschriftung aus `angebot.ts` bricht zweizeilig um. */
          className="mt-10 inline-flex min-h-[60px] w-full max-w-[360px] items-center justify-between gap-4 bg-primary px-6 py-3 text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <span className="flex min-w-0 flex-col text-left">
            <span className="text-fliess font-semibold leading-tight">
              {angebot.cta}
            </span>
            <span className="mt-1 text-mini leading-tight text-primary-foreground/58">
              30 Minuten, unverbindlich
            </span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
        </Link>
      </PageHeading>

      {/* Ausgangslage: Liste mit Trennlinien. Der Blick läuft durch, statt an
          gleich großen Kacheln hängen zu bleiben — dasselbe Muster wie auf
          /community und /warum. */}
      <section className={`${SITE_CONTAINER} py-16 sm:py-20`} aria-labelledby="ausgangslage">
        <h2
          id="ausgangslage"
          className="kinetic-display text-balance text-h3 leading-tight text-foreground sm:text-[36px]"
        >
          {content.painHeading}
        </h2>

        <ul className="mt-10 max-w-[860px]">
          {content.painPoints.map((point, index) => (
            <li
              key={point}
              className={`py-6 text-[16px] leading-[1.5] text-foreground/88 sm:text-lead ${
                index > 0 ? "border-t border-border/60" : ""
              }`}
            >
              {point}
            </li>
          ))}
        </ul>
      </section>

      {/* Was gebaut wird: Trennlinien-Raster (gap-px auf Border-Grund). */}
      <section className={`${SITE_CONTAINER} pb-16`} aria-labelledby="leistungsumfang">
        <h2
          id="leistungsumfang"
          className="kinetic-display text-balance text-h3 leading-tight text-foreground sm:text-[36px]"
        >
          {content.capabilityHeading}
        </h2>

        <ul className="mt-9 grid gap-px border border-border bg-border sm:grid-cols-2">
          {content.capabilities.map((capability) => (
            <li key={capability.title} className="bg-background p-7">
              <h3 className="text-lead font-semibold leading-snug text-foreground sm:text-lead">
                {capability.title}
              </h3>
              <p className="mt-3 text-pretty text-fliess leading-[1.6] text-muted-foreground">
                {capability.description}
              </p>
              {capability.stack && (
                <p className="kinetic-data mt-4 text-mini uppercase tracking-wide text-accent">
                  {capability.stack}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Ablauf: drei nummerierte Schritte nebeneinander. Hier ist das Raster
          richtig — die Schritte sind gleichrangig, nur zeitlich sortiert. */}
      <section className={`${SITE_CONTAINER} pb-16`} aria-labelledby="ablauf">
        <h2
          id="ablauf"
          className="kinetic-display text-balance text-h3 leading-tight text-foreground sm:text-[36px]"
        >
          {content.processHeading}
        </h2>

        <ol className="mt-9 grid gap-px border border-border bg-border md:grid-cols-3">
          {content.process.map((step) => (
            <li key={step.number} className="bg-background p-7">
              <span className="kinetic-data text-h3 font-light leading-none text-accent">
                {step.number}
              </span>
              <h3 className="mt-5 text-lead font-semibold leading-snug text-foreground sm:text-lead">
                {step.title}
              </h3>
              <p className="mt-3 text-pretty text-fliess leading-[1.6] text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>

        {/* Weiterführung in den passenden Sales Letter. Steht bewusst nach dem
            Ablauf: wer bis hier gelesen hat und noch nicht überzeugt ist, will
            den langen Text. */}
        <Link
          href={content.letter.href}
          className="group mt-10 inline-flex items-center gap-3 border border-border px-5 py-4 text-fliess text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          {content.letter.label}
          <ArrowRight
            className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </section>

      {/* Beweis: dieselben Ergebniskarten wie auf Startseite und Sales Lettern. */}
      <ClientResults />

      <WeiterlesenBlock
        artikel={wissen}
        heading={content.wissen.heading}
        text={content.wissen.text}
      />

      {/* Derselbe Konformitätsblock wie auf der Startseite — er gilt für beide
          Zielgruppen und steht auch hier vor dem Abschluss-CTA. */}
      <Konformitaet />

      <CtaBanner
        heading={content.cta.heading}
        text={content.cta.text}
        position={`segment-${content.key}`}
      />
    </PageShell>
  );
}
