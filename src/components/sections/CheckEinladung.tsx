"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { angebot, verfuegbarkeitKurz } from "@/config/angebot";
import { checkEinladung } from "@/data/check-einladung";
import { trackEvent } from "@/lib/plausible";

/**
 * Der Schluss der Startseite: was in der halben Stunde passiert — und der Knopf.
 *
 * **Der einzige dunkle Block der Seite.** Kopfzeile (Navy) und Fußzeile (Blau)
 * rahmen eine durchgehend helle Seite; dazwischen wechseln nur Weiß und ein
 * Hauch Grau. Ein dunkler Abschnitt am Ende ist deshalb der stärkste Bruch, den
 * das bestehende Farbsystem hergibt — ohne eine neue Farbe einzuführen: es ist
 * derselbe Navy wie in der Kopfzeile (`bg-foreground`). Er sagt „hier ist
 * Schluss, jetzt entscheide dich" und braucht dafür keinen Ausrufezeichen-Ton.
 *
 * **Aufbau:** links die Aussage, rechts der Ablauf, darunter über die volle
 * Breite der Knopf. Zweispaltig deshalb, weil der Block sonst auf dem Desktop
 * unnötig hoch wird — die Seite ist gerade auf Ansage gekürzt worden. Auf dem
 * Handy stapelt es in Lesereihenfolge: Aussage, Ablauf, Knopf.
 *
 * **Der Knopf steht unter dem Ablauf, nicht daneben.** Er ist die Antwort auf
 * die drei Schritte; wer ihn darüber setzt, fragt, bevor er erklärt hat.
 *
 * Regeln, die hier sichtbar eingehalten sind: kein Label über der Überschrift,
 * keine Icon-Kacheln, scharfe Kanten (einzige Rundung ist die CTA-Pille), Knopf
 * mit `min-h` statt fester Höhe, Ziel intern `/lass-uns-reden`.
 */
export function CheckEinladung() {
  return (
    <section
      className="bg-foreground text-background"
      aria-labelledby="check-einladung"
    >
      <div className={`${SITE_CONTAINER} py-16 sm:py-20`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:gap-16">
          <div className="max-w-[560px]">
            <h2
              id="check-einladung"
              className="kinetic-display text-balance text-[30px] font-extrabold uppercase leading-[1.1] tracking-tight sm:text-[38px]"
            >
              {checkEinladung.ueberschrift}
            </h2>
          </div>

          {/*
            Der Ablauf als Liste mit Trennlinien statt drei Kacheln: der Blick
            läuft durch, und drei gleich große Kästen wären genau das
            Baukastenmuster, das auf dieser Website nicht gebaut wird.

            Die Nummer kommt aus dem Index — sie ist Reihenfolge, kein Inhalt,
            und hat in der Datendatei deshalb nichts zu suchen.
          */}
          <ol className="divide-y divide-white/12 border-y border-white/12">
            {checkEinladung.schritte.map((schritt, index) => (
              <li key={schritt.titel} className="flex gap-5 py-5">
                {/*
                  `/50` statt `/35` (20.08.2026): Bei 35 Prozent Deckkraft kam
                  die Ziffer auf dem dunkelblauen Grund auf 3,2 : 1 — gefordert
                  sind 4,5 : 1, und es war der einzige Kontrastfehler der
                  Startseite. Bei 50 Prozent sind es 5,2 : 1, ohne dass die
                  Nummer der Überschrift daneben die Aufmerksamkeit wegnimmt.
                */}
                <span
                  className="kinetic-data shrink-0 text-[15px] leading-tight text-white/50"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="text-fliess font-bold leading-tight">{schritt.titel}</p>
                  <p className="mt-1.5 text-pretty text-[14px] leading-[1.55] text-white/70">
                    {schritt.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Weiße Pille statt der blauen: auf Navy ist Dunkelblau auf Dunkelblau
            kaum zu sehen. Weiß ist hier der stärkste verfügbare Kontrast — und
            es ist derselbe Zweifarben-Trick wie in der Fußzeile, nur umgekehrt. */}
        <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-7">
          <Link
            href={angebot.href}
            onClick={() => trackEvent("Calendly_Klick", { position: "home-abschluss" })}
            className="inline-flex min-h-[60px] w-full max-w-[360px] shrink-0 items-center justify-between gap-4 rounded-full bg-background px-6 py-3 text-foreground transition-opacity hover:opacity-90 sm:px-7"
          >
            <span className="flex min-w-0 flex-col text-left">
              <span className="text-fliess font-bold leading-tight">{angebot.cta}</span>
              <span className="mt-1 text-mini font-normal leading-tight text-foreground/65">
                {verfuegbarkeitKurz()}
              </span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
          </Link>

          <p className="text-mini font-normal text-white/60">{checkEinladung.fussnote}</p>
        </div>
      </div>
    </section>
  );
}
