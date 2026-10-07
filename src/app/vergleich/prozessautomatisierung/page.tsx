import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/metadata";
import { autorNachSlug } from "@/lib/wissen/laden";
import { empfehlungenNachThemen } from "@/lib/wissen/empfehlungen";
import {
  AUTOR_SLUG,
  STAND,
  VEROEFFENTLICHT,
  VERGLEICH_PFAD,
  WEITERLESEN_THEMEN,
} from "@/data/vergleich-prozessautomatisierung";
import VergleichProzessautomatisierung from "@/views/VergleichProzessautomatisierung";

/*
 * Titel nach der Suchanfrage, für die Google die Domain schon zeigt, ohne eine
 * passende Seite zu haben: „prozesse automatisieren software vergleich"
 * (Search Console, 90 Tage bis 06.10.2026, Position 20). Die Ziffer statt
 * „sechs" spart Zeichen und ist im Suchergebnis schneller gelesen.
 */
export const metadata: Metadata = buildMetadata({
  title: "Prozessautomatisierung: 6 Software-Plattformen im Vergleich",
  description:
    "Power Automate, n8n, Make, Zapier, UiPath und Camunda im Vergleich: Betrieb, Datenstandort, Abrechnung und für wen welche Plattform passt.",
  path: VERGLEICH_PFAD,
  ogType: "article",
  publishedTime: VEROEFFENTLICHT,
  modifiedTime: STAND,
  authors: [autorNachSlug(AUTOR_SLUG)?.name ?? "Ayham Alkhalil"],
});

export default function Page() {
  /* Der Loader bricht den Build ab, wenn `autoren.json` kaputt ist; fehlt nur
     dieser eine Autor, steht hier eine 404 statt einer Seite ohne Byline. */
  const autor = autorNachSlug(AUTOR_SLUG);
  if (!autor) notFound();

  /* Im Server-Wrapper geladen: Der Loader liest Dateien, und
     `WeiterlesenBlock` ist eine Client Component. */
  const weiterlesen = empfehlungenNachThemen(WEITERLESEN_THEMEN);

  return <VergleichProzessautomatisierung autor={autor} weiterlesen={weiterlesen} />;
}
