"use client";

import { PageShell } from "@/components/layout/PageShell";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import {
  StructuredData,
  getWebPageSchema,
  getBreadcrumbSchema,
} from "@/components/seo/StructuredData";
import { ReferenceCard } from "@/components/sections/ReferenceCard";
import { ReferenceCta } from "@/components/sections/ReferenceCta";
import { MicrosoftLoesungen } from "@/components/sections/MicrosoftLoesungen";
import { clientResults } from "@/data/client-results";
import { WeiterlesenBlock } from "@/components/sections/WeiterlesenBlock";
import type { ArtikelTeaser } from "@/lib/wissen/empfehlungen";

/**
 * Referenz-Übersicht: Headline, zwei Kennzahl-Kacheln, darunter das Kartenraster.
 *
 * Kein Rechteck-Label und kein Erklärabsatz im Kopfbereich — die Abfolge
 * Label -> Headline -> Fließtext ist als Sektionsaufbau ausdrücklich raus.
 *
 * Die Einordnung, dass die Fälle hier eine Auswahl aus über 50 abgeschlossenen
 * Projekten sind und nicht das Gesamtwerk, trägt jetzt das Kachel-Paar: 50+
 * gegen die Anzahl der Detailfälle. Diese Information darf nicht verschwinden —
 * sonst liest sich die Seite wie das gesamte Werk und verkauft die Firma unter Wert.
 *
 * Alle Inhalte kommen aus `src/data/client-results.ts`. Hier wird nichts ergänzt,
 * gerundet oder ausgeschmückt.
 *
 * Unter dem Kartenraster steht seit dem 04.09.2026 `MicrosoftLoesungen` — die
 * Bauweise im Power-Platform-Umfeld, ausdrücklich als solche gekennzeichnet und
 * ohne Kunden. Die Trennung zwischen „Aussage über einen Kunden" (oben) und
 * „Aussage über uns" (unten) ist der Zweck des Aufbaus, nicht eine Formalie;
 * warum das so entschieden wurde, steht im Kopf von
 * `src/data/microsoft-loesungen.ts`.
 */
export default function Referenzen({ wissen = [] }: { wissen?: ArtikelTeaser[] }) {
  return (
    <PageShell>
      <StructuredData
        data={[
          getWebPageSchema(
            "Referenzen",
            "Kundenfälle mit Zahlen: was gebaut wurde und was es dem Unternehmen gebracht hat.",
            "https://kitech-software.de/referenzen"
          ),
          getBreadcrumbSchema([
            { name: "Startseite", url: "https://kitech-software.de/" },
            { name: "Referenzen", url: "https://kitech-software.de/referenzen" },
          ]),
        ]}
      />

      <section className={`${SITE_CONTAINER} pb-4 pt-14 sm:pt-20`}>
        <h1 className="kinetic-display kinetic-morph-in max-w-[820px] text-balance text-[36px] leading-[1.1] text-foreground sm:text-[48px]">
          Fälle, bei denen die Zahl für sich spricht.
        </h1>

        {/* Eine Kachel, nicht zwei. Die zweite trug die Anzahl der Detailfälle
            ("5 davon hier im Detail") und ist auf Ansage entfallen (12.08.2026):
            Sie zählt herunter, was die 50+ daneben gerade aufgebaut hat. Die
            Fälle stehen ohnehin direkt darunter — wer sie zählen will, sieht
            sie. */}
        <div className="mt-9 flex min-h-[150px] max-w-[250px] flex-col items-center justify-center bg-primary px-5 text-center text-primary-foreground">
          <p className="kinetic-data text-[38px] font-light leading-none">50+</p>
          <p className="mt-3 max-w-[170px] text-fliess font-semibold leading-[1.25]">
            Projekte abgeschlossen
          </p>
        </div>
      </section>

      <section className={`${SITE_CONTAINER} pb-20 pt-14 sm:pb-28`}>
        <h2 className="sr-only">Alle Kundenfälle</h2>
        <div className="grid gap-7 sm:grid-cols-2">
          {clientResults.map((result) => (
            <ReferenceCard key={result.slug} result={result} />
          ))}
        </div>
      </section>

      {/* Die Bauweise im Microsoft-Umfeld (04.09.2026). Steht UNTER den
          Kundenfällen und sieht bewusst anders aus als eine Referenzkarte —
          Begründung im Kopf der Komponente und in
          `src/data/microsoft-loesungen.ts`. */}
      <MicrosoftLoesungen />

      <WeiterlesenBlock
        artikel={wissen}
        heading="Wie gearbeitet wird, nicht nur was dabei herauskam."
        text="Aus denselben Projekten: die Entscheidungen dahinter, offen aufgeschrieben."
      />

      <ReferenceCta position="referenzen-uebersicht" />
    </PageShell>
  );
}
