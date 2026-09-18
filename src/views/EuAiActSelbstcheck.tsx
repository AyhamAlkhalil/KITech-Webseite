"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowLeft, Send, Check, Minus, X } from "lucide-react";
import { CheckShell } from "@/components/layout/CheckShell";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { trackEvent } from "@/lib/plausible";
import { meldeEreignis } from "@/lib/ereignis";
import { ANTWORT_OPTIONEN, FRAGEN, type Antwort } from "@/data/selbstcheck";

/*
 * ⚠️ **Der Ausfüllende sieht seine Auswertung nicht** (Ansage 18.09.2026).
 * Sie entsteht als PDF auf dem Server und geht per Mail an das Postfach, das
 * sie bearbeitet — `src/app/api/selbstcheck/route.ts`.
 *
 * Bis dahin lief der Check vollständig im Browser: keine Übertragung, Ergebnis
 * sofort auf der Seite, optional ein `mailto:`-Entwurf. Davon ist hier nichts
 * mehr übrig, und das ist der Grund, warum an fünf Stellen Text geändert
 * wurde, der technisch nichts tut: „Die Antworten bleiben in Ihrem Browser",
 * „kein Datenversand", „die Auswertung sehen Sie sofort auf dieser Seite" —
 * jeder dieser Sätze wäre jetzt die Unwahrheit, und zwar auf der Seite, die
 * Sorgfalt im Umgang mit Regeln verkauft.
 *
 * ⚠️ Wer den Versand wieder herausnimmt, nimmt die Texte mit zurück. Was der
 * Besucher vor dem ersten Klick liest, muss beschreiben, was danach passiert.
 */

type Stufe = "intro" | "check" | "kontakt" | "gesendet";

const ANTWORT_ANZEIGE: Record<Antwort, { icon: typeof Check; color: string; label: string }> = {
  yes: { icon: Check, color: "hsl(var(--success))", label: "Erfüllt" },
  unsure: { icon: Minus, color: "hsl(var(--solo-accent))", label: "Unklar" },
  no: { icon: X, color: "hsl(var(--destructive))", label: "Offen" },
};

export default function EuAiActSelbstcheck() {
  const [stufe, setStufe] = useState<Stufe>("intro");
  const [antworten, setAntworten] = useState<Record<number, Antwort>>({});
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  function start() {
    setAntworten({});
    setIndex(0);
    setStufe("check");
    trackEvent("CTA_Klick", { position: "selbstcheck-start" });
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function antworte(wert: Antwort) {
    setAntworten((vorher) => ({ ...vorher, [index]: wert }));
    if (index + 1 < FRAGEN.length) {
      setIndex((vorher) => vorher + 1);
      return;
    }
    setStufe("kontakt");
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function gesendet() {
    setStufe("gesendet");
    trackEvent("Lead_Qualifier_abgeschlossen", { position: "selbstcheck" });
    /* Wer den Check zu Ende macht, beschäftigt sich ernsthaft mit dem Thema —
       das ist eine Sofortmeldung wert. Ohne Antworten, ohne Ergebniswert: die
       stehen im PDF, das gleichzeitig ins Postfach geht. */
    meldeEreignis("selbstcheck_fertig");
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
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
      note="Orientierung auf Basis Ihrer Angaben, keine Rechtsberatung. Die Auswertung schicken wir Ihnen persönlich."
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
        {stufe === "kontakt" && (
          <Kontakt
            antworten={antworten}
            onZurueck={() => {
              setStufe("check");
              setIndex(FRAGEN.length - 1);
            }}
            onGesendet={gesendet}
          />
        )}
        {stufe === "gesendet" && <Gesendet onNeustart={start} />}
      </>
    </CheckShell>
  );
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
              Acht Fragen. Die Auswertung kommt von uns.
            </h1>

            <p className="mt-8 max-w-xl text-balance text-base font-light leading-relaxed text-foreground/85">
              Der EU AI Act gilt. Die meisten Unternehmen erfüllen mehr davon, als sie denken — und
              können weniger davon belegen, als sie glauben. Dieser Check trennt beides.
            </p>
            {/* Steht bewusst vor dem Knopf: Wer nach acht Fragen erfährt, dass
                er sein Ergebnis nicht zu sehen bekommt, fühlt sich vorgeführt. */}
            <p className="mt-4 max-w-xl text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
              Zwei Minuten. Am Ende tragen Sie Ihre Kontaktdaten ein, Ihre Auswertung geht als PDF
              an unser Team — auf dem Bildschirm sehen Sie sie nicht. Wir gehen sie durch und melden
              uns bei Ihnen.
            </p>

            <button
              type="button"
              onClick={onStart}
              className="group mt-10 inline-flex w-full items-center justify-between gap-6 bg-primary px-6 py-5 text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto"
            >
              <span className="text-left">
                <span className="block text-base font-medium sm:text-lg">Check starten</span>
                <span className="mt-1 block text-xs font-light text-primary-foreground/70 sm:text-sm">
                  Acht Fragen, danach Ihre Kontaktdaten
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
            Übertragen wird nichts, bis Sie am Ende absenden.
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
          const background = antwort ? ANTWORT_ANZEIGE[antwort].color : undefined;
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

/* ---------------------------------------------------------------- Kontakt */

/**
 * Die letzte Stufe vor dem Versand. Sie zeigt, **was** übermittelt wird — die
 * acht Antworten in Klartext, ohne Punktzahl und ohne Einstufung.
 *
 * Das ist die Grenze, die diese Seite zieht: Der Ausfüllende darf sehen, was
 * er über sich preisgibt. Die Bewertung daraus bekommt er im Gespräch. Ohne
 * diese Liste wäre der Versand eine Blackbox, und eine Einwilligung in etwas,
 * das man nicht sieht, ist keine informierte Einwilligung.
 */
function Kontakt({
  antworten,
  onZurueck,
  onGesendet,
}: {
  antworten: Record<number, Antwort>;
  onZurueck: () => void;
  onGesendet: () => void;
}) {
  const [name, setName] = useState("");
  const [firma, setFirma] = useState("");
  const [email, setEmail] = useState("");
  const [einwilligung, setEinwilligung] = useState(false);
  /** Honigtopf — für Menschen unsichtbar, siehe Route. */
  const [webseite, setWebseite] = useState("");
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  const vollstaendig =
    name.trim().length >= 2 && firma.trim().length >= 2 && email.includes("@") && einwilligung;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!vollstaendig || laeuft) return;
    setLaeuft(true);
    setFehler(null);

    const params = new URLSearchParams(window.location.search);

    try {
      const antwort = await fetch("/api/selbstcheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          firma: firma.trim(),
          email: email.trim(),
          antworten: FRAGEN.map((_, i) => antworten[i] ?? "no"),
          einwilligung: true,
          webseite,
          referrer: document.referrer || null,
          utmSource: params.get("utm_source"),
          utmMedium: params.get("utm_medium"),
          utmCampaign: params.get("utm_campaign"),
        }),
      });

      if (!antwort.ok) {
        const rumpf = (await antwort.json().catch(() => null)) as { fehler?: string } | null;
        /* ⚠️ Hier wird nicht stillschweigend weitergeklickt. Der Ausfüllende
           sieht sein Ergebnis nicht — eine Bestätigung ohne Versand wäre eine
           Lüge, und seine Antworten wären verloren. */
        setFehler(rumpf?.fehler ?? "Die Übermittlung hat nicht geklappt.");
        setLaeuft(false);
        return;
      }

      trackEvent("Kontaktformular_gesendet", { position: "selbstcheck" });
      onGesendet();
    } catch {
      setFehler("Keine Verbindung. Bitte prüfen Sie Ihr Netz und versuchen es noch einmal.");
      setLaeuft(false);
    }
  }

  return (
    <section className={`${SITE_CONTAINER} w-full py-14 sm:py-20`}>
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-muted-foreground">Letzter Schritt</p>
        <h1 className="kinetic-display mt-3 max-w-2xl text-balance text-3xl leading-tight text-foreground sm:text-4xl">
          Wohin sollen wir die Auswertung schicken?
        </h1>
        <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-foreground/85">
          Ihre acht Antworten gehen als PDF an unser Team. Wir sehen sie uns an und melden uns mit
          dem, was bei Ihnen zuerst ansteht.
        </p>

        <form onSubmit={onSubmit} className="mt-10 border border-border bg-surface">
          <div className="grid gap-5 px-5 py-6 sm:px-6 sm:py-7">
            <Feld
              id="selbstcheck-name"
              label="Name"
              value={name}
              onChange={setName}
              autoComplete="name"
              placeholder="Vor- und Nachname"
            />
            <Feld
              id="selbstcheck-firma"
              label="Unternehmen"
              value={firma}
              onChange={setFirma}
              autoComplete="organization"
              placeholder="Firmenname"
            />
            <Feld
              id="selbstcheck-email"
              label="E-Mail"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              placeholder="name@ihrunternehmen.de"
            />

            {/* Honigtopf: aus dem Fluss genommen, für Screenreader versteckt. */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="selbstcheck-webseite">Webseite (bitte frei lassen)</label>
              <input
                id="selbstcheck-webseite"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={webseite}
                onChange={(event) => setWebseite(event.target.value)}
              />
            </div>

            <label className="flex items-start gap-3 text-xs font-light leading-relaxed text-muted-foreground">
              <input
                type="checkbox"
                checked={einwilligung}
                onChange={(event) => setEinwilligung(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                required
              />
              {/* Ohne Firmennamen, weil die Seite markenfrei laeuft — wer die
                  Angaben erhaelt und verantwortet, steht in der verlinkten
                  Erklaerung. */}
              <span>
                Ich bin einverstanden, dass meine Angaben und meine Antworten übermittelt,
                ausgewertet und für die Rückmeldung verwendet werden. Empfänger, Verantwortlicher
                und Widerruf stehen im{" "}
                <Link
                  href="/datenschutz"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  Datenschutz
                </Link>
                .
              </span>
            </label>

            {fehler && (
              <p
                role="alert"
                className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                {fehler}
              </p>
            )}

            <button
              type="submit"
              disabled={!vollstaendig || laeuft}
              className="group inline-flex min-h-[3.5rem] w-full items-center justify-between gap-6 bg-primary px-6 py-4 text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-border disabled:text-muted-foreground sm:w-auto"
            >
              <span className="text-base font-medium">
                {laeuft ? "Wird übermittelt …" : "Auswertung anfordern"}
              </span>
              <Send className="h-4 w-4 shrink-0" aria-hidden="true" />
            </button>
          </div>

          <div className="border-t border-border px-5 py-5 sm:px-6">
            <p className="text-sm font-medium text-foreground">Das wird übermittelt</p>
            <ul className="mt-3 divide-y divide-border border-y border-border">
              {FRAGEN.map((frage, i) => {
                const antwort = antworten[i] ?? "no";
                const anzeige = ANTWORT_ANZEIGE[antwort];
                const Icon = anzeige.icon;
                return (
                  <li key={frage.label} className="flex items-center gap-3 py-2.5">
                    <Icon
                      className="h-4 w-4 shrink-0"
                      style={{ color: anzeige.color }}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-light text-foreground/90">{frage.label}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{anzeige.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </form>

        <button
          type="button"
          onClick={onZurueck}
          className="-mx-2 mt-6 inline-flex min-h-[2.75rem] items-center gap-2 px-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Antworten ändern
        </button>
      </div>
    </section>
  );
}

function Feld({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (wert: string) => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />
    </div>
  );
}

/* --------------------------------------------------------------- Gesendet */

function Gesendet({ onNeustart }: { onNeustart: () => void }) {
  return (
    <section className={`${SITE_CONTAINER} w-full py-14 sm:py-20`}>
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-muted-foreground">Eingegangen</p>
        <h1 className="kinetic-display mt-3 max-w-2xl text-balance text-3xl leading-tight text-foreground sm:text-4xl">
          Ihre Antworten sind bei uns.
        </h1>
        <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-foreground/85">
          Wir gehen die acht Punkte durch und melden uns per E-Mail mit der Auswertung und dem, was
          bei Ihnen zuerst ansteht. In der Regel noch am selben Werktag.
        </p>

        <Link
          href="/lass-uns-reden"
          onClick={() => trackEvent("Calendly_Klick", { position: "selbstcheck-gesendet" })}
          className="group mt-10 inline-flex w-full items-center justify-between gap-6 bg-primary px-6 py-5 text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
        >
          <span className="text-left">
            <span className="block text-base font-medium sm:text-lg">Lieber gleich sprechen</span>
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
            Die Auswertung ist eine Orientierung auf Basis Ihrer Angaben und keine Aussage über die
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
