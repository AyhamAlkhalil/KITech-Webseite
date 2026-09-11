"use client";

import Link from "next/link";
import { Linkedin } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { PageHeading } from "@/components/sections/PageHeading";
import { CtaBanner } from "@/components/sections/CtaBanner";
import {
  StructuredData,
  getWebPageSchema,
  getBreadcrumbSchema,
  getFounderPersonSchema,
} from "@/components/seo/StructuredData";
import { founderInfo } from "@/components/sections/FounderPortrait";
import { principles, commitments } from "@/data/principles";
import { company } from "@/config/company";
import { BASE_URL } from "@/lib/metadata";
import { WeiterlesenBlock } from "@/components/sections/WeiterlesenBlock";
import type { ArtikelTeaser } from "@/lib/wissen/empfehlungen";

/**
 * `/haltung` — wonach entschieden wird, wenn es im Projekt eng wird.
 *
 * Neu aufgebaut statt aus `src/views/legacy/Haltung.tsx` übernommen: dort standen
 * die sechs Werte als abgerundetes Kartenraster mit Icon-Quadraten, dazu ein
 * zentriertes Herz-Symbol über einem Zitat. Beides ist im Relaunch raus.
 *
 * Hier trägt das Gründerzitat den Kopf der Seite — es ist die Haltung, alles
 * darunter ist ihre Anwendung.
 *
 * Inhalte in `src/data/principles.ts`.
 */
export default function Haltung({ wissen = [] }: { wissen?: ArtikelTeaser[] }) {
  return (
    <PageShell>
      <StructuredData
        data={[
          getWebPageSchema(
            "Haltung",
            "Wonach wir entscheiden, wenn es im Projekt eng wird.",
            `${BASE_URL}/haltung`
          ),
          getBreadcrumbSchema([
            { name: "Startseite", url: `${BASE_URL}/` },
            { name: "Haltung", url: `${BASE_URL}/haltung` },
          ]),
          getFounderPersonSchema(),
        ]}
      />

      {/*
        Kopf wie ein Hero, nicht wie eine Unterseitenüberschrift (Vorgabe
        12.08.2026: "Die Haltung muss richtig fett sein, quasi ein bisschen wie
        die Hero Section"). Deshalb steht hier kein `PageHeading` mehr, sondern
        dieselbe Typografie wie auf der Startseite: 50 px, Versalien, extrafett,
        auf hellgrauem Grund.

        Der Wortlaut ist von Ayham vorgegeben und bewusst nicht umformuliert.
      */}
      <section className="bg-surface-strong">
        <div className={`${SITE_CONTAINER} py-16 text-center sm:py-24`}>
          <h1 className="kinetic-morph-in mx-auto max-w-[820px] text-balance text-[38px] font-extrabold uppercase leading-[1.08] tracking-tight text-foreground sm:text-[50px] sm:leading-[57.5px]">
            Wer KI falsch einsetzt oder ohne Expertise arbeitet, verbrennt Geld.
          </h1>

          <p className="mx-auto mt-7 max-w-[680px] text-pretty text-[18px] font-normal leading-[27px] text-foreground dt:text-subline">
            Die KI wird dir immer einreden, dass das, was du machst, richtig ist. Aber du
            brauchst eine 1:1-Betreuung, damit du wirklich das Beste rausholst.
          </p>
        </div>
      </section>

      {/* Gründer: Portrait und Aussage nebeneinander. Kein Erklärabsatz über der
          Person, kein Icon — das Gesicht und der Satz reichen. */}
      <section className={`${SITE_CONTAINER} py-16 sm:py-20`} aria-labelledby="gruender">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:items-center lg:gap-14">
          <img
            src={founderInfo.imageUrl}
            alt={`${founderInfo.name}, ${founderInfo.role} von KITech Software`}
            className="portrait-fade w-full max-w-[300px] border border-border bg-surface object-contain object-bottom"
          />

          <div className="min-w-0">
            <h2 id="gruender" className="sr-only">
              Der Gründer
            </h2>

            <blockquote className="kinetic-display text-balance text-h3 leading-[1.25] text-foreground sm:text-[36px]">
              {/* Wortgleich mit `src/data/gruenderwort.ts` — am 17.08.2026 dort
                  gekürzt und hier mitgezogen. Zwei Fassungen desselben Zitats
                  lesen sich wie ein Werbetext, der je nach Seite angepasst wird. */}
              „Sechsstellige Beträge enden in einer schicken Demo statt in der Bilanz.
              Das kann sich kein Mittelständler leisten.“
            </blockquote>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <div>
                <p className="text-[15px] font-semibold leading-tight text-foreground">
                  {founderInfo.name}
                </p>
                <p className="mt-1 text-[12px] leading-tight text-muted-foreground">
                  {founderInfo.role}, {company.shortName}
                </p>
              </div>

              <a
                href={founderInfo.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-border px-3 py-2 text-[12px] text-foreground/80 transition-colors hover:border-primary hover:text-primary"
              >
                <Linkedin className="h-3.5 w-3.5" aria-hidden="true" />
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Werte als durchlaufende Liste mit Trennlinien. Sechs gleich große Karten
          mit Icons wären wieder das Raster, das im Relaunch abgeschafft wurde. */}
      <section className={`${SITE_CONTAINER} pb-16`} aria-labelledby="werte">
        <h2
          id="werte"
          className="kinetic-display text-balance text-h3 leading-tight text-foreground sm:text-[36px]"
        >
          Wonach wir entscheiden.
        </h2>

        <dl className="mt-10 divide-y divide-border/60 border-y border-border/60">
          {principles.map((principle) => (
            <div key={principle.title} className="grid gap-3 py-7 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-10">
              <dt className="text-lead font-semibold leading-snug text-foreground sm:text-lead">
                {principle.title}
              </dt>
              <dd className="max-w-[620px] text-pretty text-[15px] leading-[1.6] text-muted-foreground">
                {principle.description}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Zusagen: knappe Liste, zwei Spalten. Keine Häkchen-Symbole — die Aussage
          steht schon da, ein Haken davor macht sie nicht wahrer. */}
      <section className={`${SITE_CONTAINER} pb-20 sm:pb-24`} aria-labelledby="zusagen">
        <h2
          id="zusagen"
          className="kinetic-display text-balance text-h3 leading-tight text-foreground sm:text-[36px]"
        >
          Was ihr in jedem Projekt bekommt.
        </h2>

        <ul className="mt-9 grid gap-px border border-border bg-border sm:grid-cols-2">
          {commitments.map((item) => (
            <li key={item} className="bg-background p-6 text-[15px] leading-[1.5] text-foreground/88">
              {item}
            </li>
          ))}
        </ul>

        <p className="mt-8 text-fliess leading-[1.6] text-muted-foreground">
          Wie das in echten Projekten aussieht, steht bei den{" "}
          <Link href="/referenzen" className="text-foreground underline underline-offset-4 hover:text-primary">
            Referenzen
          </Link>
          .
        </p>
      </section>

      <WeiterlesenBlock
        artikel={wissen}
        heading="Haltung zeigt sich im Detail."
        text="Was das konkret heißt, steht in den Artikeln — samt der Entscheidungen, die sich als falsch herausgestellt haben."
      />

      <CtaBanner
        heading="Passt das zu dem, was ihr sucht?"
        text="Dreißig Minuten reichen, um herauszufinden, ob wir zusammenpassen — oder eben nicht."
        position="haltung-abschluss"
      />
    </PageShell>
  );
}
