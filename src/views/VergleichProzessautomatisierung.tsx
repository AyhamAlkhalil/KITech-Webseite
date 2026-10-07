import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { TEXT_CONTAINER } from "@/components/layout/site-container";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { WeiterlesenBlock } from "@/components/sections/WeiterlesenBlock";
import { StructuredData } from "@/components/seo/StructuredData";
import { addressLine, company } from "@/config/company";
import { angebot } from "@/config/angebot";
import { datumKurz, datumLang } from "@/lib/datum";
import { BASE_URL } from "@/lib/metadata";
import type { Autor } from "@/lib/wissen/schema";
import type { ArtikelTeaser } from "@/lib/wissen/empfehlungen";
import { autorUrl } from "@/lib/wissen/schema-org";
import { vergleichArtikelSchema, vergleichBreadcrumbSchema } from "@/lib/vergleich-schema";
import {
  EIGENE_ARBEIT_ART,
  STAND,
  VEROEFFENTLICHT,
  abschnitte,
  ausgangslagen,
  einleitung,
  fragen,
  kriterien,
  lead,
  methodik,
  plattformen,
  quellen,
  quellenNummer,
  seitentexte,
  transparenzhinweis,
  ueberschrift,
  umsetzung,
  type Plattform,
} from "@/data/vergleich-prozessautomatisierung";

/**
 * `/vergleich/prozessautomatisierung` — sechs Plattformen für
 * Prozessautomatisierung, beschrieben nach denselben Kriterien.
 *
 * **Server Component, ohne `"use client"`.** Die Seite ist Text und Tabelle;
 * nichts daran ist interaktiv. Jede Aussage steht damit im ausgelieferten HTML,
 * auch für Abrufdienste, die kein JavaScript ausführen. Aus demselben Grund gibt
 * es keine Akkordeons: Was eingeklappt ist, liest ein Sprachmodell nicht
 * zuverlässig mit, und ein Mensch klappt es selten auf.
 *
 * **Aufbau wie `wissen/ArtikelSeite.tsx`** — Kopf auf `bg-surface-strong`,
 * Fließtext in `TEXT_CONTAINER`, Inhaltsverzeichnis, Fragen, Quellen,
 * Autorenkasten. Keine zweite Designwelt; wer die Artikelseite ändert, prüft
 * diese Seite mit. Nur die beiden Tabellen brechen auf 1.100 Pixel aus der
 * Textspalte aus: Sechs Spalten in 760 Pixeln wären auch am Schreibtisch nur
 * seitlich lesbar.
 *
 * **Die Reihenfolge der Blöcke folgt der Zitierwahrscheinlichkeit.** Antwort
 * und Kurzliste stehen oben, die Methodik weiter unten — der Transparenzhinweis
 * aber steht ganz oben, weil er die Lesart aller folgenden Aussagen bestimmt.
 *
 * Alle Texte, Quellen und die Regeln dafür: `src/data/vergleich-prozessautomatisierung.ts`.
 * Hier steht bewusst kein Satz, damit die Stilprüfung im Test alles sieht.
 */
export default function VergleichProzessautomatisierung({
  autor,
  /** Artikel zu Betrieb und Fehlerwegen, geladen im Server-Wrapper. */
  weiterlesen,
}: {
  autor: Autor;
  weiterlesen: ArtikelTeaser[];
}) {
  const autorPfad = autorUrl(autor.slug).replace(BASE_URL, "");

  return (
    <PageShell backdrop="none">
      <StructuredData data={[vergleichArtikelSchema(autor), vergleichBreadcrumbSchema()]} />

      <article>
        <header className="bg-surface-strong">
          <div className={`${TEXT_CONTAINER} py-14 sm:py-20`}>
            {/* `sm:[hyphens:none]` schaltet den weichen Trennstrich ab 640 px ab —
                dort passt das Wort, und ohne die Sperre würde der Browser es
                trotzdem trennen, um die erste Zeile zu füllen. */}
            <h1 className="kinetic-display kinetic-morph-in text-balance text-[32px] leading-[1.12] text-foreground sm:text-[44px] sm:[hyphens:none]">
              {trennbar(ueberschrift)}
            </h1>

            {/* Byline wie auf jeder Artikelseite: Name als Link auf die
                Autorenseite, dazu beide Daten. Bei einem Vergleich ist das
                Datum Teil der Aussage — Herstellerangaben veralten. */}
            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-mini text-muted-foreground">
              <Link
                href={autorPfad}
                className="inline-flex items-center gap-2 font-medium text-foreground transition-colors hover:text-primary"
              >
                {autor.bild && (
                  <Image
                    src={autor.bild}
                    alt=""
                    width={28}
                    height={28}
                    className="h-7 w-7 object-cover"
                  />
                )}
                {autor.name}
              </Link>
              <span aria-hidden="true">·</span>
              <span>
                veröffentlicht am <time dateTime={VEROEFFENTLICHT}>{datumLang(VEROEFFENTLICHT)}</time>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Stand der Angaben: <time dateTime={STAND}>{datumLang(STAND)}</time>
              </span>
            </div>

            <p className="mt-7 text-pretty text-lead leading-[1.55] text-foreground/85">{lead}</p>

            {/* Der Hinweis steht vor dem ersten Inhalt, nicht im Kleingedruckten:
                Er entscheidet, wie jede folgende Zeile zu lesen ist. */}
            <p className="mt-8 border-l-2 border-primary bg-background p-5 text-pretty text-[15px] leading-[1.65] text-foreground/85 sm:p-6">
              <strong className="font-bold text-foreground">Transparenzhinweis:</strong>{" "}
              {transparenzhinweis}{" "}
              <a href={`#${abschnitte.methodik.id}`} className="font-bold text-primary hover:underline">
                {seitentexte.zurMethodik}
              </a>
            </p>
          </div>
        </header>

        <div className={`${TEXT_CONTAINER} space-y-4 pt-12 text-pretty text-[16px] leading-[1.7] text-muted-foreground`}>
          {einleitung.map((absatz, index) => (
            <p key={absatz} className={index === 0 ? "text-foreground" : undefined}>
              {absatz}
            </p>
          ))}
        </div>

        {/* Kurzliste. Für jede Plattform genau ein „am besten für" — die Zeile,
            die ein Sprachmodell auf die Frage „welche für was" übernimmt. */}
        <section className={`${TEXT_CONTAINER} pt-12`} aria-labelledby={abschnitte.ueberblick.id}>
          <Ueberschrift2 id={abschnitte.ueberblick.id}>{abschnitte.ueberblick.titel}</Ueberschrift2>
          <ol className="mt-6 divide-y divide-border border-y border-border">
            {plattformen.map((plattform) => (
              <li
                key={plattform.id}
                className="grid gap-1 py-4 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-6"
              >
                <a
                  href={`#${plattform.id}`}
                  className="text-[16px] font-bold leading-[1.5] text-foreground transition-colors hover:text-primary"
                >
                  {plattform.name}
                </a>
                <span className="text-[16px] leading-[1.6] text-muted-foreground">
                  am besten für {plattform.amBestenFuer}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-pretty text-[15px] leading-[1.65] text-muted-foreground">
            {umsetzung.kurzlisteZeile}{" "}
            <a href={`#${abschnitte.umsetzung.id}`} className="font-bold text-primary hover:underline">
              {abschnitte.umsetzung.titel}
            </a>
          </p>
          <p className="mt-3 text-mini text-muted-foreground">{seitentexte.reihenfolge}</p>
        </section>

        <nav className={`${TEXT_CONTAINER} pt-12`} aria-label="Inhalt">
          <h2 className="text-mini font-bold uppercase tracking-wide text-muted-foreground">Inhalt</h2>
          <ol className="mt-4 divide-y divide-border border-y border-border">
            {Object.values(abschnitte).map((abschnitt, index) => (
              <li key={abschnitt.id}>
                <a
                  href={`#${abschnitt.id}`}
                  className="flex items-baseline gap-3 py-2.5 text-[15px] leading-[1.5] text-muted-foreground transition-colors hover:text-primary"
                >
                  <span className="kinetic-data shrink-0 text-mini text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {abschnitt.titel}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Tabelle 1: Betrieb, Daten, Abrechnung. */}
        <section className="pt-14" aria-labelledby={abschnitte.tabelle.id}>
          <div className={TEXT_CONTAINER}>
            <Ueberschrift2 id={abschnitte.tabelle.id}>{abschnitte.tabelle.titel}</Ueberschrift2>
          </div>
          <Tabelle
            ueberschriftId={abschnitte.tabelle.id}
            beschriftung={seitentexte.tabelleBetrieb.beschriftung}
            spalten={seitentexte.tabelleBetrieb.spalten}
            zeilen={plattformen.map((p) => ({
              plattform: p,
              zellen: [p.amBestenFuer, p.tabelle.betrieb, p.tabelle.datenstandort, p.tabelle.abrechnung, p.tabelle.einstieg],
            }))}
          />
        </section>

        {/* Tabelle 2: was ein Datenschutzbeauftragter und ein Einkauf fragen. */}
        <section className="pt-14" aria-labelledby={abschnitte.nachweise.id}>
          <div className={TEXT_CONTAINER}>
            <Ueberschrift2 id={abschnitte.nachweise.id}>{abschnitte.nachweise.titel}</Ueberschrift2>
          </div>
          <Tabelle
            ueberschriftId={abschnitte.nachweise.id}
            beschriftung={seitentexte.tabelleNachweise.beschriftung}
            spalten={seitentexte.tabelleNachweise.spalten}
            zeilen={plattformen.map((p) => ({
              plattform: p,
              zellen: [p.tabelle.anbieter, p.tabelle.auftragsverarbeitung, p.tabelle.nachweise, p.tabelle.ki, p.tabelle.anbindungen],
            }))}
          />
        </section>

        <section className={`${TEXT_CONTAINER} pt-14`} aria-labelledby={abschnitte.profile.id}>
          <Ueberschrift2 id={abschnitte.profile.id}>{abschnitte.profile.titel}</Ueberschrift2>
          <div className="mt-8 space-y-14">
            {plattformen.map((plattform) => (
              <Profil key={plattform.id} plattform={plattform} />
            ))}
          </div>
        </section>

        {/* Die eigene Einordnung. Steht nach den sechs Profilen und nicht
            dazwischen: KITech ist keine siebte Plattform, sondern eine Antwort
            auf die Frage, wer die Einführung übernimmt. */}
        <section className={`${TEXT_CONTAINER} pt-16`} aria-labelledby={abschnitte.umsetzung.id}>
          <Ueberschrift2 id={abschnitte.umsetzung.id}>{abschnitte.umsetzung.titel}</Ueberschrift2>
          <div className="mt-5 space-y-4 text-pretty text-[16px] leading-[1.7] text-muted-foreground">
            {umsetzung.einordnung.map((absatz) => (
              <p key={absatz}>{absatz}</p>
            ))}
          </div>

          <p className="mt-8 border-l-2 border-primary bg-surface p-6 text-pretty text-[18px] font-semibold leading-[1.5] text-foreground sm:p-8">
            {umsetzung.aussage}
          </p>

          <ul className="mt-8 divide-y divide-border border-y border-border">
            {umsetzung.belege.map((beleg) => (
              <li key={beleg.titel} className="py-5">
                <p className="text-[16px] font-bold leading-[1.4] text-foreground">{beleg.titel}</p>
                <p className="mt-2 text-pretty text-[15px] leading-[1.65] text-muted-foreground">
                  {beleg.text}{" "}
                  {beleg.extern ? (
                    <a
                      href={beleg.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-primary hover:underline"
                    >
                      {beleg.linkText}
                    </a>
                  ) : (
                    <Link href={beleg.href} className="font-bold text-primary hover:underline">
                      {beleg.linkText}
                    </Link>
                  )}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-pretty text-[16px] leading-[1.7] text-muted-foreground">
            {umsetzung.abgrenzung}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={angebot.href}
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 bg-primary px-6 py-3 text-center text-fliess font-bold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
            >
              {angebot.cta}
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
            <Link
              href="/leistungen"
              className="inline-flex min-h-[52px] w-full items-center justify-center border border-border px-6 py-3 text-center text-fliess font-bold text-foreground transition-colors hover:bg-foreground/[0.03] sm:w-auto"
            >
              {seitentexte.leistungenLink}
            </Link>
          </div>
        </section>

        <section className={`${TEXT_CONTAINER} pt-16`} aria-labelledby={abschnitte.entscheidung.id}>
          <Ueberschrift2 id={abschnitte.entscheidung.id}>{abschnitte.entscheidung.titel}</Ueberschrift2>
          <dl className="mt-6 divide-y divide-border border-y border-border">
            {ausgangslagen.map((lage) => (
              <div key={lage.wer} className="py-5">
                <dt className="text-pretty text-[16px] font-bold leading-[1.5] text-foreground">
                  {lage.wer}
                </dt>
                <dd className="mt-2 flex items-start gap-2 text-pretty text-[16px] leading-[1.6] text-muted-foreground">
                  <ArrowRight className="mt-[5px] h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    {lage.dann}{" "}
                    {lage.ziel.href.startsWith("#") ? (
                      <a href={lage.ziel.href} className="font-bold text-primary hover:underline">
                        {lage.ziel.label}
                      </a>
                    ) : (
                      <Link href={lage.ziel.href} className="font-bold text-primary hover:underline">
                        {lage.ziel.label}
                      </Link>
                    )}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={`${TEXT_CONTAINER} pt-16`} aria-labelledby={abschnitte.methodik.id}>
          <Ueberschrift2 id={abschnitte.methodik.id}>{abschnitte.methodik.titel}</Ueberschrift2>
          <div className="mt-5 space-y-4 text-pretty text-[16px] leading-[1.7] text-muted-foreground">
            {methodik.grundlage.map((absatz) => (
              <p key={absatz}>{absatz}</p>
            ))}
          </div>

          <h3 className="kinetic-display mt-10 text-balance text-[19px] leading-[1.25] text-foreground sm:text-[21px]">
            {seitentexte.kriterienTitel}
          </h3>
          <dl className="mt-4 divide-y divide-border border-y border-border">
            {kriterien.map((kriterium) => (
              <div key={kriterium.name} className="grid gap-1 py-4 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-6">
                <dt className="text-[15px] font-bold leading-[1.5] text-foreground">{kriterium.name}</dt>
                <dd className="text-pretty text-[15px] leading-[1.6] text-muted-foreground">{kriterium.text}</dd>
              </div>
            ))}
          </dl>

          <h3 className="kinetic-display mt-10 text-balance text-[19px] leading-[1.25] text-foreground sm:text-[21px]">
            {seitentexte.grenzenTitel}
          </h3>
          <ul className="mt-4 space-y-3">
            {methodik.grenzen.map((grenze) => (
              <li key={grenze} className="flex items-start gap-3 text-pretty text-[16px] leading-[1.6] text-foreground/90">
                <span className="mt-[10px] h-1.5 w-1.5 shrink-0 bg-primary" aria-hidden="true" />
                {grenze}
              </li>
            ))}
          </ul>

          <p className="mt-8 text-pretty text-[15px] leading-[1.65] text-muted-foreground">
            {methodik.korrektur}{" "}
            <a href={`mailto:${company.email.general}`} className="font-bold text-primary hover:underline">
              {company.email.general}
            </a>
          </p>
        </section>

        {/* Häufige Fragen — sichtbar im HTML, bewusst ohne FAQPage-Auszeichnung
            (siehe `lib/vergleich-schema.ts`). Der erste Satz jeder Antwort ist
            die Antwort; was danach kommt, ist Begründung. */}
        <section className={`${TEXT_CONTAINER} pt-16`} aria-labelledby={abschnitte.fragen.id}>
          <Ueberschrift2 id={abschnitte.fragen.id}>{abschnitte.fragen.titel}</Ueberschrift2>
          <div className="mt-6 divide-y divide-border border-y border-border">
            {fragen.map((eintrag) => (
              <div key={eintrag.frage} className="py-6">
                <h3 className="text-[17px] font-bold leading-[1.4] text-foreground">{eintrag.frage}</h3>
                <div className="mt-3 space-y-3 text-pretty text-[16px] leading-[1.7] text-muted-foreground">
                  {eintrag.antwort.map((absatz) => (
                    <p key={absatz}>{absatz}</p>
                  ))}
                </div>
                {eintrag.quellen && eintrag.quellen.length > 0 && (
                  <Belege nummern={eintrag.quellen.map((id) => quellenNummer(id))} />
                )}
              </div>
            ))}
          </div>
        </section>

        <section className={`${TEXT_CONTAINER} pt-16`} aria-labelledby={abschnitte.quellen.id}>
          <Ueberschrift2 id={abschnitte.quellen.id}>{abschnitte.quellen.titel}</Ueberschrift2>
          <ol className="mt-5 space-y-3 text-[15px] leading-[1.6] text-muted-foreground">
            {quellen.map((quelle, index) => (
              <li key={quelle.id} id={`quelle-${index + 1}`} className="flex scroll-mt-24 gap-3">
                <span className="kinetic-data w-7 shrink-0 text-muted-foreground">{index + 1}</span>
                <span className="min-w-0 break-words">
                  <a
                    href={quelle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline decoration-border underline-offset-2 transition-colors hover:decoration-primary"
                  >
                    {quelle.titel}
                  </a>
                  <span className="text-muted-foreground"> · abgerufen am {datumKurz(quelle.abgerufen)}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* Wer das geschrieben hat und wer dafür einsteht. Die Firmenzeile
            verweist auf das Impressum, statt die Anbieterkennzeichnung hier zu
            wiederholen. Das Bild bekommt kein `alt`: Der Name steht daneben als
            Link, ein Screenreader läse ihn sonst zweimal. */}
        <section className={`${TEXT_CONTAINER} py-16`} aria-labelledby="autor">
          <h2 id="autor" className="text-mini font-bold uppercase tracking-wide text-muted-foreground">
            Geschrieben von
          </h2>
          <div className="mt-4 flex flex-col gap-5 border border-border p-6 sm:flex-row sm:items-start sm:p-8">
            {autor.bild && (
              <Image
                src={autor.bild}
                alt=""
                width={96}
                height={96}
                className="h-24 w-24 shrink-0 object-cover"
              />
            )}
            <div className="min-w-0">
              <Link
                href={autorPfad}
                className="text-[19px] font-bold leading-tight text-foreground transition-colors hover:text-primary"
              >
                {autor.name}
              </Link>
              <p className="mt-1 text-mini text-muted-foreground">{autor.rolle}</p>
              <p className="mt-4 text-pretty text-[15px] leading-[1.65] text-muted-foreground">
                {autor.kurzbeschreibung}
              </p>
            </div>
          </div>
          <p className="mt-5 text-pretty text-mini leading-[1.6] text-muted-foreground">
            Herausgeber: {company.shortName}, {addressLine}.{" "}
            <Link href="/impressum" className="underline underline-offset-2 hover:text-foreground">
              Impressum
            </Link>
          </p>
        </section>
      </article>

      <WeiterlesenBlock
        artikel={weiterlesen}
        heading={seitentexte.weiterlesen.heading}
        text={seitentexte.weiterlesen.text}
      />

      <CtaBanner
        heading={seitentexte.cta.heading}
        text={seitentexte.cta.text}
        position="vergleich-prozessautomatisierung"
      />
    </PageShell>
  );
}

/* -------------------------------------------------------------------------- */

function Ueberschrift2({ id, children }: { id: string; children: string }) {
  return (
    <h2
      id={id}
      className="kinetic-display scroll-mt-24 text-balance text-[24px] leading-[1.2] text-foreground sm:text-[28px]"
    >
      {children}
    </h2>
  );
}

/**
 * Vergleichstabelle. Erste Spalte ist der Plattformname als Zeilenkopf und
 * bleibt beim seitlichen Verschieben stehen — auf 360 Pixeln weiß man sonst
 * nach dem ersten Wischen nicht mehr, welche Zeile man liest.
 *
 * Die Tabelle scrollt in ihrem eigenen Kasten, nie die Seite. Mit 880 Pixeln
 * Mindestbreite plus Rand scrollt sie bis etwa 944 Pixel Fensterbreite —
 * so lange steht der Hinweis darüber, also auch bei 768 Pixeln. Der Kasten ist
 * per Tastatur erreichbar (`tabIndex`), sonst ließe er sich ohne Maus nicht
 * verschieben: Fokussierbar wären darin nur die Links der festen ersten Spalte.
 */
function Tabelle({
  ueberschriftId,
  beschriftung,
  spalten,
  zeilen,
}: {
  ueberschriftId: string;
  beschriftung: string;
  spalten: string[];
  zeilen: { plattform: Plattform; zellen: string[] }[];
}) {
  return (
    <div className="mx-auto mt-6 w-full max-w-[1100px] px-5 sm:px-8">
      <p className="mb-2 text-mini text-muted-foreground min-[945px]:hidden">{seitentexte.scrollHinweis}</p>
      <div
        role="region"
        aria-labelledby={ueberschriftId}
        tabIndex={0}
        className="overflow-x-auto border border-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <table className="w-full min-w-[880px] border-collapse text-left text-[14px]">
          {/* Die Beschriftung gehört zur Tabelle (Screenreader, Abrufdienste),
              sichtbar steht sie aber unter dem Kasten: Im Kasten liefe sie
              auf dem Handy mit der Tabelle seitlich aus dem Bild. */}
          <caption className="sr-only">{beschriftung}</caption>
          <thead>
            <tr className="bg-surface">
              <th
                scope="col"
                className="sticky left-0 z-[1] border-b border-border bg-surface px-4 py-3 font-bold text-foreground shadow-[1px_0_0_hsl(var(--border))]"
              >
                Plattform
              </th>
              {spalten.map((spalte) => (
                <th key={spalte} scope="col" className="border-b border-border px-4 py-3 font-bold text-foreground">
                  {spalte}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {zeilen.map(({ plattform, zellen }) => (
              <tr key={plattform.id}>
                <th
                  scope="row"
                  className="sticky left-0 z-[1] bg-background px-4 py-3 align-top font-bold text-foreground shadow-[1px_0_0_hsl(var(--border))]"
                >
                  <a href={`#${plattform.id}`} className="transition-colors hover:text-primary">
                    {plattform.name}
                  </a>
                </th>
                {zellen.map((zelle, index) => (
                  <td key={index} className="px-4 py-3 align-top leading-[1.55] text-muted-foreground">
                    {zelle}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p aria-hidden="true" className="mt-3 text-pretty text-mini leading-[1.5] text-muted-foreground">
        {beschriftung}
      </p>
    </div>
  );
}

/**
 * Ein Plattformprofil. Für alle sechs dieselbe Gliederung — der Kern der
 * Methodik ist, dass keine Plattform eine Zeile mehr oder weniger bekommt.
 * Einzige Ausnahme ist „Aus eigener Arbeit": Sie steht nur dort, wo wir die
 * Plattform selbst einsetzen, und behauptet anderswo nichts.
 */
function Profil({ plattform }: { plattform: Plattform }) {
  const zeilen = seitentexte.profilZeilen;

  return (
    <section id={plattform.id} className="scroll-mt-24 border-t border-border pt-10" aria-labelledby={`${plattform.id}-titel`}>
      <h3
        id={`${plattform.id}-titel`}
        className="kinetic-display text-balance text-[24px] leading-[1.2] text-foreground sm:text-[26px]"
      >
        {plattform.name}
      </h3>
      <p className="mt-2 text-mini text-muted-foreground">
        {plattform.hersteller} · {plattform.sitz}
      </p>

      <p className="mt-5 text-pretty text-[17px] font-semibold leading-[1.5] text-foreground">
        Am besten für {plattform.amBestenFuer}.
      </p>
      <p className="mt-4 text-pretty text-[16px] leading-[1.7] text-muted-foreground">{plattform.beschreibung}</p>

      <dl className="mt-6 divide-y divide-border border-y border-border">
        <ProfilZeile titel={zeilen.staerken}>
          <Punkte eintraege={plattform.staerken} />
        </ProfilZeile>
        <ProfilZeile titel={zeilen.grenzen}>
          <Punkte eintraege={plattform.grenzen} />
        </ProfilZeile>
        <ProfilZeile titel={zeilen.besonderheit}>{plattform.besonderheit}</ProfilZeile>
        <ProfilZeile titel={zeilen.zielgruppe}>{plattform.zielgruppe}</ProfilZeile>
        <ProfilZeile titel={zeilen.preismodell}>
          {plattform.preismodell}{" "}
          <a
            href={plattform.preisseite}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-primary hover:underline"
          >
            {zeilen.preisseite}
          </a>
        </ProfilZeile>
        <ProfilZeile titel={zeilen.website}>
          <a
            href={plattform.website}
            target="_blank"
            rel="noopener noreferrer"
            className="break-words font-bold text-primary hover:underline"
          >
            {plattform.website.replace(/^https:\/\//, "").replace(/\/$/, "")}
          </a>
        </ProfilZeile>
      </dl>

      {plattform.eigeneArbeit && (
        <div className="mt-6 border-l-2 border-primary bg-surface p-6">
          <p className="text-[15px] font-bold leading-[1.4] text-foreground">{seitentexte.eigeneArbeitTitel}</p>
          {/* Jeder Absatz trägt seine Art sichtbar davor: Kundenfall, eigener
              Betrieb oder Bauweise. Siehe `EigeneArbeit` in der Datendatei. */}
          <dl className="mt-3 space-y-4">
            {plattform.eigeneArbeit.map((absatz) => (
              <div key={absatz.text}>
                <dt className="text-mini font-bold uppercase tracking-wide text-muted-foreground">
                  {EIGENE_ARBEIT_ART[absatz.art]}
                </dt>
                <dd className="mt-1 text-pretty text-[15px] leading-[1.65] text-muted-foreground">{absatz.text}</dd>
              </div>
            ))}
          </dl>
          {plattform.eigeneArbeitLink && (
            <Link
              href={plattform.eigeneArbeitLink.href}
              className="mt-4 inline-flex items-center gap-2 text-[15px] font-bold text-primary hover:underline"
            >
              {plattform.eigeneArbeitLink.label}
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          )}
        </div>
      )}

      <Belege nummern={plattform.quellen.map((id) => quellenNummer(id))} />
    </section>
  );
}

function ProfilZeile({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-6">
      <dt className="text-[15px] font-bold leading-[1.6] text-foreground">{titel}</dt>
      <dd className="text-pretty text-[15px] leading-[1.6] text-muted-foreground">{children}</dd>
    </div>
  );
}

function Punkte({ eintraege }: { eintraege: string[] }) {
  return (
    <ul className="space-y-2">
      {eintraege.map((eintrag) => (
        <li key={eintrag} className="flex items-start gap-3">
          <span className="mt-[9px] h-1.5 w-1.5 shrink-0 bg-primary" aria-hidden="true" />
          {eintrag}
        </li>
      ))}
    </ul>
  );
}

/** Belegnummern, verlinkt auf die Quellenliste. `aria-label`, weil „[3]" allein nichts sagt. */
function Belege({ nummern }: { nummern: number[] }) {
  return (
    <p className="mt-5 text-mini leading-[1.6] text-muted-foreground">
      Belege:{" "}
      {nummern.map((nummer, index) => (
        <span key={nummer}>
          {index > 0 && " "}
          <a
            href={`#quelle-${nummer}`}
            aria-label={`Quelle ${nummer}`}
            className="kinetic-data text-primary hover:underline"
          >
            [{nummer}]
          </a>
        </span>
      ))}
    </p>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Weicher Trennstrich (U+00AD) im längsten Wort der Überschrift.
 *
 * „Prozessautomatisierung:" ist bei 32 Pixeln breiter als die Textspalte auf
 * einem 360-Pixel-Handy — gemessen 407 gegen 320 Pixel, die ganze Seite ließ
 * sich dadurch seitlich verschieben. Der weiche Trennstrich bricht nur, wenn
 * die Zeile es verlangt; ab 640 Pixeln schaltet `sm:[hyphens:none]` an der H1
 * ihn ganz ab. `hyphens: auto` wäre eleganter, hängt aber an
 * Silbentrennungs-Wörterbüchern, die nicht jeder Browser mitbringt.
 *
 * Nur für die Darstellung: Titel, Schema und `llms.txt` lesen `ueberschrift`
 * ohne das Zeichen.
 */
const WEICHER_TRENNSTRICH = String.fromCharCode(173);

function trennbar(text: string): string {
  return text.replace("Prozessautomatisierung", `Prozess${WEICHER_TRENNSTRICH}automatisierung`);
}
