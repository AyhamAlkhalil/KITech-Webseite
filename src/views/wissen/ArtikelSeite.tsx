import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SITE_CONTAINER, TEXT_CONTAINER } from "@/components/layout/site-container";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { StructuredData, getBreadcrumbSchema } from "@/components/seo/StructuredData";
import { BASE_URL } from "@/lib/metadata";
import type { Artikel, Autor, Cluster } from "@/lib/wissen/schema";
import { blogPostingSchema, autorUrl } from "@/lib/wissen/schema-org";
import { AbsaetzeMitLinks, verlinkeAbsatz } from "@/lib/wissen/verlinken";
import { DEFAULT_OG_IMAGE } from "@/lib/metadata";
import { datumKurz, datumLang } from "@/lib/datum";

/**
 * Ein Artikel unter `/gratis-wissen/<slug>`.
 *
 * **Server Component, ohne `"use client"`.** Die Vorgängerfassung war eine
 * Client Component — bei einer reinen Textseite heißt das: der ganze Artikel
 * wird zusätzlich als JavaScript ausgeliefert und im Browser noch einmal
 * aufgebaut, ohne dass irgendetwas davon interaktiv wäre. Bei täglich neuen
 * Artikeln ist das die teuerste Stelle der Seite, und sie schlägt direkt auf
 * die Interaktionslatenz durch. Interaktiv bleiben nur die Ränder: `PageShell`
 * und `CtaBanner` sind weiterhin Client Components und bekommen den Artikel als
 * `children` beziehungsweise als Text übergeben — beides bleibt dadurch
 * serverseitig gerendert.
 *
 * **Die Reihenfolge der Blöcke ist nicht Geschmack.** In einer Auswertung von
 * 18.012 verifizierten ChatGPT-Zitaten stammten 44,2 Prozent aus dem ersten
 * Drittel des Textes und nur 24,7 Prozent aus dem letzten. Deshalb stehen die
 * Kernaussagen oben, direkt hinter dem Aufmacher — nicht als Zusammenfassung am
 * Ende. Aus demselben Grund sind die Abschnittsüberschriften Fragen: 78,4
 * Prozent der frage-verknüpften Zitate kamen aus einer H2.
 *
 * Fließtext steht in `TEXT_CONTAINER` (760 px). Diese Seiten werden gelesen,
 * nicht überflogen; bei voller Seitenbreite verfehlt das Auge beim Zeilenwechsel
 * die nächste Zeile.
 */
export default function ArtikelSeite({
  artikel,
  autor,
  cluster,
  /** Weitere Artikel desselben Themas, ohne diesen. Höchstens drei. */
  imThema,
  /** Nächster Artikel in der Gesamtreihenfolge — damit keine Seite in einer Sackgasse endet. */
  naechster,
}: {
  artikel: Artikel;
  autor: Autor;
  cluster: Cluster;
  imThema: Artikel[];
  naechster: Artikel | null;
}) {
  const url = `${BASE_URL}/gratis-wissen/${artikel.slug}`;

  /* Über den ganzen Artikel geführt: jeder Ankertext wird genau einmal zum Link.
     Ohne diesen gemeinsamen Zustand stünde derselbe Link in jedem Abschnitt. */
  const gesetzteLinks = new Set<string>();

  const introLinks = artikel.interneLinks.filter((l) => l.abschnitt === "intro");
  const inhaltsverzeichnis = artikel.abschnitte.length >= 4;

  return (
    <PageShell backdrop="none">
      <StructuredData
        data={[
          blogPostingSchema(artikel, autor, DEFAULT_OG_IMAGE),
          getBreadcrumbSchema([
            { name: "Startseite", url: `${BASE_URL}/` },
            { name: "Gratis-Wissen", url: `${BASE_URL}/gratis-wissen` },
            { name: cluster.titel, url: `${BASE_URL}/gratis-wissen/thema/${cluster.slug}` },
            { name: artikel.titel, url },
          ]),
        ]}
      />

      <article>
        <header className="bg-surface-strong">
          <div className={`${TEXT_CONTAINER} py-14 sm:py-20`}>
            <Link
              href="/gratis-wissen"
              className="inline-flex items-center gap-2 text-mini font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Gratis-Wissen
            </Link>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href={`/gratis-wissen/thema/${cluster.slug}`}
                className="bg-primary px-3 py-1 text-mini font-bold uppercase tracking-wide text-primary-foreground transition-opacity hover:opacity-90"
              >
                {cluster.titel}
              </Link>
              <span className="inline-flex items-center gap-1.5 text-mini text-muted-foreground">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {artikel.lesezeit} Minuten
              </span>
            </div>

            <h1 className="kinetic-display kinetic-morph-in mt-5 text-balance text-[32px] leading-[1.12] text-foreground sm:text-[44px]">
              {artikel.titel}
            </h1>

            {/* Byline direkt unter der Überschrift. Google fragt in der eigenen
                Prüfliste für hilfreiche Inhalte danach: „Do pages carry a byline,
                where one might be expected? Do bylines lead to further
                information about the author?" — deshalb ist der Name ein Link
                auf die Autorenseite und kein Textbaustein. */}
            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-mini text-muted-foreground">
              <Link
                href={autorUrl(autor.slug).replace(BASE_URL, "")}
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
              <time dateTime={artikel.datum}>{datumLang(artikel.datum)}</time>
              {artikel.aktualisiert !== artikel.datum && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    aktualisiert am{" "}
                    <time dateTime={artikel.aktualisiert}>{datumLang(artikel.aktualisiert)}</time>
                  </span>
                </>
              )}
            </div>

            <p className="mt-7 text-pretty text-lead leading-[1.55] text-foreground/85">
              {verlinkeAbsatz(artikel.intro, introLinks, gesetzteLinks)}
            </p>
          </div>
        </header>

        {/* Kernaussagen — die zitierfähigen Sätze, ganz oben.

            Jeder steht für sich: wer nur diesen Block liest, hat die Antwort.
            Genau darauf greifen sowohl hervorgehobene Suchergebnisse als auch
            die Systeme zu, die eine Seite abrufen, um daraus zu antworten. */}
        <div className={`${TEXT_CONTAINER} pt-12`}>
          <aside
            className="border-l-2 border-primary bg-surface p-6 sm:p-8"
            aria-label="Das Wichtigste in Kürze"
          >
            <h2 className="text-mini font-bold uppercase tracking-wide text-muted-foreground">
              Das Wichtigste in Kürze
            </h2>
            <ul className="mt-5 space-y-4">
              {artikel.kernaussagen.map((aussage) => (
                <li
                  key={aussage}
                  className="flex items-start gap-3 text-[17px] leading-[1.55] text-foreground"
                >
                  <span className="mt-[11px] h-1.5 w-1.5 shrink-0 bg-primary" aria-hidden="true" />
                  {aussage}
                </li>
              ))}
            </ul>
          </aside>
        </div>

        {inhaltsverzeichnis && (
          <nav className={`${TEXT_CONTAINER} pt-10`} aria-label="Inhalt">
            <h2 className="text-mini font-bold uppercase tracking-wide text-muted-foreground">
              Inhalt
            </h2>
            <ol className="mt-4 divide-y divide-border border-y border-border">
              {artikel.abschnitte.map((abschnitt, index) => (
                <li key={abschnitt.heading}>
                  <a
                    href={`#${ankerId(abschnitt.heading, index)}`}
                    className="flex items-baseline gap-3 py-2.5 text-[15px] leading-[1.5] text-muted-foreground transition-colors hover:text-primary"
                  >
                    {/* Ohne Deckkraft-Abstufung (20.08.2026): `/70` ergab bei 12 px fett
                        auf Weiss 3,12 : 1 — gefordert sind 4,5 : 1. Voll deckend sind es
                        6,0 : 1. Die Ziffer bleibt trotzdem ruhiger als der Eintrag daneben,
                        weil sie kleiner gesetzt ist. */}
                    <span className="kinetic-data shrink-0 text-mini text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {abschnitt.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className={`${TEXT_CONTAINER} py-12 sm:py-14`}>
          {artikel.abschnitte.map((abschnitt, index) => {
            const links = artikel.interneLinks.filter((l) => l.abschnitt === index);

            return (
              <section key={abschnitt.heading} className="mb-12 last:mb-0">
                <h2
                  id={ankerId(abschnitt.heading, index)}
                  className="kinetic-display scroll-mt-24 text-balance text-[24px] leading-[1.2] text-foreground sm:text-[28px]"
                >
                  {abschnitt.heading}
                </h2>

                <div className="mt-5 space-y-4 text-pretty text-[16px] leading-[1.7] text-muted-foreground">
                  <AbsaetzeMitLinks
                    absaetze={abschnitt.paragraphs}
                    links={links}
                    bereitsGesetzt={gesetzteLinks}
                  />
                </div>

                {abschnitt.bullets && abschnitt.bullets.length > 0 && (
                  <ul className="mt-6 space-y-3">
                    {abschnitt.bullets.map((punkt) => (
                      <li
                        key={punkt}
                        className="flex items-start gap-3 text-[16px] leading-[1.6] text-foreground/90"
                      >
                        <span
                          className="mt-[10px] h-1.5 w-1.5 shrink-0 bg-primary"
                          aria-hidden="true"
                        />
                        {punkt}
                      </li>
                    ))}
                  </ul>
                )}

                {abschnitt.tabelle && (
                  /* Tabellen scrollen in ihrem eigenen Kasten. Auf 360 px Breite
                     würde eine dreispaltige Tabelle sonst die ganze Seite
                     seitlich verschiebbar machen. */
                  <div className="mt-6 overflow-x-auto border border-border">
                    <table className="w-full min-w-[420px] border-collapse text-left text-[15px]">
                      <thead>
                        <tr className="bg-surface">
                          {abschnitt.tabelle.kopf.map((zelle) => (
                            <th
                              key={zelle}
                              scope="col"
                              className="border-b border-border px-4 py-3 font-bold text-foreground"
                            >
                              {zelle}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {abschnitt.tabelle.zeilen.map((zeile, zeilenIndex) => (
                          <tr key={zeilenIndex}>
                            {zeile.map((zelle, zellenIndex) => (
                              <td
                                key={zellenIndex}
                                className="px-4 py-3 align-top leading-[1.6] text-muted-foreground"
                              >
                                {zelle}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {abschnitt.unterabschnitte?.map((unter) => (
                  <div key={unter.heading} className="mt-8">
                    <h3 className="kinetic-display text-balance text-[19px] leading-[1.25] text-foreground sm:text-[21px]">
                      {unter.heading}
                    </h3>
                    <div className="mt-4 space-y-4 text-pretty text-[16px] leading-[1.7] text-muted-foreground">
                      <AbsaetzeMitLinks
                        absaetze={unter.paragraphs}
                        links={links}
                        bereitsGesetzt={gesetzteLinks}
                      />
                    </div>
                  </div>
                ))}
              </section>
            );
          })}

          <p className="mt-14 border-l-2 border-primary bg-surface p-6 text-pretty text-[18px] font-semibold leading-[1.5] text-foreground sm:p-8 sm:text-[20px]">
            {artikel.fazit}
          </p>
        </div>

        {/* Häufige Fragen — sichtbar im HTML, bewusst OHNE FAQPage-Auszeichnung.

            Google hat das FAQ-Rich-Result zum 07.05.2026 abgeschaltet und die
            Dokumentation im Juni entfernt. Das Markup erzeugt kein Suchergebnis
            mehr. Wirksam ist der sichtbare Teil: eine echte Frage als
            Überschrift, direkt darunter die Antwort. */}
        {artikel.faq.length > 0 && (
          <section className={`${TEXT_CONTAINER} pb-14`} aria-labelledby="haeufige-fragen">
            <h2
              id="haeufige-fragen"
              className="kinetic-display text-balance text-[24px] leading-[1.2] text-foreground sm:text-[28px]"
            >
              Häufige Fragen
            </h2>
            <div className="mt-6 divide-y divide-border border-y border-border">
              {artikel.faq.map((eintrag) => (
                <div key={eintrag.frage} className="py-6">
                  <h3 className="text-[17px] font-bold leading-[1.4] text-foreground">
                    {eintrag.frage}
                  </h3>
                  <p className="mt-3 text-pretty text-[16px] leading-[1.7] text-muted-foreground">
                    {eintrag.antwort}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quellen. Sie stehen hier, weil jede Zahl im Text einen Beleg braucht —
            und weil ein sichtbarer Beleg der Unterschied zwischen einer Aussage
            und einer Behauptung ist. */}
        {artikel.quellen.length > 0 && (
          <section className={`${TEXT_CONTAINER} pb-14`} aria-labelledby="quellen">
            <h2 id="quellen" className="text-mini font-bold uppercase tracking-wide text-muted-foreground">
              Quellen
            </h2>
            <ol className="mt-4 space-y-3 text-[15px] leading-[1.6] text-muted-foreground">
              {artikel.quellen.map((quelle) => (
                <li key={quelle.url}>
                  <a
                    href={quelle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline decoration-border underline-offset-2 transition-colors hover:decoration-primary"
                  >
                    {quelle.bezeichnung}
                  </a>
                  <span className="text-muted-foreground/80">
                    {" "}
                    — abgerufen am {datumKurz(quelle.abgerufen)}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Wer das geschrieben hat. Die Auswertung von Googles eigener
            Bewertungsanleitung läuft an einer Stelle auf „first-hand or life
            experience" hinaus — und die lässt sich nur an einer benannten Person
            festmachen, nicht an einer Firma. */}
        <section className={`${TEXT_CONTAINER} pb-14`} aria-labelledby="autor">
          <h2 id="autor" className="text-mini font-bold uppercase tracking-wide text-muted-foreground">
            Geschrieben von
          </h2>
          <div className="mt-4 flex flex-col gap-5 border border-border p-6 sm:flex-row sm:items-start sm:p-8">
            {autor.bild && (
              <Image
                src={autor.bild}
                alt={autor.name}
                width={96}
                height={96}
                className="h-24 w-24 shrink-0 object-cover"
              />
            )}
            <div className="min-w-0">
              <Link
                href={autorUrl(autor.slug).replace(BASE_URL, "")}
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
        </section>
      </article>

      {/* Zurück ins Thema. Der Grund ist nicht Bequemlichkeit: Bei täglicher
          Veröffentlichung steht Artikel Nummer eins nach vierzig Tagen auf Seite
          drei der Übersicht und hat dann keinen einzigen Link mehr aus einem
          Fließtext. Der Themen-Hub hält ihn bei zwei Klicks von der Startseite. */}
      {imThema.length > 0 && (
        <section className={`${SITE_CONTAINER} pb-10`} aria-labelledby="weiter-im-thema">
          <h2
            id="weiter-im-thema"
            className="text-mini font-bold uppercase tracking-wide text-muted-foreground"
          >
            Weiter in „{cluster.titel}“
          </h2>
          <ul className="mt-4 grid gap-px border border-border bg-border sm:grid-cols-3">
            {imThema.map((eintrag) => (
              <li key={eintrag.slug} className="bg-background">
                <Link
                  href={`/gratis-wissen/${eintrag.slug}`}
                  className="group flex h-full flex-col p-6 transition-colors hover:bg-foreground/[0.03]"
                >
                  <span className="text-[16px] font-bold leading-[1.3] text-foreground">
                    {eintrag.titel}
                  </span>
                  <span className="mt-3 line-clamp-3 text-[14px] leading-[1.55] text-muted-foreground">
                    {eintrag.teaser}
                  </span>
                  <span className="mt-4 inline-flex items-center gap-2 text-mini font-bold text-primary">
                    Lesen
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {naechster && (
        <nav aria-label="Weitere Artikel" className={`${SITE_CONTAINER} pb-4`}>
          <Link
            href={`/gratis-wissen/${naechster.slug}`}
            className="group flex items-center justify-between gap-4 border border-border bg-background p-6 transition-colors hover:border-primary sm:p-8"
          >
            <span className="min-w-0">
              <span className="block text-mini uppercase tracking-wide text-muted-foreground">
                Nächster Artikel
              </span>
              <span className="mt-1 block text-[17px] font-bold leading-tight text-foreground">
                {naechster.titel}
              </span>
            </span>
            <ArrowRight
              className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </nav>
      )}

      <CtaBanner
        heading={artikel.cta.heading}
        text={artikel.cta.text}
        position={`wissen-${artikel.slug}`}
      />
    </PageShell>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Sprungmarke aus einer Überschrift.
 *
 * Der Index hängt hinten dran, weil zwei Abschnitte dieselbe Frage tragen können
 * und doppelte IDs im Dokument sonst dazu führen, dass das Inhaltsverzeichnis
 * immer an dieselbe Stelle springt.
 */
function ankerId(heading: string, index: number): string {
  const basis = heading
    .toLowerCase()
    .replace(/[äöüß]/g, (zeichen) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" })[zeichen] ?? zeichen)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  return `${basis || "abschnitt"}-${index + 1}`;
}
