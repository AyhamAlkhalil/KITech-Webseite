"use client";

import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { PageHeading } from "@/components/sections/PageHeading";
import { NavCard } from "@/components/sections/NavCard";
import { CtaBanner } from "@/components/sections/CtaBanner";
import {
  StructuredData,
  getWebPageSchema,
  getBreadcrumbSchema,
  getServiceSchema,
} from "@/components/seo/StructuredData";
import { leistungenEntry } from "@/config/navigation";
import { services, techStack } from "@/data/services";
import { BASE_URL } from "@/lib/metadata";
import { WeiterlesenBlock } from "@/components/sections/WeiterlesenBlock";
import type { ArtikelTeaser } from "@/lib/wissen/empfehlungen";

/**
 * `/leistungen` — was gebaut wird, in der Reihenfolge, in der es gebaut wird.
 *
 * Stand bis zum 05.08.2026 auf der Baustellenseite, obwohl die Alt-Seite den
 * Inhalt längst hatte. Neu aufgebaut, nicht kopiert: die Alt-Seite arbeitete mit
 * einem Raster aus sechs abgerundeten Karten, jede mit einem Icon in einem
 * abgerundeten Quadrat — genau die Baukasten-Optik, die im Relaunch raus ist.
 *
 * Hier stattdessen: eine durchlaufende Liste mit Nummern und Trennlinien. Sie
 * hat außerdem eine Aussage, die das Raster nicht hatte — dass die sechs Punkte
 * eine Reihenfolge haben und Punkt 5 (Daten) das Fundament für die davor ist.
 *
 * Inhalte in `src/data/services.ts`.
 */
/**
 * Zahlwörter für die Überschrift. Ausgeschrieben, weil „5 Schritte" in einer
 * Aussage-Überschrift wie eine Aufzählung aussieht statt wie ein Satz.
 *
 * Wächst die Liste über neun, greift der Rückfall auf die Ziffer — das ist
 * hässlich und genau deshalb der richtige Moment, die Seite neu zu denken.
 */
const ZAHLWORT = ["null", "Ein", "Zwei", "Drei", "Vier", "Fünf", "Sechs", "Sieben", "Acht", "Neun"];
const SCHRITTZAHL =
  services.length === 1
    ? "Ein Schritt"
    : `${ZAHLWORT[services.length] ?? services.length} Schritte`;

export default function Leistungen({ wissen = [] }: { wissen?: ArtikelTeaser[] }) {
  return (
    <PageShell>
      <StructuredData
        data={[
          getWebPageSchema(
            "Leistungen",
            "Vom Prozess-Audit über Power Automate und KI-Agenten bis zum laufenden Betrieb.",
            `${BASE_URL}/leistungen`
          ),
          getBreadcrumbSchema([
            { name: "Startseite", url: `${BASE_URL}/` },
            { name: "Leistungen", url: `${BASE_URL}/leistungen` },
          ]),
          getServiceSchema(
            "KI-Automatisierung und individuelle Softwarelösungen",
            "Prozess-Audit, KI-Agenten an euren Daten, Power Automate, Power BI und Dynamics 365 sowie laufender Betrieb für den deutschen Mittelstand."
          ),
        ]}
      />

      <PageHeading
        /*
         * ⚠️ Die Zahl kommt aus `services`, sie steht nicht im Text.
         *
         * Hier stand „Vier Schritte", während die Datei bereits fünf führte —
         * eine Überschrift, die ihrer eigenen Seite widerspricht, und der
         * Besucher zählt nach. Der Fehler entsteht zwangsläufig, sobald jemand
         * eine Leistung ergänzt und die H1 nicht mitliest. Abgeleitet kann er
         * nicht mehr auftreten.
         */
        title={`${SCHRITTZAHL}. In dieser Reihenfolge.`}
        lead="Erst rechnen, dann bauen, dann betreiben — und nur da, wo es sich trägt."
      />

      {/* Leistungen als durchlaufende Liste: Nummer links, Inhalt rechts.
          Trennlinien statt Kästen, damit die Reihenfolge lesbar bleibt — sechs
          gleich große Karten nebeneinander sagen "beliebig kombinierbar", und
          genau das stimmt hier nicht. */}
      <section className={`${SITE_CONTAINER} py-16 sm:py-20`} aria-labelledby="leistungen">
        <h2 id="leistungen" className="sr-only">
          Leistungen im Einzelnen
        </h2>

        <div className="divide-y divide-border/60 border-y border-border/60">
          {services.map((service) => (
            <article
              key={service.step}
              className="grid gap-6 py-10 sm:py-12 lg:grid-cols-[80px_minmax(0,1fr)_minmax(0,300px)] lg:gap-10"
            >
              <span className="kinetic-data text-[28px] font-light leading-none text-accent">
                {service.step}
              </span>

              <div className="min-w-0">
                <h3 className="kinetic-display text-balance text-h4 leading-[1.15] text-foreground sm:text-[27px]">
                  {service.title}
                </h3>
                <p className="mt-4 max-w-[560px] text-pretty text-[15px] leading-[1.65] text-foreground/82">
                  {service.description}
                </p>
              </div>

              {/* Die Stichpunktspalte entfällt, wenn keine da sind — seit der
                  Kürzung am 12.08.2026 ist das der Normalfall. Ohne diese
                  Prüfung bliebe rechts eine leere Rasterspalte stehen. */}
              <ul className={`space-y-2.5 ${service.bullets.length === 0 ? "hidden" : ""}`}>
                {service.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex gap-3 text-fliess leading-[1.5] text-muted-foreground"
                  >
                    <span className="mt-[7px] h-1 w-1 shrink-0 bg-accent" aria-hidden="true" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Weiche in die Beratungs- und Zielgruppen-Seiten. Ziele kommen aus der
          Navigations-Konfiguration, damit hier keine zweite Liste entsteht. */}
      <section className={`${SITE_CONTAINER} pb-16`} aria-labelledby="zielgruppen">
        <h2
          id="zielgruppen"
          className="kinetic-display text-balance text-h3 leading-tight text-foreground sm:text-[36px]"
        >
          Drei Einstiege, ein Ziel.
        </h2>

        <div className="mt-9 grid gap-6 md:grid-cols-3">
          {leistungenEntry.children?.map((child) => (
            <NavCard
              key={child.href}
              href={child.href}
              title={child.label}
              description={child.description}
            />
          ))}
        </div>
      </section>

      {/* Technologie: eine Zeile Belege, kein Kachelraster. Der Stack verkauft
          nichts — er beantwortet nur die Frage, worauf das Ganze läuft. */}
      <section className={`${SITE_CONTAINER} pb-20 sm:pb-24`} aria-labelledby="stack">
        <h2 id="stack" className="text-mini uppercase tracking-wide text-muted-foreground">
          Worauf es läuft
        </h2>
        <ul className="mt-5 flex flex-wrap gap-3">
          {techStack.map((tech) => (
            <li
              key={tech.name}
              className="border border-border px-3 py-2 text-[12px] text-foreground/80"
            >
              {tech.name}
              <span className="ml-2 text-muted-foreground">{tech.category}</span>
            </li>
          ))}
        </ul>
        {/* Der Weg von der Werkzeugliste zum Vergleich (06.10.2026): Wer hier
            Power Automate liest, fragt als Nächstes, was gegen n8n oder Make
            spricht. Die Antwort steht mit Herstellerquellen auf einer eigenen
            Seite, statt hier als zweite Liste. */}
        <p className="mt-6 text-pretty text-fliess text-muted-foreground">
          Wie Power Automate und n8n neben Make, Zapier, UiPath und Camunda dastehen:{" "}
          <Link
            href="/vergleich/prozessautomatisierung"
            className="font-bold text-primary hover:underline"
          >
            Software für Prozessautomatisierung im Vergleich
          </Link>
        </p>
      </section>

      <WeiterlesenBlock
        artikel={wissen}
        heading="Wir schreiben auf, was wir bauen."
        text="Dieselben Abläufe, ausführlich zerlegt — mit den Stellen, an denen es in der Praxis klemmt."
      />

      <CtaBanner
        heading="Welcher Prozess bei euch zuerst?"
        text="Im 1:1-KI-Check nehmen wir einen konkreten Ablauf auseinander und rechnen ihn durch."
        position="leistungen-abschluss"
      />
    </PageShell>
  );
}
