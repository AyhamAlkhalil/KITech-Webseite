import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE_CONTAINER } from "@/components/layout/site-container";

/**
 * Die Weiche auf der Startseite: Selbstständige, Unternehmen, Leistungen.
 *
 * **Wozu.** Am 27.08.2026 wurde gemessen, dass aus dem *Inhalt* der Startseite
 * kein einziger Link auf `/solo`, `/enterprise`, `/leistungen` oder `/kontakt`
 * führte — sie standen nur in Kopf- und Fußzeile. Das ist Boilerplate; Google
 * wertet es deutlich schwächer als einen Verweis im Text, und die Startseite
 * trägt die meiste Autorität der Domain.
 *
 * Dasselbe Argument, mit dem am 24.08.2026 der `WeiterlesenBlock` entstand.
 *
 * **Es ist nicht nur SEO.** Die Seite bedient zwei Zielgruppen (`data/segments.ts`,
 * eine Vorlage, zwei Ausprägungen) und bot dafür bis hierher keine Weiche. Wer
 * allein arbeitet und wer eine gewachsene IT hat, braucht verschiedene Seiten —
 * die Startseite kann beide nicht gleichzeitig sein.
 *
 * **Hausstil:** Aussage als Überschrift, ein Halbsatz darunter, Trennlinien
 * statt Kacheln, keine `rounded-*`, kein Icon im abgerundeten Quadrat. Die
 * Nachsätze sind die Beschreibungen der Zielseiten, nicht neu erfunden — was
 * hier steht, muss dort auch stehen.
 *
 * ⚠️ **Am 11.09.2026 halbiert** (Ansage: „So viel Text. Das muss alles viel
 * kürzer und knackiger werden."). Aus je einem vollen Satz ist je ein Halbsatz
 * geworden. Was bewusst **nicht** gefallen ist: die Microsoft-Produktnamen im
 * mittleren Weg. Dieser Block ist eine der sechs Stellen, an denen der
 * Enterprise-Stack zeichengenau steht (Projektleitfaden) — wer ihn hier
 * herausstreicht, nimmt die Positionierung von der Startseite, nicht nur Text.
 *
 * ⚠️ Das gilt auch für die Produktnamen. Seit dem 04.09.2026 nennen zwei der
 * drei Wege den Microsoft-Stack; er steht deshalb genauso in
 * `segments.ts` (enterprise) und `services.ts`. Wer ihn hier ändert, ohne dort
 * nachzuziehen, baut ein Versprechen, das die Zielseite nicht einlöst — der
 * Besucher klickt genau deswegen.
 */

const WEGE = [
  {
    href: "/solo",
    label: "Du arbeitest allein oder im kleinen Team",
    text: "Bis sechs Leute, gebaut an deinen echten Fällen.",
  },
  {
    href: "/enterprise",
    label: "Ihr habt gewachsene Prozesse und Compliance",
    text: "Power Automate, Power BI, Dynamics 365.",
  },
  {
    href: "/leistungen",
    label: "Du willst wissen, was wir überhaupt machen",
    text: "Vom Prozess-Audit bis zu Betrieb und Wartung.",
  },
] as const;

export function WegeBlock() {
  return (
    <section className={`${SITE_CONTAINER} pb-16 sm:pb-20`} aria-labelledby="wege">
      <div className="border-t border-border pt-12 sm:pt-14">
        <h2
          id="wege"
          className="kinetic-display text-balance text-[24px] leading-[1.2] text-foreground sm:text-[28px]"
        >
          Der nächste Schritt ist ein anderer, je nachdem wer fragt.
        </h2>

        <ul className="mt-8 divide-y divide-border border-y border-border">
          {WEGE.map((weg) => (
            <li key={weg.href}>
              <Link
                href={weg.href}
                className="group flex items-start justify-between gap-6 py-6 transition-colors hover:bg-foreground/[0.03]"
              >
                {/* `min-w-0` ist Pflicht: ohne drückt der Text bei 768 px den
                    Pfeil aus dem Bild, statt selbst umzubrechen. */}
                <div className="min-w-0">
                  <p className="text-fliess font-bold leading-snug text-foreground">{weg.label}</p>
                  <p className="mt-1 text-pretty text-mini leading-[1.6] text-muted-foreground">
                    {weg.text}
                  </p>
                </div>
                <ArrowRight
                  className="mt-1 h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
