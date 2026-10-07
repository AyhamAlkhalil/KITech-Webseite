import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { PageHeading } from "@/components/sections/PageHeading";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { WeiterlesenBlock } from "@/components/sections/WeiterlesenBlock";
import {
  StructuredData,
  getBreadcrumbSchema,
  getFAQSchema,
  getServiceSchema,
  getWebPageSchema,
} from "@/components/seo/StructuredData";
import { BASE_URL, buildMetadata } from "@/lib/metadata";
import { empfehlungenFuer } from "@/lib/wissen/empfehlungen";

export const metadata: Metadata = buildMetadata({
  title: "KI-Beratung Mittelstand: Audit, Automatisierung, Betrieb",
  description:
    "KI-Beratung für den Mittelstand: Use Cases priorisieren, Prozesse automatisieren, DSGVO klären und KI-Systeme betreiben. Kostenloser 1:1-KI-Check.",
  path: "/ki-beratung-mittelstand",
});

const ergebnisse = [
  "Eine priorisierte Use-Case-Liste mit Aufwand, Risiko und erwartbarem Wertbeitrag.",
  "Eine klare Entscheidung, was nicht gebaut wird, weil Daten, Prozess oder Wirtschaftlichkeit fehlen.",
  "Ein Umsetzungsplan für den ersten produktiven Ablauf, inklusive Betrieb, Monitoring und Verantwortlichkeit.",
];

const prueffelder = [
  {
    titel: "Prozesse",
    text: "Wo wiederkehrende Arbeit entsteht, die heute Menschen sortieren, kopieren oder nachhalten.",
  },
  {
    titel: "Daten",
    text: "Welche Systeme, Dokumente und Rechte ein KI-Agent wirklich braucht, bevor er verlässlich arbeiten kann.",
  },
  {
    titel: "Betrieb",
    text: "Wie Logging, Freigaben, Fehlerwege und Nachweise aussehen müssen, damit aus einem Pilot ein Alltagssystem wird.",
  },
];

const ablauf = [
  {
    nummer: "01",
    titel: "Bestandsaufnahme",
    text: "Wir nehmen einen echten Ablauf aus eurem Betrieb, nicht eine Demo-Idee aus einem Toolkatalog.",
  },
  {
    nummer: "02",
    titel: "Business Case",
    text: "Zeit, Fehlerkosten, Risiken und Integrationsaufwand werden gegeneinander gestellt.",
  },
  {
    nummer: "03",
    titel: "Pilot mit Betriebsziel",
    text: "Der erste KI-Agent wird so geplant, dass Betrieb, Datenschutz und Abnahme von Anfang an mitlaufen.",
  },
  {
    nummer: "04",
    titel: "Übergabe und Weiterbetrieb",
    text: "Nach dem Go-live bleiben Monitoring, Wartung und ein fester Ansprechpartner stehen.",
  },
];

const faqs = [
  {
    question: "Was ist KI-Beratung für den Mittelstand?",
    answer:
      "KI-Beratung für den Mittelstand klärt, welche Prozesse sich für KI und Automatisierung eignen, welche Daten dafür nötig sind und wie daraus ein betreibbares System wird.",
  },
  {
    question: "Wann lohnt sich KI-Beratung für ein Unternehmen?",
    answer:
      "Sie lohnt sich, wenn ein konkreter Prozess häufig genug läuft, messbare Kosten verursacht und an Daten oder Systeme angeschlossen werden kann.",
  },
  {
    question: "Was unterscheidet KI-Beratung von einer Tool-Schulung?",
    answer:
      "Eine Tool-Schulung erklärt Bedienung. KI-Beratung bewertet Prozesse, Daten, Datenschutz, Wirtschaftlichkeit und Betrieb, damit ein produktiver Ablauf entsteht.",
  },
  {
    question: "Kann KI im Mittelstand DSGVO-konform betrieben werden?",
    answer:
      "Ja, wenn Rechtsgrundlage, Datenminimierung, Auftragsverarbeitung, Hosting, Zugriffskontrolle, Logging und Löschwege vor der Umsetzung geklärt sind.",
  },
];

export default function Page() {
  const wissen = empfehlungenFuer("/enterprise");

  return (
    <PageShell>
      <StructuredData
        data={[
          getWebPageSchema(
            "KI-Beratung Mittelstand",
            "KI-Beratung für mittelständische Unternehmen: Audit, Use Cases, Automatisierung und laufender Betrieb.",
            `${BASE_URL}/ki-beratung-mittelstand`
          ),
          getBreadcrumbSchema([
            { name: "Startseite", url: `${BASE_URL}/` },
            { name: "Leistungen", url: `${BASE_URL}/leistungen` },
            { name: "KI-Beratung Mittelstand", url: `${BASE_URL}/ki-beratung-mittelstand` },
          ]),
          getServiceSchema(
            "KI-Beratung für den Mittelstand",
            "Prozess-Audit, Use-Case-Priorisierung, KI-Automatisierung, DSGVO-Prüfung und Betrieb für mittelständische Unternehmen."
          ),
          getFAQSchema(faqs),
        ]}
      />

      <PageHeading
        title="KI-Beratung für den Mittelstand, die nicht beim Workshop endet."
        lead="Wir suchen nicht nach dem spannendsten Tool, sondern nach dem ersten Prozess, der messbar besser laufen kann."
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/lass-uns-reden"
            className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-fliess font-bold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
          >
            Kostenlosen 1:1-KI-Check sichern
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/referenzen"
            className="inline-flex min-h-[52px] w-full items-center justify-center border border-border px-6 py-3 text-fliess font-bold text-foreground transition-colors hover:bg-foreground/[0.03] sm:w-auto"
          >
            Kundenfälle ansehen
          </Link>
        </div>
      </PageHeading>

      <section className={`${SITE_CONTAINER} py-14 sm:py-18`} aria-labelledby="beratung-ergebnis">
        <div className="border-y border-border py-10">
          <h2
            id="beratung-ergebnis"
            className="kinetic-display max-w-[760px] text-balance text-[28px] leading-[1.15] text-foreground sm:text-h2"
          >
            Nach dem Audit liegt eine Entscheidung auf dem Tisch, kein Foliensatz.
          </h2>
          <ul className="mt-8 grid gap-6 lg:grid-cols-3">
            {ergebnisse.map((punkt) => (
              <li key={punkt} className="flex gap-4 border-t border-border pt-5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <span className="text-pretty text-fliess leading-[1.6] text-foreground/82">
                  {punkt}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${SITE_CONTAINER} pb-16 sm:pb-20`} aria-labelledby="prueffelder">
        <h2
          id="prueffelder"
          className="kinetic-display max-w-[760px] text-balance text-[28px] leading-[1.15] text-foreground sm:text-h2"
        >
          Gute KI-Beratung prüft drei Dinge gleichzeitig.
        </h2>
        <div className="mt-9 grid gap-px border border-border bg-border md:grid-cols-3">
          {prueffelder.map((feld) => (
            <article key={feld.titel} className="bg-background p-6 sm:p-7">
              <h3 className="kinetic-display text-[22px] leading-[1.15] text-foreground">
                {feld.titel}
              </h3>
              <p className="mt-4 text-pretty text-fliess leading-[1.6] text-muted-foreground">
                {feld.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${SITE_CONTAINER} pb-16 sm:pb-20`} aria-labelledby="ablauf">
        <h2
          id="ablauf"
          className="kinetic-display max-w-[760px] text-balance text-[28px] leading-[1.15] text-foreground sm:text-h2"
        >
          Der Ablauf bleibt absichtlich eng.
        </h2>
        <div className="mt-8 divide-y divide-border border-y border-border">
          {ablauf.map((schritt) => (
            <article
              key={schritt.nummer}
              className="grid gap-5 py-7 sm:grid-cols-[72px_minmax(0,1fr)] sm:py-8"
            >
              <span className="kinetic-data text-[28px] font-light leading-none text-accent">
                {schritt.nummer}
              </span>
              <div>
                <h3 className="kinetic-display text-[22px] leading-[1.15] text-foreground">
                  {schritt.titel}
                </h3>
                <p className="mt-3 max-w-[650px] text-pretty text-fliess leading-[1.65] text-muted-foreground">
                  {schritt.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={`${SITE_CONTAINER} pb-16 sm:pb-20`} aria-labelledby="seo-links">
        <div className="grid gap-8 border-t border-border pt-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <h2
            id="seo-links"
            className="kinetic-display text-balance text-[28px] leading-[1.15] text-foreground sm:text-h2"
          >
            Wo die Beratung in Umsetzung übergeht.
          </h2>
          <div className="space-y-4 text-fliess leading-[1.65] text-muted-foreground">
            <p>
              Der Einstieg ist meistens ein{" "}
              <Link href="/glossar/ki-audit" className="font-bold text-primary hover:underline">
                KI-Audit
              </Link>
              . Danach entscheidet sich, ob ein Ablauf als{" "}
              <Link href="/leistungen" className="font-bold text-primary hover:underline">
                Prozessautomatisierung
              </Link>
              , als internes Wissenssystem oder als individueller KI-Agent gebaut wird. Welche
              Plattform eine Automatisierung tragen kann, steht im{" "}
              <Link
                href="/vergleich/prozessautomatisierung"
                className="font-bold text-primary hover:underline"
              >
                Vergleich der Software für Prozessautomatisierung
              </Link>
              .
            </p>
            <p>
              Für Unternehmen mit Nachweispflichten zählen außerdem{" "}
              <Link
                href="/glossar/dsgvo-konforme-ki"
                className="font-bold text-primary hover:underline"
              >
                DSGVO-konforme KI
              </Link>
              , Hosting-Entscheidungen und laufender Betrieb. Ein Beispiel für den Einstieg steht
              im Artikel{" "}
              <Link
                href="/gratis-wissen/ki-beratung-hannover-wie-ein-erstgespraech-ablaeuft"
                className="font-bold text-primary hover:underline"
              >
                KI-Beratung in Hannover
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className={`${SITE_CONTAINER} pb-16 sm:pb-20`} aria-labelledby="faq">
        <h2
          id="faq"
          className="kinetic-display max-w-[760px] text-balance text-[28px] leading-[1.15] text-foreground sm:text-h2"
        >
          Fragen, die vor dem ersten Projekt geklärt werden.
        </h2>
        <div className="mt-8 divide-y divide-border border-y border-border">
          {faqs.map((faq) => (
            <article key={faq.question} className="py-6">
              <h3 className="kinetic-display text-[20px] leading-[1.2] text-foreground">
                {faq.question}
              </h3>
              <p className="mt-3 max-w-[760px] text-pretty text-fliess leading-[1.65] text-muted-foreground">
                {faq.answer}
              </p>
            </article>
          ))}
        </div>
      </section>

      <WeiterlesenBlock
        artikel={wissen}
        heading="Mehr Kontext vor der Entscheidung."
        text="Artikel zu Betrieb, Datenschutz und den typischen Fehlern, die aus KI-Projekten teure Nebenprojekte machen."
      />

      <CtaBanner
        heading="Welcher KI-Use-Case trägt zuerst?"
        text="Im 1:1-KI-Check zerlegen wir einen konkreten Ablauf und prüfen, ob daraus ein belastbares Projekt wird."
        position="ki-beratung-mittelstand-abschluss"
      />
    </PageShell>
  );
}
