import Link from "next/link";
import { ArrowRight, Linkedin, UserRound } from "lucide-react";
import { SITE_CONTAINER } from "@/components/layout/site-container";
import { company } from "@/config/company";
import { gruenderwort } from "@/data/gruenderwort";
import { teamRoster, type TeamMember } from "@/data/team";

/**
 * Der Abschnitt unter dem Kundenlaufband: das Gründerwort, daneben das Team.
 *
 * **Am 17.08.2026 umgebaut, auf Ansage:** „Ich fand, wie du das Team darstellst,
 * zu groß und zu hässlich. Mach das seitlich." Vorher standen hier die großen
 * `TeamTile`-Kacheln aus der Teamsektion — 260 px hohe Bildfelder, die dem
 * Gründerwort die Aufmerksamkeit nahmen und auf dem Handy eine halbe Seite
 * füllten. Jetzt trägt der Text die Breite, und das Team steht rechts daneben
 * als schmale Liste: 56 px Portrait, Name, Rolle. Die großen Kacheln gibt es
 * unverändert weiter in `TeamSection` für eine eigene Teamseite.
 *
 * Unter der Liste steht die Einladung, sich zu bewerben (ebenfalls Ansage) —
 * sie führt auf `/karriere`.
 *
 * Kein Label über der Überschrift, keine Icon-Kacheln, kein zweiter CTA auf den
 * Termin: der Aufruf steht im Hero und im Popup, hier steht der Grund dafür.
 *
 * ⚠️ Name, Rolle und LinkedIn kommen aus `config/company.ts`, **nicht** aus
 * `founderInfo` in `FounderPortrait.tsx`. Diese Datei ist eine Server
 * Component, `FounderPortrait` trägt `"use client"` — über die Grenze kommt
 * für einen Nicht-Komponenten-Export ein Modulproxy statt eines Werts. Das
 * lief unbemerkt live: Im ausgelieferten HTML stand unter dem Zitat
 * „ — , KITech Software", und der LinkedIn-Anker hatte kein `href`. Kein
 * Fehler beim Bauen, kein Test, der es sah — nur eine Zuschreibung, die fehlt.
 * `Haltung.tsx` darf `founderInfo` weiter benutzen: die Datei ist selbst
 * `"use client"`.
 */

/**
 * Die Personen in der Reihenfolge aus `gruenderwort.ts`. Ein Name ohne Eintrag
 * in `team.ts` fällt still weg, statt eine leere Zeile zu erzeugen.
 */
const team = gruenderwort.teamNamen
  .map((name) => teamRoster.find((person) => person.name === name))
  .filter((person): person is TeamMember => Boolean(person));

/** Eine Zeile der Seitenliste: Portrait, Name, Rolle. */
function TeamZeile({ member }: { member: TeamMember }) {
  return (
    <li className="flex items-center gap-3.5 py-3">
      {/*
        Feste 56 px, quadratisch und beschnitten (`object-cover object-top`):
        die Portraits sind unterschiedlich hoch — freigestellt, mit Studiogrund,
        hoch- und querformatig. Ohne festen Rahmen säße jeder Name auf einer
        anderen Linie.
      */}
      <div className="h-14 w-14 shrink-0 overflow-hidden border border-border bg-background">
        {member.photo ? (
          <img
            src={member.photo}
            alt={`${member.name}, ${member.role}`}
            className="h-full w-full object-cover object-top"
            loading="lazy"
          />
        ) : (
          /* Silhouette in niedrigem Kontrast, solange kein Foto vorliegt —
             dasselbe Muster wie in `TeamSection`. Kein „Foto folgt"-Text. */
          <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
            <UserRound className="h-7 w-7 text-muted-foreground/35" strokeWidth={1.25} />
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-[14px] font-semibold leading-tight text-foreground">{member.name}</p>
        <p className="mt-0.5 text-[12px] leading-tight text-muted-foreground">{member.role}</p>
      </div>
    </li>
  );
}

export function Gruenderwort() {
  return (
    <section className="bg-surface">
      <div className={`${SITE_CONTAINER} py-16 sm:py-20`} aria-labelledby="gruenderwort">
        <h2 id="gruenderwort" className="sr-only">
          {gruenderwort.ueberschrift}
        </h2>

        {/* Zwei Spalten ab `lg`: links der Text in lesbarer Breite, rechts die
            schmale Teamspalte. Darunter stapelt es sich in derselben Reihenfolge. */}
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)] lg:gap-16">
          <div className="max-w-[720px]">
            <blockquote className="text-balance text-h3 leading-[1.25] text-foreground sm:text-[32px]">
              „{gruenderwort.zitat}“
            </blockquote>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="text-[13px] leading-tight text-muted-foreground">
                <span className="font-semibold text-foreground">{company.founder.name}</span>
                {" — "}
                {company.founder.role}, {company.shortName}
              </p>

              <a
                href={company.founder.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] text-primary transition-opacity hover:opacity-80"
              >
                <Linkedin className="h-3.5 w-3.5" aria-hidden="true" />
                LinkedIn
                <span className="sr-only">-Profil von {company.founder.name} (öffnet in neuem Tab)</span>
              </a>
            </div>

            {gruenderwort.absaetze.map((absatz) => (
              <p key={absatz.slice(0, 40)} className="mt-6 text-pretty text-lead text-foreground">
                {absatz}
              </p>
            ))}

            <p className="mt-6 text-pretty text-lead font-semibold text-foreground">
              {gruenderwort.abschluss}
            </p>
          </div>

          {team.length > 0 && (
            <div className="lg:pt-1">
              <h3 className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                {gruenderwort.teamUeberschrift}
              </h3>

              <ul className="mt-3 divide-y divide-border border-y border-border">
                {team.map((person) => (
                  <TeamZeile key={person.name} member={person} />
                ))}
              </ul>

              {/*
                Einladung statt Stellenanzeige (Ansage 17.08.2026). Bewusst als
                Textlink mit Pfeil und nicht als gefüllter Knopf: der einzige
                gefüllte Knopf auf dieser Seite gehört dem Termin. Ziel ist
                `/karriere` — dort stehen die Stellen und der Bewerbungsweg.
              */}
              <Link
                href="/karriere"
                className="group mt-5 inline-flex items-center gap-2 text-[14px] font-semibold text-foreground transition-colors hover:text-primary"
              >
                {gruenderwort.teamEinladung}
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
