"use client";

import { useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { angebot, konditionen } from "@/config/angebot";
import { company } from "@/config/company";
import { StructuredData, getWebPageSchema } from "@/components/seo/StructuredData";
import { ArrowRight, CalendarClock, Check, Loader2, Mail, MessageCircle, Phone } from "lucide-react";
import { trackEvent } from "@/lib/plausible";
import { meldeEreignis, type Ereignis } from "@/lib/ereignis";
import { hasAnalyticsConsent } from "@/lib/consent";

/**
 * Terminseite — die einzige Seite, auf der etwas passieren soll.
 *
 * **Neu gebaut am 12.08.2026 auf Ansage** ("die ist katastrophal … einfach
 * richtig fett und deutlich Termin zusagen und fertig"). Vorher stand hier ein
 * kompletter Mini-Funnel neben dem Kalender: Portrait mit Zitat, drei
 * Kundenstimmen, eine Liste "Das läuft bei vielen falsch", eine Liste "Warum Sie
 * mit mir reden sollten". Wer schon auf dieser Seite ist, hat sich entschieden —
 * jedes weitere Argument ist dort nur noch eine Ablenkung vom Kalender.
 *
 * Was dabei ebenfalls verschwunden ist, und das ist der wichtigere Teil: die
 * Zeile **"Festpreis. Erreichen wir das Ziel nicht, zahlen Sie nicht."** Das ist
 * ein bindendes Zahlungsversprechen. Es war beim Relaunch aus `principles.ts`,
 * `services.ts` und `segments.ts` bewusst herausgenommen worden, weil es
 * ausdrücklich freigegeben gehört — auf dieser Seite stand es noch. Wer es
 * zurückholt, holt es überall zurück oder nirgends.
 *
 * Das Portrait ist ebenfalls raus (Ansage). Es stand direkt unter der
 * Überschrift und schob den Kalender auf dem Handy weit nach unten.
 *
 * Aufbau jetzt: Angebot, Kalender, drei Direktwege. Sonst nichts.
 */

const ABLAUF = [
  "Wir gehen durch, was bei dir schon läuft: Werkzeuge, Automatisierungen, KI-Einsatz.",
  "Wir schauen, an welchen Stellen Aufwand entsteht, der sich abstellen lässt.",
  "Du bekommst eine Einschätzung, was sich zuerst lohnt — und was nicht.",
];

const CALENDLY_URL = "https://calendly.com/kitech-software/roi-analyse";
const CALENDLY_SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";

/** wa.me erwartet die Nummer ohne Pluszeichen, Leerzeichen und Klammern. */
const WHATSAPP_URL = `https://wa.me/${company.mobile.href.replace(/\D/g, "")}`;

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: { url: string; parentElement: HTMLElement }) => void;
    };
  }
}

function loadCalendlyScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Calendly) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${CALENDLY_SCRIPT_SRC}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Calendly-Skript konnte nicht geladen werden."))
      );
      return;
    }
    const script = document.createElement("script");
    script.src = CALENDLY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Calendly-Skript konnte nicht geladen werden."));
    document.body.appendChild(script);
  });
}

/**
 * Ein Direktweg — Anrufen, WhatsApp, E-Mail. Große Fläche, großes Zeichen:
 * Wer nicht durch einen Kalender will, soll den Weg daran nicht suchen müssen.
 */
function Direktweg({
  href,
  icon: Icon,
  label,
  wert,
  event,
  meldung,
  extern,
}: {
  href: string;
  icon: typeof Phone;
  label: string;
  wert: string;
  event: "Telefon_Klick" | "Email_Klick" | "CTA_Klick";
  /** Zusätzlich zur Statistik eine Sofortmeldung — siehe `src/lib/ereignis.ts`. */
  meldung?: Ereignis;
  extern?: boolean;
}) {
  return (
    <a
      href={href}
      {...(extern ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={() => {
        trackEvent(event, { position: "lass-uns-reden-direkt" });
        if (meldung) meldeEreignis(meldung);
      }}
      className="group flex items-center gap-4 border border-border bg-background p-5 transition-colors hover:border-primary sm:p-6"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-primary text-primary-foreground transition-transform group-hover:scale-105">
        <Icon className="h-6 w-6" strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-mini font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        {/* `break-all` statt `truncate`: eine abgeschnittene Adresse
            ("info@kitech-softw…") ist als Kontaktweg wertlos. Lieber
            umbrechen. */}
        <span className="mt-0.5 block break-all text-[15px] font-bold leading-tight text-foreground sm:text-[16px]">
          {wert}
        </span>
      </span>
    </a>
  );
}

export default function LassUnsReden() {
  // Bewusst mit `false` starten und den Consent erst nach dem Mount lesen: der
  // Server kennt den localStorage nicht, ein direkt aus `hasAnalyticsConsent()`
  // initialisierter State würde beim Hydrieren von der Server-Ausgabe abweichen
  // (React-Fehler #418).
  const [widgetEnabled, setWidgetEnabled] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const [widgetError, setWidgetError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWidgetEnabled(hasAnalyticsConsent());
  }, []);

  /* Wer diese Seite öffnet, hat den Knopf schon gedrückt — das ist der Moment,
     der eine Nachricht wert ist, unabhängig davon, ob danach gebucht wird. */
  useEffect(() => {
    meldeEreignis("termin_geoeffnet");
  }, []);

  useEffect(() => {
    if (!widgetEnabled || !containerRef.current) return;
    let cancelled = false;
    loadCalendlyScript()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        window.Calendly?.initInlineWidget({
          url: CALENDLY_URL,
          parentElement: containerRef.current,
        });
        if (!cancelled) setWidgetReady(true);
      })
      .catch(() => {
        if (!cancelled) setWidgetError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [widgetEnabled]);

  return (
    <PageShell backdropClassName="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-surface-strong to-background">
      <StructuredData
        data={getWebPageSchema(
          angebot.name,
          angebot.beschreibung,
          "https://kitech-software.de/lass-uns-reden"
        )}
      />

      {/* === Kopf: eine Aussage, die Konditionen === */}
      <section className={`${SITE_CONTAINER} pb-10 pt-12 text-center sm:pt-16`}>
        {/*
          In der Pille stand bis zum 11.09.2026 die Platzangabe ("Jeden
          Donnerstag 5 Plätze — diese Woche noch 2 Plätze frei"). Sie ist auf
          Ansage von der ganzen Website raus; jetzt trägt die Pille, was
          nachprüfbar ist. Begruendung in `config/angebot.ts`.
        */}
        <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-mini font-bold uppercase tracking-wide text-primary-foreground">
          {konditionen()}
        </span>

        <h1 className="kinetic-morph-in mx-auto mt-6 max-w-[720px] text-balance text-[38px] font-extrabold uppercase leading-[1.08] tracking-tight text-foreground sm:text-[50px] sm:leading-[57.5px]">
          {angebot.name}
        </h1>

        <p className="mx-auto mt-5 max-w-[620px] text-pretty text-[18px] font-normal leading-[27px] text-foreground dt:text-subline">
          {angebot.beschreibung}
        </p>

        <p className="mt-4 text-fliess font-semibold text-muted-foreground">
          Kostenlos · {angebot.dauer} · ohne Verpflichtung
        </p>
      </section>

      {/* === Kalender: das Hauptelement, volle Breite, mittig === */}
      <section className={`${SITE_CONTAINER} pb-4`}>
        <div className="mx-auto max-w-[900px] overflow-hidden border border-border bg-surface">
          {widgetError ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 p-10 text-center">
              <p className="text-fliess text-muted-foreground">
                Der Kalender lädt gerade nicht. Nimm{" "}
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary underline underline-offset-4"
                >
                  Calendly direkt
                </a>{" "}
                — oder einen der Wege darunter.
              </p>
            </div>
          ) : widgetEnabled ? (
            <div className="relative" style={{ minWidth: 320, height: 720 }}>
              {!widgetReady && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface"
                  role="status"
                  aria-live="polite"
                >
                  <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
                  <span className="text-fliess text-muted-foreground">Kalender wird geladen …</span>
                </div>
              )}
              <div ref={containerRef} className="h-full w-full" />
            </div>
          ) : (
            /* Klick-Gate: Calendly setzt echte Third-Party-Cookies und wird
               deshalb wie Plausible behandelt, nicht als technisch notwendig. */
            <div className="flex min-h-[360px] flex-col items-center justify-center gap-5 p-8 text-center sm:p-12">
              <CalendarClock className="h-10 w-10 text-primary" aria-hidden="true" />
              <p className="max-w-sm text-fliess leading-[1.6] text-muted-foreground">
                Der Kalender läuft über Calendly. Mit einem Klick lädst du ihn — dabei werden
                Daten an den Dienst übertragen.
              </p>
              <button
                type="button"
                onClick={() => {
                  trackEvent("Calendly_Klick", { position: "lass-uns-reden-embed" });
                  setWidgetEnabled(true);
                }}
                className="inline-flex h-[60px] w-full max-w-[420px] items-center justify-center gap-3 rounded-[50px] bg-primary px-6 text-[18px] font-bold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Termin aussuchen
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* === Direktwege: für alle, die nicht durch einen Kalender wollen === */}
      <section className={`${SITE_CONTAINER} py-12 sm:py-16`}>
        <div className="mx-auto max-w-[900px]">
          <h2 className="text-center text-[24px] font-extrabold uppercase leading-tight tracking-tight text-foreground sm:text-[30px]">
            Lieber direkt?
          </h2>
          <p className="mt-3 text-center text-fliess text-muted-foreground">
            Ruf an oder schreib — {company.availability} geht jemand ran.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Direktweg
              href={company.mobile.href}
              icon={Phone}
              label="Anrufen"
              wert={company.mobile.display}
              event="Telefon_Klick"
              meldung="telefon_geklickt"
            />
            <Direktweg
              href={WHATSAPP_URL}
              icon={MessageCircle}
              label="WhatsApp"
              wert={company.mobile.display}
              event="CTA_Klick"
              extern
            />
            <Direktweg
              href={`mailto:${company.email.general}?subject=${encodeURIComponent(angebot.name)}`}
              icon={Mail}
              label="E-Mail"
              wert={company.email.general}
              event="Email_Klick"
              meldung="email_geklickt"
            />
          </div>

          {/* Was in der Stunde passiert — klein, unter dem Knopf, als Absicherung
              gegen die Frage "worauf lasse ich mich da ein". Nicht darüber: es
              soll den Kalender nicht nach unten schieben. */}
          <ul className="mx-auto mt-12 max-w-[620px] space-y-3 border-t border-border pt-8">
            {ABLAUF.map((punkt) => (
              <li key={punkt} className="flex gap-3 text-fliess leading-[1.6] text-muted-foreground">
                <Check className="mt-[3px] h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {punkt}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
