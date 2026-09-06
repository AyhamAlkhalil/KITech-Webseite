import { CtaLink } from "@/components/conversion/CtaLink";
import { StructuredData, getFAQSchema, getWebPageSchema } from "@/components/seo/StructuredData";
import { PageShell } from "@/components/layout/PageShell";
import { CallPopup } from "@/components/conversion/CallPopup";
import { KundenLaufband } from "@/components/sections/KundenLaufband";
import { StackSaeule, StackBand } from "@/components/sections/StackLaufband";
import { Gruenderwort } from "@/components/sections/Gruenderwort";
import { FaqBlock } from "@/components/sections/FaqBlock";
import { CheckEinladung } from "@/components/sections/CheckEinladung";
import { Konformitaet } from "@/components/sections/Konformitaet";
import { faq } from "@/data/faq";
import { teamRoster } from "@/data/team";
import { angebot, verfuegbarkeitKurz } from "@/config/angebot";
import { WegeBlock } from "@/components/sections/WegeBlock";
import { WeiterlesenBlock } from "@/components/sections/WeiterlesenBlock";
import type { ArtikelTeaser } from "@/lib/wissen/empfehlungen";

/**
 * Startseite, von oben nach unten:
 *
 *   1. Hero — hellgrauer Grund, Aussage, ein Satz darunter, Pill-CTA.
 *      Rechts steht Ayham; auf dem Handy unter dem Knopf.
 *   2. Kundenkarten als durchlaufendes Laufband.
 *   3. Gruenderwort mit Team an der Seite (14.08.2026).
 *   4. FAQ (14.08.2026).
 *   5. Abschluss: Ablauf des Checks und der letzte Knopf (17.08.2026).
 *
 * **Die Seite endete zwischenzeitlich nach dem Laufband** — ausdrueckliche
 * Vorgabe vom 11.08.2026 ("Darunter KOMPLETT LEER LASSEN, ich gebe dir alles
 * vor."). Seither ist sie auf Ansage in drei Schritten wieder gefuellt worden;
 * jeder Block hat seine eigene Datendatei unter `src/data/`.
 *
 * Der alte Abschluss-CTA (`FinalCta`) kommt hier bewusst NICHT zurueck: an
 * seiner Stelle steht `CheckEinladung`, die erst den Ablauf zeigt und dann
 * fragt. `TeamSection` (die grossen Kacheln) liegt weiter unbenutzt im Repo.
 *
 * **Nur eine Person im Hero** (Vorgabe 12.08.2026): "Ich moechte, dass in beiden
 * Versionen nur ich als erstes Foto auftauche." Leons Portrait ist deshalb aus
 * dem Hero genommen — er bleibt im Team-Abschnitt und als Kunde im Laufband.
 *
 * **Server Component seit dem 01.09.2026.** Bis dahin stand hier
 * `"use client"` — wegen einer einzigen Zeile, dem `onClick` mit `trackEvent`
 * am Hero-Knopf. Der Handler sitzt jetzt in `CtaLink`, das Markup bleibt auf
 * dem Server.
 *
 * ⚠️ **Der Umbau hat die Ladezeit NICHT verbessert — nachgemessen.** A/B über
 * zwei Lighthouse-Läufe je Stand im selben Container: LCP 3925 → 3915 ms,
 * Script Evaluation 629 → 685 ms. Alles Rauschen. Der Grund: Das Bundle der
 * Startseite kommt nicht aus dieser Datei, sondern aus dem Rahmen —
 * `Providers` (framer-motion, next-themes, Toaster, CookieConsent) sowie
 * `SiteHeader`, `KundenLaufband`, `CheckEinladung`, `WeiterlesenBlock` und
 * `CallPopup`. Die waren vorher Client und sind es weiterhin.
 *
 * Wer hier also Ladezeit sucht, sucht am falschen Ende. Die Server Component
 * bleibt trotzdem richtig: statisches Markup gehört nicht in den Browser, und
 * die Grenze hält den Unterschied sichtbar. Ein `onClick` direkt in dieser
 * Datei zieht die ganze Seite zurück — kapsle ihn in einer Client-Insel
 * (Vorbild `CtaLink`).
 *
 * Geometrie aus der Vorlage gemessen (acquisition.com, 1440 px):
 *   grauer Bereich   432 px hoch
 *   Ueberschrift     50 px / 800 / Zeilenhoehe 57,5 px, zentriert, y = 203
 *   Einordnungssatz  21 px / 400
 *   Knopf            420 x 56 px, Radius 100 px, 20 px / 700
 *   Portrait         259 px breit (18 % der Fensterbreite), unten buendig
 */

/**
 * Ersatz, solange die neue freigestellte Aufnahme fehlt: das vorhandene
 * Team-Portrait. Welcher Pfad tatsaechlich gilt, entscheidet der Server-Wrapper
 * `src/app/page.tsx` beim Build (siehe Kommentar dort) und reicht ihn als
 * `heroPortrait` herein.
 */
const ersatzPortrait = teamRoster.find((m) => m.name.startsWith("Ayham"))?.photo ?? null;

/**
 * Der Satz unter der Aussage. Die Zahl "ueber 50" ist dieselbe wie auf der
 * Referenz-Uebersicht. Aendert sie sich, muss sie hier und in
 * `src/views/Referenzen.tsx` mitgezogen werden.
 */
const HERO_SUBLINE =
  "Über 50 abgeschlossene Projekte — vom ersten Gespräch bis zur Software, die im Tagesgeschäft läuft.";

export default function Home({
  /** Freigestelltes Hero-Portrait, vom Server-Wrapper geprüft. `null` => Ersatz. */
  heroPortrait = null,
  /** Artikel aus /gratis-wissen, vom Server-Wrapper ausgewählt. */
  wissen = [],
}: {
  heroPortrait?: string | null;
  wissen?: ArtikelTeaser[];
}) {
  const portrait = heroPortrait ?? ersatzPortrait;

  return (
    <PageShell backdrop="none">
      <StructuredData
        data={[
          getWebPageSchema(
            "KITech Software",
            "Anwendungspartner für KI im deutschen Mittelstand",
            "https://kitech-software.de/"
          ),
          /* Aus derselben Quelle wie der sichtbare FAQ-Block weiter unten —
             Google verlangt, dass ausgezeichneter Text auf der Seite steht. */
          getFAQSchema(faq.map((f) => ({ question: f.frage, answer: f.antwort }))),
        ]}
      />

      <section className="relative isolate overflow-hidden bg-surface-strong">
        {/*
          Desktop: das Portrait steht absolut am rechten Rand und wird vom
          Fensterrand angeschnitten. 18 % der Fensterbreite entspricht den in
          der Vorlage gemessenen 259 px bei 1440.

          **Erst ab `dt` (1025 px), nicht schon ab `sm`.** Zwischen 640 und
          1024 px ist der Knopf `w-full` und die Ueberschrift `max-w-[660px]`
          zentriert — das absolut gesetzte Portrait lag dort ueber beidem:
          gemessen 138 px ueber der Knopfbeschriftung und 105 px ueber der H1,
          bei 1024 px sogar 168 px. Im Querformat eines Handys (844x390) galt
          dasselbe. Ab `dt` bekommt der Knopf mit `dt:w-[420px]` seine feste
          Breite und rueckt aus dem Weg; erst dann traegt die Anordnung.

          Bis dahin uebernimmt die gestapelte Fassung unter dem Knopf — dieselbe
          Aufteilung, die `/funnel` schon hat (`lg:block` / `lg:hidden`).
        */}
        {portrait && (
          <img
            src={portrait}
            alt=""
            aria-hidden="true"
            width={295}
            height={700}
            className="pointer-events-none absolute bottom-0 right-0 hidden h-[360px] w-auto select-none object-contain object-bottom dt:block dt:h-[400px]"
          />
        )}

        {/*
          `min-h`, nicht `h`: der Abschnitt ist in der Vorlage 432 px hoch, und
          genau so hoch wird er auch hier — solange der Inhalt hineinpasst. Mit
          fester Höhe staucht Flexbox stattdessen die Kinder, sobald etwas mehr
          Platz braucht. Genau das ist passiert: die Überschrift brach dreizeilig
          statt zweizeilig um, und der Knopf wurde von 56 auf 41 px zusammen-
          gedrückt — sichtbar als "die Verhältnisse stimmen nicht".
        */}
        <div className="relative mx-auto flex w-full max-w-site flex-col items-center px-[15px] pt-[40px] text-center sm:pt-[70px] lg:pt-[100px] dt:min-h-[432px] dt:pt-[70px]">
          {/*
            Die Werkzeug-Spur in der freien Spalte links (04.09.2026). Sie steht
            absolut und ausserhalb des Textflusses — die H1 bleibt damit das
            erste und einzige, was mittig steht.

            Platz gerechnet, damit sie die Ueberschrift nicht beruehrt: Der
            Container misst hoechstens 1180 px, davon 30 px Innenabstand, die
            H1 660 px — es bleiben 245 px je Seite. Bei 1025 px (der Grenze, ab
            der sie ueberhaupt erscheint) sind es noch 167 px. Die Saeule ist
            112 px breit; darunter wird die Luft zur Schrift zu knapp.
          */}
          <StackSaeule />

          {/*
            Breite so gewählt, dass die Aussage auf zwei Zeilen umbricht — in der
            Vorlage ist die Überschrift zweizeilig, erste Zeile 607 px breit.
            `max-w-[13ch]` ergab drei Zeilen und damit 57,5 px Überlänge.
          */}
          {/* Ohne Auszeichnung auf "mehr" (Vorgabe 12.08.2026): der blaue Marker
              ist raus. Die Aussage trägt sich allein — das war schon der Grund,
              warum im Hero sonst nichts steht. */}
          <h1 className="kinetic-morph-in max-w-[660px] text-balance text-[50px] font-extrabold uppercase leading-[57.5px] tracking-tight text-foreground">
            Falsche KI kostet mehr als keine KI.
          </h1>

          {/* Mobil 18 px / 27, ab 1025 px 21 px / 30 — beides aus der Vorlage
              gemessen. Die Überschrift behält dagegen auf allen Breiten ihre
              50 px, auch das ist so gemessen. */}
          <p className="mt-[22px] max-w-[590px] text-pretty text-[18px] font-normal leading-[27px] text-foreground dt:text-subline">
            {HERO_SUBLINE}
          </p>

          <CtaLink
            href={angebot.href}
            ereignis="Calendly_Klick"
            eigenschaften={{ position: "home-hero" }}
            /* `min-h` statt `h`: die Beschriftung kommt aus `angebot.ts` und
               kann laenger werden. Auf schmalen Handys bricht sie zweizeilig
               um — mit fester Hoehe liefe sie aus der Pille heraus. */
            /* Die Breite von 420 px greift ab `sm`, nicht erst ab `dt`: bis
               dahin lief der Knopf ueber die volle Fensterbreite und war bei
               1024 px 994 px breit — dieselbe Pille, die am Desktop 420 px
               misst. Auf dem Handy bleibt die volle Breite richtig, dort ist
               die Flaeche das Tippziel. */
            className="mt-[39px] inline-flex min-h-[52px] w-full items-center justify-center rounded-[100px] bg-primary px-[10px] py-2 text-center text-[20px] font-bold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-[420px] dt:min-h-[56px]"
          >
            {angebot.cta}
          </CtaLink>

          {/* Der Hinweis steht in der Vorlage nicht — er gehoert zu unserem
              Inhalt und bleibt deshalb. Klein gesetzt, damit er die Geometrie
              des Hero nicht verschiebt. */}
          {/* Dauer und Platzangabe direkt unter dem Knopf: die Begrenzung ist
              echt (fuenf Stunden pro Woche) und traegt sich deshalb selbst. */}
          <p className="mt-3 text-mini font-normal text-muted-foreground">
            Kostenlos · {angebot.dauer} · {verfuegbarkeitKurz()}
          </p>

          {/* Dieselben Marken wie in der Saeule, bis 1024 px als waagerechtes
              Band — dort gibt es links keine freie Spalte. Traegt zusaetzlich
              den Satz, den Screenreader auf JEDER Breite vorlesen. */}
          <StackBand />

          {/*
            Handy und Tablet: das Portrait steht unter dem Knopf, mittig und
            unten buendig — dort, wo die Vorlage ihr Hero-Bild zeigt.

            Die Grenze ist `dt` (1025 px), nicht `sm`: bis dahin ist der Knopf
            `w-full` und die Ueberschrift zentriert, und das absolut gesetzte
            Portrait lag genau darueber. Begruendung oben am Desktop-Bild.
          */}
          {portrait && (
            <div className="mt-[30px] flex w-full justify-center dt:hidden" aria-hidden="true">
              {/*
                `width`/`height` sind gesetzt, obwohl die Anzeige ueber `h-[320px]
                w-auto` laeuft: Ohne bekanntes Seitenverhaeltnis reserviert der
                Browser keinen Platz, und die ganze Spalte darunter springt,
                sobald das Bild eintrifft. Genau dieser Block war am 20.08.2026
                der gemessene Hauptverursacher der Layoutverschiebung auf der
                Startseite. Die Zahlen sind die tatsaechlichen Bildmasse
                (public/images/team/ayham-hero.webp).
              */}
              <img
                src={portrait}
                alt=""
                width={295}
                height={700}
                className="h-[320px] w-auto select-none object-contain object-bottom"
              />
            </div>
          )}
        </div>
      </section>

      {/* Kundenkarten als durchlaufendes Band. */}
      <KundenLaufband />

      {/* Seit dem 14.08.2026 steht darunter wieder etwas — auf Ansage, nachdem
          die Seite seit dem 11.08. bewusst nach dem Laufband endete: erst die
          Person hinter der Firma, dann die Fragen, die im Gespräch immer
          kommen. Inhalte in src/data/gruenderwort.ts bzw. src/data/faq.ts. */}
      <Gruenderwort />

      {/* Die Weiche (27.08.2026): Aus dem Inhalt der Startseite fuehrte kein
          einziger Link auf /solo, /enterprise oder /leistungen — sie standen
          nur in Kopf- und Fusszeile. Begruendung im Kopf von WegeBlock.tsx.

          Hier und nicht weiter unten: Wer gerade gelesen hat, wer hinter der
          Firma steht, fragt als naechstes, was das fuer jemanden wie ihn heisst.
          Die offenen Fragen darunter raeumen dann den Rest weg, bevor der
          Knopf kommt. */}
      <WegeBlock />

      <FaqBlock />

      {/* Der Schluss (17.08.2026, auf Ansage): was in der halben Stunde passiert
          und der Knopf dazu. Bis dahin endete die Seite nach der letzten Frage
          und ging direkt in die Fusszeile — der am besten vorbereitete Besucher
          der ganzen Seite wurde also nie gefragt. Inhalt:
          src/data/check-einladung.ts. */}
      {/* Artikel aus /gratis-wissen — eingebaut am 24.08.2026, nachdem gemessen
          wurde, dass keine einzige Hauptseite auf einen Beitrag verlinkte. Die
          Startseite trägt die meiste Autorität; von hier aus ist jeder Artikel
          einen Sprung entfernt statt zwei. Der Hero bleibt davon unberührt —
          er trägt weiterhin genau eine Aussage. Auswahl:
          src/lib/wissen/empfehlungen.ts. */}
      <WeiterlesenBlock
        artikel={wissen}
        heading="Wir schreiben auf, was wir wissen."
        text="Kostenlos, ohne Anmeldung — mit den Zahlen und Entscheidungen aus echten Projekten."
      />

      {/* Wie hier gearbeitet wird, mit Beleg je Zeile (04.09.2026). Steht VOR
          dem letzten Knopf: Wer die Bedenken erst nach der Frage ausräumt,
          räumt sie zu spät aus. Inhalt: src/data/konformitaet.ts. */}
      <Konformitaet />

      <CheckEinladung />

      {/* Geht kurz nach dem Laden ueber dem Hero auf — nur hier, nicht in der
          PageShell. Zeiten und Text: src/data/call-popup.ts. */}
      <CallPopup />
    </PageShell>
  );
}
