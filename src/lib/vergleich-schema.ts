import { BASE_URL, DEFAULT_OG_IMAGE } from "@/lib/metadata";
import { company } from "@/config/company";
import { ORGANISATION_ID, getBreadcrumbSchema } from "@/components/seo/StructuredData";
import { autorId, autorUrl } from "@/lib/wissen/schema-org";
import type { Autor } from "@/lib/wissen/schema";
import {
  STAND,
  VEROEFFENTLICHT,
  VERGLEICH_PFAD,
  VERGLEICH_TITEL_KURZ,
  plattformen,
  teaser,
  ueberschrift,
} from "@/data/vergleich-prozessautomatisierung";

/**
 * JSON-LD für `/vergleich/prozessautomatisierung`: ein `Article` und die
 * Brotkrume. Mehr nicht, und das ist abgewogen:
 *
 * **Kein `FAQPage`.** Google hat das Rich Result zum 07.05.2026 abgeschaltet
 * (siehe `lib/wissen/schema-org.ts`). Die Fragen stehen sichtbar im HTML; dort
 * liest sie jedes System, das die Seite abruft.
 *
 * **Kein `SoftwareApplication` und kein `Product` für die sechs Plattformen.**
 * Beide Typen löst Google als Rich Result aus und verlangt dafür `offers`,
 * `review` oder `aggregateRating`. Preise nennt die Seite bewusst nicht, und
 * Bewertungen gibt es keine — erfundene wären nach Anhang zu § 3 Abs. 3
 * Nr. 23c UWG abmahnbar. Ohne die Felder stünde jede Plattform als
 * „ungültiges Element" im Search-Console-Bericht. Die Plattformen stehen
 * deshalb als `mentions` mit Namen, Adresse und Wikidata-Kennung im Graph:
 * Das reicht, um sie eindeutig zuzuordnen, und behauptet nichts, was die
 * Seite nicht zeigt.
 *
 * **Kein `ItemList`.** Listen-Rich-Results gibt es nur für Rezepte, Kurse,
 * Filme und Restaurants; die Reihenfolge der Plattformen ist hier zudem
 * alphabetisch und keine Rangfolge.
 *
 * Organisation und Autor werden per `@id` angebunden, nicht als zweiter Knoten
 * ausgeschrieben — der Organisations-Knoten steht in `PageShell`, die Person
 * auf `/autoren/<slug>`. `npm run pruefe:jsonld` zählt anonyme Dubletten.
 */

interface SchemaBase {
  "@context": "https://schema.org";
  "@type": string;
  [key: string]: unknown;
}

export const VERGLEICH_URL = `${BASE_URL}${VERGLEICH_PFAD}`;

export function vergleichArtikelSchema(autor: Autor): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: ueberschrift,
    description: teaser,
    image: [DEFAULT_OG_IMAGE],
    datePublished: VEROEFFENTLICHT,
    dateModified: STAND,
    inLanguage: "de-DE",
    mainEntityOfPage: { "@type": "WebPage", "@id": VERGLEICH_URL },
    author: {
      "@type": "Person",
      "@id": autorId(autor.slug),
      name: autor.name,
      url: autorUrl(autor.slug),
      ...(autor.linkedinUrl ? { sameAs: [autor.linkedinUrl] } : {}),
    },
    publisher: {
      "@type": "Organization",
      "@id": ORGANISATION_ID,
      name: company.shortName,
      url: BASE_URL,
    },
    about: { "@type": "Thing", name: "Prozessautomatisierung" },
    mentions: plattformen.map((plattform) => ({
      "@type": "Thing",
      name: plattform.vollerName,
      url: plattform.website,
      sameAs: plattform.wikidata,
    })),
  };
}

export function vergleichBreadcrumbSchema(): SchemaBase {
  return getBreadcrumbSchema([
    { name: "Startseite", url: `${BASE_URL}/` },
    { name: VERGLEICH_TITEL_KURZ, url: VERGLEICH_URL },
  ]);
}
