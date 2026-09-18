"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowLeft, RotateCw } from "lucide-react";
import { CheckShell } from "@/components/layout/CheckShell";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { trackEvent } from "@/lib/plausible";
import { meldeEreignis } from "@/lib/ereignis";
import { ANTWORT_OPTIONEN, FRAGEN, type Antwort } from "@/data/selbstcheck";
import { teamRoster } from "@/data/team";

/*
 * ⚠️ **Der Ausfüllende sieht seine Auswertung nicht, und er wird nicht nach
 * sich gefragt** (Ansage 18.09.2026, zwei Schritte am selben Tag). Mit der
 * achten Antwort geht alles anonym an `/api/selbstcheck`; dort entsteht das
 * PDF und geht per Mail an das Postfach, das es bearbeitet.
 *
 * Bis dahin lief der Check vollständig im Browser: keine Übertragung, Ergebnis
 * sofort auf der Seite. Die erste Fassung des Umbaus fragte danach Name, Firma
 * und E-Mail ab; auf Ansage ist auch das wieder draußen.
 *
 * Daraus folgen die Texte, die technisch nichts tun: „Die Antworten bleiben in
 * Ihrem Browser", „kein Datenversand", „die Auswertung sehen Sie sofort" wären
 * jetzt die Unwahrheit, und „wir melden uns per E-Mail" wäre es auch — ohne
 * Adresse kann sich niemand melden. Der Weg zum Gespräch ist der Termin-Knopf.
 *
 * ⚠️ Wer den Versand wieder herausnimmt, nimmt die Texte mit zurück. Was der
 * Besucher vor dem ersten Klick liest, muss beschreiben, was danach passiert.
 */

type Stufe = "intro" | "check" | "abschluss";
type Versand = "laeuft" | "ok" | "fehler";

/**
 * Wer die Ergebnisse bekommt — dieselbe Person, an die `/api/selbstcheck` das
 * PDF schickt. Name, Rolle und Foto aus `data/team.ts`, damit die Angaben mit
 * der Startseite übereinstimmen. Fehlt der Eintrag, entfällt der Block, statt
 * ein leeres Bild zu zeigen; `selbstcheck.test.ts` hält ihn fest.
 */
const BERATER = teamRoster.find((mitglied) => mitglied.name === "Jörg Kratzat");

const ANTWORT_FARBE: Record<Antwort, string> = {
  yes: "hsl(var(--success))",
  unsure: "hsl(var(--solo-accent))",
  no: "hsl(var(--destructive))",
};

export default function EuAiActSelbstcheck() {
  const [stufe, setStufe] = useState<Stufe>("intro");
  const [antworten, setAntworten] = useState<Record<number, Antwort>>({});
  const [index, setIndex] = useState(0);
  const [versand, setVersand] = useState<Versand>("laeuft");
  const [fehler, setFehler] = useState<string | null>(null);
  /* Gegen den Doppelklick auf die letzte Antwort: Zwei Klicks im selben Takt
     sähen beide noch die Frage und schickten den Check zweimal. */
  const sendetGerade = useRef(false);
  const reduceMotion = useReducedMotion();

  function nachOben() {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function start() {
    setAntworten({});
    setIndex(0);
    setStufe("check");
    trackEvent("CTA_Klick", { position: "selbstcheck-start" });
    nachOben();
  }

  async function sende(alle: Record<number, Antwort>) {
    if (sendetGerade.current) return;
    sendetGerade.current = true;
    setVersand("laeuft");
    setFehler(null);

    const ergebnis = await uebermittle(alle);
    sendetGerade.current = false;

    /* `in` statt `!ergebnis.ok`: Ohne `strict` verengt TypeScript die Union
       über das Boolean nicht. */
    if ("fehler" in ergebnis) {
      /* ⚠️ Keine Bestätigung ohne Versand. Der Ausfüllende sieht sein
         Ergebnis nicht — meldete die Seite „eingegangen", wären seine
         Antworten verloren, und niemand erführe es. */
      setFehler(ergebnis.fehler);
      setVersand("fehler");
      return;
    }

    setVersand("ok");
    /* ⚠️ Erst nach dem Erfolg und abgeschirmt: `trackEvent` ruft
       `window.plausible` ungeschützt auf. Stand es im selben `try` wie der
       Versand, machte ein Fehler der Statistik aus einer angekommenen Mail
       einen angezeigten Fehlschlag — und „Noch einmal senden" schickte sie
       ein zweites Mal. */
    try {
      trackEvent("Lead_Qualifier_abgeschlossen", { position: "selbstcheck" });
    } catch {
      /* Statistik ist Beiwerk; der Versand ist gelungen. */
    }
    /* Wer den Check zu Ende macht, beschäftigt sich ernsthaft mit dem Thema —
       das ist eine Sofortmeldung wert. Fängt seine Fehler selbst. */
    meldeEreignis("selbstcheck_fertig");
  }

  function antworte(wert: Antwort) {
    const alle = { ...antworten, [index]: wert };
    setAntworten(alle);
    if (index + 1 < FRAGEN.length) {
      setIndex(index + 1);
      return;
    }
    setStufe("abschluss");
    nachOben();
    void sende(alle);
  }

  return (
    /*
     * Der Check laeuft seit dem 11.08.2026 markenfrei: keine Kopfzeile mit Logo,
     * keine Fusszeile mit Firmierung, kein Ankuendigungsbalken — statt der
     * `PageShell` traegt er die `CheckShell` (siehe die Begruendung dort).
     *
     * Er stand vorher im vollen Seitenrahmen, weil er als eigener Fokus-Screen
     * eine Sackgasse war. Der markenfreie Rahmen loest das anders: er verlinkt
     * oben rechts weiter — auf den Selbstcheck zur Entgelttransparenzrichtlinie
     * unter klargehalt.de, das zweite Werkzeug derselben Art.
     */
    <CheckShell
      title="EU AI Act · Selbstcheck"
      link={{
        href: "https://www.klargehalt.de/selbstcheck",
        label: "Entgelttransparenzrichtlinie prüfen",
        shortLabel: "Entgelttransparenz",
        trackingPosition: "selbstcheck-klargehalt",
      }}
      note="Orientierung auf Basis Ihrer Angaben, keine Rechtsberatung. Die Antworten gehen anonym an uns."
    >
      <>
        {stufe === "intro" && <Intro onStart={start} />}
        {stufe === "check" && (
          <Fragen
            index={index}
            antworten={antworten}
            onAntwort={antworte}
            onZurueck={() => setIndex((vorher) => Math.max(0, vorher - 1))}
          />
        )}
        {stufe === "abschluss" && (
          <Abschluss
            versand={versand}
            fehler={fehler}
            onErneut={() => void sende(antworten)}
            onNeustart={start}
          />
        )}
      </>
    </CheckShell>
  );
}

/* --------------------------------------------------------------- Versand */

type Ergebnis = { ok: true } | { ok: false; fehler: string };

/**
 * Schickt die Antworten an die Route. **Wirft nie** — jeder Ausgang ist ein
 * Ergebnis, damit der Aufrufer die Sperre gegen Doppelklicks sicher löst und
 * nichts anderes als der Versand über Erfolg oder Fehlschlag entscheidet.
 */
async function uebermittle(alle: Record<number, Antwort>): Promise<Ergebnis> {
  const params = new URLSearchParams(window.location.search);
  try {
    const antwort = await fetch("/api/selbstcheck", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        antworten: FRAGEN.map((_, i) => alle[i] ?? "no"),
        referrer: document.referrer || null,
        utmSource: params.get("utm_source"),
        utmMedium: params.get("utm_medium"),
        utmCampaign: params.get("utm_campaign"),
      }),
    });
    if (antwort.ok) return { ok: true };
    const rumpf = (await antwort.json().catch(() => null)) as { fehler?: string } | null;
    return { ok: false, fehler: rumpf?.fehler ?? "Die Übermittlung hat nicht geklappt." };
  } catch {
    return {
      ok: false,
      fehler: "Keine Verbindung. Bitte prüfen Sie Ihr Netz und versuchen es noch einmal.",
    };
  }
}

/* ------------------------------------------------------------------ Intro */

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <>
      <section className="relative isolate w-full overflow-hidden">
        {/* Heller Kopfbereich statt des frueheren Canvas-Signalfelds: die
            Animation war ein Element des dunklen Designs, auf weissem Grund gibt
            es nichts zu leuchten (siehe docs/DESIGN.md). */}
        <div
          className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-surface-strong to-background"
          aria-hidden="true"
        />

        <div className={`${SITE_CONTAINER} grid gap-12 py-20 sm:py-24 lg:grid-cols-12 lg:gap-12 lg:py-28`}>
          <div className="lg:col-span-7">
            <span className="mb-6 block w-fit bg-primary px-3 py-1.5 text-mini font-medium uppercase tracking-wide text-primary-foreground">
              EU AI Act · Selbstcheck
            </span>

            {/* Ohne blauen Marker (Vorgabe 14.08.2026) — dieselbe Änderung
                wie auf allen anderen Seiten. */}
            <h1 className="kinetic-display kinetic-morph-in max-w-2xl text-balance text-4xl leading-[1.35] text-foreground sm:text-5xl sm:leading-[1.25] lg:text-6xl">
              Acht Fragen. Die Auswertung gibt es im Gespräch.
            </h1>

            <p className="mt-8 max-w-xl text-balance text-base font-light leading-relaxed text-foreground/85">
              Der EU AI Act gilt. Die meisten Unternehmen erfüllen mehr davon, als sie denken — und
              können weniger davon belegen, als sie glauben. Dieser Check trennt beides.
            </p>
            {/* Steht bewusst vor dem Knopf: Wer nach acht Fragen erfährt, dass
                er sein Ergebnis nicht zu sehen bekommt, fühlt sich vorgeführt. */}
            <p className="mt-4 max-w-xl text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
              Zwei Minuten, ohne Namen und ohne E-Mail-Adresse. Mit der letzten Antwort gehen Ihre
              Angaben anonym an unser Team. Eine Auswertung auf dem Bildschirm gibt es nicht; wo Sie
              stehen, klären wir im Gespräch.
            </p>

            <button
              type="button"
              onClick={onStart}
              className="group mt-10 inline-flex w-full items-center justify-between gap-6 bg-primary px-6 py-5 text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto"
            >
              <span className="text-left">
                <span className="block text-base font-medium sm:text-lg">Check starten</span>
                <span className="mt-1 block text-xs font-light text-primary-foreground/70 sm:text-sm">
                  Acht Fragen, anonym
                </span>
              </span>
              <ArrowRight
                className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </button>

            <p className="mt-8 max-w-xl text-xs leading-relaxed text-muted-foreground">
              Der Check ist eine Orientierung, keine Rechtsberatung. Er bildet die Pflichten ab, die
              bei Unternehmen mit KI-Einsatz in der Praxis zuerst auffallen.
            </p>
          </div>

          {/* Statt drei generischer Benefit-Kacheln: die acht Pruefpunkte selbst.
              Wer wissen will, was der Check abfragt, sieht es hier vollstaendig. */}
          <div className="lg:col-span-5">
            <div className="border border-border bg-surface">
              <p className="border-b border-border px-5 py-4 text-sm font-medium text-foreground">
                Was geprüft wird
              </p>
              <ol className="divide-y divide-border">
                {FRAGEN.map((frage, i) => (
                  <li key={frage.label} className="flex items-baseline gap-4 px-5 py-3.5">
                    <span className="kinetic-data w-5 shrink-0 text-xs text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="text-sm font-light text-foreground/90">{frage.label}</span>
                    {frage.weight === 2 && (
                      <span className="ml-auto shrink-0 text-mini uppercase tracking-wide text-accent">
                        Kernpflicht
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ Fragen */

function Fragen({
  index,
  antworten,
  onAntwort,
  onZurueck,
}: {
  index: number;
  antworten: Record<number, Antwort>;
  onAntwort: (wert: Antwort) => void;
  onZurueck: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const frage = FRAGEN[index];
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    groupRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, [index]);

  function onKeyDown(event: React.KeyboardEvent) {
    const buttons = Array.from(groupRef.current?.querySelectorAll("button") ?? []);
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      buttons[(current + 1 + buttons.length) % buttons.length]?.focus();
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      buttons[(current - 1 + buttons.length) % buttons.length]?.focus();
    }
  }

  return (
    <section className={`${SITE_CONTAINER} w-full py-14 sm:py-20`}>
      <div className="mx-auto max-w-3xl">
        <Fortschritt index={index} antworten={antworten} />

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 border border-border bg-surface"
          >
            <div className="border-b border-border px-6 py-8 sm:px-10 sm:py-10">
              <p className="kinetic-data text-xs text-muted-foreground">
                Frage {index + 1} von {FRAGEN.length} · {frage.label}
              </p>
              <h2 className="kinetic-display mt-4 text-balance text-2xl leading-snug text-foreground sm:text-3xl">
                {frage.text}
              </h2>
              <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-muted-foreground">
                {frage.note}
              </p>
            </div>

            <div
              ref={groupRef}
              role="group"
              aria-label="Antwort auswählen"
              onKeyDown={onKeyDown}
              className="grid sm:grid-cols-3"
            >
              {ANTWORT_OPTIONEN.map((option, i) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onAntwort(option.value)}
                  className={[
                    "group flex min-h-[5.5rem] flex-col justify-center gap-1 px-6 py-5 text-left transition-colors",
                    "hover:bg-primary hover:text-primary-foreground",
                    "focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary",
                    i > 0 ? "border-t border-border sm:border-l sm:border-t-0" : "",
                  ].join(" ")}
                >
                  <span className="text-base font-medium">{option.label}</span>
                  <span className="text-xs font-light text-muted-foreground group-hover:text-primary-foreground/75">
                    {option.hint}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-between gap-6">
          <button
            type="button"
            onClick={onZurueck}
            disabled={index === 0}
            className="-mx-2 inline-flex min-h-[2.75rem] items-center gap-2 px-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Zurück
          </button>
          <p className="text-xs text-muted-foreground">
            Mit der letzten Antwort gehen Ihre Angaben anonym an uns.
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Der Fortschritt zeigt pro Frage, wie sie beantwortet wurde — die Leiste ist
 * damit Navigation und Zwischenstand in einem, nicht nur Dekoration.
 */
function Fortschritt({
  index,
  antworten,
}: {
  index: number;
  antworten: Record<number, Antwort>;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm font-medium text-foreground">EU-AI-Act-Selbstcheck</p>
        <p className="kinetic-data text-xs text-muted-foreground">
          {index + 1} / {FRAGEN.length}
        </p>
      </div>
      <div className="mt-3 flex gap-1" aria-hidden="true">
        {FRAGEN.map((frage, i) => {
          const antwort = antworten[i];
          const background = antwort ? ANTWORT_FARBE[antwort] : undefined;
          return (
            <span
              key={frage.label}
              className={[
                "h-1 flex-1 transition-colors",
                antwort ? "" : i === index ? "bg-primary/50" : "bg-border",
              ].join(" ")}
              style={background ? { backgroundColor: background } : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}


/* -------------------------------------------------------------- Abschluss */

function Abschluss({
  versand,
  fehler,
  onErneut,
  onNeustart,
}: {
  versand: Versand;
  fehler: string | null;
  onErneut: () => void;
  onNeustart: () => void;
}) {
  /* Nach der letzten Antwort verschwindet der fokussierte Knopf; ohne das
     hier fiele der Fokus auf <body>, und ein Screenreader erführe nicht, ob
     der Versand läuft, geklappt hat oder gescheitert ist. Die Überschrift
     jedes Zustands bekommt ihn, sobald der Zustand wechselt. */
  const ueberschrift = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ueberschrift.current?.focus({ preventScroll: true });
  }, [versand]);

  const h1 =
    "kinetic-display mt-3 max-w-2xl text-balance text-3xl leading-tight text-foreground focus:outline-none sm:text-4xl";

  if (versand === "laeuft") {
    return (
      <section className={`${SITE_CONTAINER} w-full py-14 sm:py-20`}>
        <div className="mx-auto max-w-3xl" role="status">
          <p className="text-sm text-muted-foreground">Einen Moment</p>
          <h1 ref={ueberschrift} tabIndex={-1} className={h1}>
            Ihre Antworten werden übermittelt.
          </h1>
        </div>
      </section>
    );
  }

  if (versand === "fehler") {
    return (
      <section className={`${SITE_CONTAINER} w-full py-14 sm:py-20`}>
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-muted-foreground">Nicht übermittelt</p>
          <h1 ref={ueberschrift} tabIndex={-1} className={h1}>
            Ihre Antworten sind noch nicht bei uns.
          </h1>
          <p
            role="alert"
            className="mt-6 max-w-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {fehler ?? "Die Übermittlung hat nicht geklappt."}
          </p>
          <button
            type="button"
            onClick={onErneut}
            className="mt-8 inline-flex min-h-[3.5rem] w-full items-center justify-between gap-6 bg-primary px-6 py-4 text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
          >
            <span className="text-base font-medium">Noch einmal senden</span>
            <RotateCw className="h-4 w-4 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={`${SITE_CONTAINER} w-full py-14 sm:py-20`}>
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-muted-foreground" role="status">
          Eingegangen
        </p>
        {/* Überschrift wörtlich nach Ansage vom 18.09.2026. */}
        <h1 ref={ueberschrift} tabIndex={-1} className={h1}>
          Danke – die Ergebnisse liegen unserem Berater Jörg vor.
        </h1>

        {BERATER?.photo && (
          <div className="mt-8 flex items-center gap-4">
            {/* Fester, quadratischer Rahmen wie in `Gruenderwort`: die
                Portraits sind unterschiedlich geschnitten. */}
            <div className="h-20 w-20 shrink-0 overflow-hidden border border-border bg-surface sm:h-24 sm:w-24">
              <img
                src={BERATER.photo}
                alt={`${BERATER.name}, ${BERATER.role}`}
                width={96}
                height={96}
                className="h-full w-full object-cover object-top"
              />
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold leading-tight text-foreground">{BERATER.name}</p>
              <p className="mt-1 text-sm leading-tight text-muted-foreground">{BERATER.role}</p>
            </div>
          </div>
        )}

        {/* Keine Rückmeldung versprechen: Ohne Adresse kann sich niemand melden,
            und wer auf eine Mail wartet, die nicht kommt, ist verloren. */}
        <p className="mt-8 max-w-2xl text-base font-light leading-relaxed text-foreground/85">
          Eine Auswertung auf dem Bildschirm gibt es nicht, und ohne Kontaktdaten kann er sich nicht
          bei Ihnen melden. Wenn Sie wissen wollen, wo Ihr Unternehmen steht, gehen wir die acht
          Punkte in einem Termin mit Ihnen durch.
        </p>

        <Link
          href="/lass-uns-reden"
          onClick={() => trackEvent("Calendly_Klick", { position: "selbstcheck-gesendet" })}
          className="group mt-10 inline-flex w-full items-center justify-between gap-6 bg-primary px-6 py-5 text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
        >
          <span className="text-left">
            <span className="block text-base font-medium sm:text-lg">Auswertung besprechen</span>
            <span className="mt-1 block text-xs font-light text-primary-foreground/70 sm:text-sm">
              Kostenloser 1:1-KI-Check, 30 Minuten, ohne Verpflichtung
            </span>
          </span>
          <ArrowRight
            className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>

        <div className="mt-12 border-t border-border pt-6">
          <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
            Der Check ist eine Orientierung auf Basis Ihrer Angaben und keine Aussage über die
            Rechtskonformität Ihres Unternehmens im Einzelfall. Für rechtliche Würdigungen wenden
            Sie sich an eine Rechtsanwältin oder einen Rechtsanwalt.
          </p>
          <button
            type="button"
            onClick={onNeustart}
            className="mt-4 text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Check erneut starten
          </button>
        </div>
      </div>
    </section>
  );
}
