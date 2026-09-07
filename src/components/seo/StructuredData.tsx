import { company } from "@/config/company";

// Typisierte Schema.org Interfaces
interface SchemaBase {
  "@context": "https://schema.org";
  "@type": string;
  [key: string]: unknown;
}

interface StructuredDataProps {
  data: SchemaBase | SchemaBase[];
}

/**
 * Rendert JSON-LD direkt ins Markup, statt es wie früher per useEffect in den
 * <head> zu injizieren. Damit steht das Schema schon im vom Server gelieferten
 * HTML — genau der Punkt, wegen dem wir von der SPA weg sind: Crawler sehen es
 * sofort, ohne auf JavaScript zu warten.
 *
 * `</` wird escaped, damit ein String in den Daten das Script-Tag nicht vorzeitig
 * schließen kann.
 */
export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

// === Vorgefertigte Schema-Factories ===

/**
 * Die stabile Kennung des Unternehmens im Datengraph.
 *
 * **Warum es sie geben muss:** Jede Artikel- und Autorenseite setzt `publisher`
 * bzw. `worksFor` auf genau diese `@id` (siehe `src/lib/wissen/schema-org.ts`).
 * Bis zum 20.08.2026 wurde sie **nirgends definiert** — sie tauchte im gesamten
 * Build ausschließlich als Verweis auf, nie als Knoten. Der Herausgeber jedes
 * Artikels zeigte damit ins Leere.
 *
 * Gleichzeitig gab `getOrganizationSchema()` es zwar, sie war unit-getestet, und
 * **keine einzige Seite hat sie gerendert.** Auf der ganzen Website stand kein
 * `sameAs` — bei einer Marke, die sich mit „KITech NextGen Solutions"
 * (kitech.ai) verwechseln lässt, ist genau das der fehlende Anker.
 *
 * Seither: Der Knoten steht global im Root-Layout, `getLocalBusinessSchema()`
 * trägt dieselbe `@id`, damit Öffnungszeiten und Geokoordinaten in **dieselbe**
 * Entität fließen statt eine zweite aufzumachen.
 */
export const ORGANISATION_ID = "https://kitech-software.de/#organisation";

/**
 * Die Anschrift — einmal gebaut, aus `src/config/company.ts`.
 *
 * **Warum das zusammengezogen wurde (26.08.2026).** Diese Datei trug Anschrift,
 * Telefonnummer und Firmenname als Zeichenketten, ohne `company.ts` je zu
 * lesen. Genau daraus entstand der Befund desselben Tages: Die Fußzeile zeigte
 * die eine Nummer (aus `company.ts`), das JSON-LD eine andere (hier
 * hartkodiert) — auf derselben Seite. Wer nur an einer Stelle ändert, erzeugt
 * denselben Widerspruch erneut.
 *
 * `src/lib/__tests__/nap-konsistenz.test.ts` fängt das inzwischen ab; die
 * gemeinsame Quelle macht den Fehler von vornherein unmöglich.
 */
const POSTAL_ADDRESS = {
  "@type": "PostalAddress" as const,
  streetAddress: company.address.street,
  addressLocality: company.address.city,
  addressRegion: "Niedersachsen",
  postalCode: company.address.zip,
  addressCountry: "DE",
};

/** Die Firmennummer in E.164, wie Schema.org sie erwartet. */
const TELEFON = company.phone.href.replace("tel:", "");

/** Dasselbe Prinzip für die Website als Ganzes. */
export const WEBSITE_ID = "https://kitech-software.de/#website";

/**
 * Profile, die das Unternehmen selbst betreibt und die eine dritte Stelle
 * bestätigt. Sie sind der Disambiguierungs-Anker, den Google für `Organization`
 * ausdrücklich empfiehlt.
 *
 * ⚠️ **Nur Profile aufnehmen, die KITech gehören.** Verzeichnisse wie
 * Creditreform oder Companyhouse tragen die Firma ebenfalls, sind aber
 * abgeschriebene Registerdaten ohne Zutun des Unternehmens — sie antworten
 * Crawlern zudem mit 403. Ein `sameAs`, das ein Prüfer nicht abrufen kann,
 * belegt nichts.
 */
const SAME_AS = [
  "https://www.linkedin.com/company/104155510",
  /*
   * ProvenExpert am 07.09.2026 entfernt (Ansage Ayham: „das benutzen wir
   * nicht"). Das Profil existiert zwar und antwortet mit 200 — es steht aber
   * seit jeher auf null Bewertungen und wird nicht gepflegt.
   *
   * Ein `sameAs` ist eine Aussage über Identität, kein Linkverzeichnis: Es
   * sagt „das sind wir auch". Wer damit auf ein leeres Profil zeigt, schickt
   * jeden Prüfer — und jedes Sprachmodell — auf eine Seite, die über die Firma
   * nichts aussagt. Das ist schwächer als der Verzicht.
   */
  /*
   * Google Business Profile, adressiert über die CID.
   *
   * **Warum diese Form und kein share.google-Link.** Die Teilen-Funktion von
   * Google liefert einen Kurzlink auf eine *Suche* (`google.com/search?kgmid=…`)
   * — samt Tracking-Parametern und `authuser`, also dem Kontokontext dessen,
   * der ihn erzeugt hat. Beides gehört nicht in ein Schema, das auf jeder Seite
   * ausgeliefert wird.
   *
   * Die CID ist die dauerhafte Kennung des Eintrags. Sie steckt im
   * `data`-Parameter der Maps-URL als zweiter Hexwert
   * (`…!1s0x47b0751d44e671af:0xe20233564661e0e2!…`) und ergibt dezimal die Zahl
   * unten. Die Adresse leitet stabil auf das Profil weiter — am 26.08.2026
   * gerendert und geprüft.
   *
   * Gegengeprüft wurde dabei auch die Gegenrichtung, auf die es eigentlich
   * ankommt: Im Profil selbst ist `kitech-software.de` als Website hinterlegt,
   * die Telefonnummer stimmt mit `company.phone` überein, und die Anschrift
   * lautet dort wie hier „Wedekindstraße 14, 30161 Hannover". Ein `sameAs`
   * bestätigt eine Verknüpfung, es stellt sie nicht her.
   */
  "https://maps.google.com/?cid=16285635648166158562",
];

export function getOrganizationSchema(): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANISATION_ID,
    name: company.shortName,
    /* Die Firmierung steht im dafür vorgesehenen Feld, nicht im Namen (Ansage
       17.08.2026: überall „KITech Software", außer im Impressum). Google zeigt
       `name`; `legalName` stützt die Anbieterkennzeichnung, die im Impressum
       vollständig steht. */
    legalName: company.legalName,
    /* Umsatzsteuer-Identifikationsnummer und Registereintrag — beides steht im
       Impressum und ist damit ohnehin öffentlich. Im Schema stützen sie die
       Entität: Sie sind eindeutig und lassen sich gegen amtliche Quellen
       abgleichen, anders als ein Firmenname. */
    vatID: "DE459778632",
    identifier: {
      "@type": "PropertyValue",
      propertyID: "HRB",
      value: "HRB 230077, Amtsgericht Hannover",
    },
    url: "https://kitech-software.de",
    logo: "https://kitech-software.de/logo.png",
    image: "https://kitech-software.de/logo.png",
    /* Die ROI-Garantie („wird das Ziel nicht erreicht, zahlt der Kunde nicht")
       stand hier noch, obwohl sie am 12.08.2026 von allen Seiten genommen
       wurde — sie ging also weiter als Zusage an Google. Ersetzt durch das,
       was tatsächlich angeboten wird. */
    description:
      "KI-Beratung und Softwareentwicklung für den deutschen Mittelstand: Automatisierungen und individuelle Softwarelösungen, die im Tagesgeschäft laufen. Betrieb in europäischer Region oder auf eigener Hardware.",
    address: {
      ...POSTAL_ADDRESS,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: TELEFON,
      email: company.email.general,
      contactType: "customer service",
      availableLanguage: ["German", "English"],
    },
    sameAs: SAME_AS,
    /*
     * Eintragung ins Handelsregister, HRB 230077 Amtsgericht Hannover, am
     * 16.01.2026 — geprüft am 26.08.2026 am Registerauszug.
     *
     * Hier stand bis dahin "2023", ohne Beleg und ohne Kommentar. Bei einer UG
     * ist die Eintragung konstitutiv: Die juristische Person, die dieser
     * Organization-Knoten beschreibt, entsteht mit ihr. Eine frühere Tätigkeit
     * des Gründers ist etwas anderes als das Gründungsdatum der Gesellschaft.
     */
    foundingDate: "2026-01-16",
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: 52.3859,
        longitude: 9.7529,
      },
      geoRadius: "500 km",
    },
    /*
     * Themen, für die diese Entität steht. Anders als Fließtext ist das eine
     * Aussage, die Suchmaschinen und Sprachmodelle als Fakt einlesen können —
     * die Frage „wer macht Power Automate im Raum Hannover" wird nicht aus
     * Absätzen beantwortet, sondern aus dem Graph.
     *
     * Microsoft ergänzt am 04.09.2026 (Ansage): Der Enterprise-Stack ist das
     * Feld, in dem die Arbeit stattfindet.
     *
     * ⚠️ **Nur die amtlichen Produktnamen eintragen.** Ein erfundener Name
     * („Dynamics BI") löst auf keine bekannte Entität auf und schwächt den
     * Knoten, statt ihn zu stützen — die Liste ist nur so viel wert, wie sich
     * ihre Einträge abgleichen lassen.
     */
    knowsAbout: [
      "Microsoft Power Platform",
      "Microsoft Power Automate",
      "Microsoft Power BI",
      "Microsoft Dynamics 365",
      "Microsoft Power Apps",
      "Microsoft 365",
      "Microsoft Azure",
      "Künstliche Intelligenz",
      "Machine Learning",
      "LLM Integration",
      "Computer Vision",
      "DSGVO-konforme KI",
      "KI-Audit",
      "Prozessautomatisierung",
    ],
  };
}

/**
 * Der lokale Teil derselben Entität — Geokoordinaten, Öffnungszeiten,
 * Preisniveau. Steht auf `/kontakt`.
 *
 * **Dieselbe `@id` wie `getOrganizationSchema()` ist Absicht.**
 * `ProfessionalService` ist ein Untertyp von `LocalBusiness` und damit von
 * `Organization`; beide Knoten beschreiben also dieselbe Firma. Über die
 * gemeinsame Kennung fließen sie im Graph zusammen. Ohne sie stünden auf der
 * Website zwei unabhängige Unternehmen mit identischer Adresse.
 */
export function getLocalBusinessSchema(): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": ORGANISATION_ID,
    name: company.shortName,
    sameAs: SAME_AS,
    /* Firmierung im eigenen Feld — siehe Kommentar in `getOrganizationSchema`. */
    legalName: company.legalName,
    logo: {
      "@type": "ImageObject",
      url: "https://kitech-software.de/logo.png",
    },
    image: "https://kitech-software.de/logo.png",
    url: "https://kitech-software.de",
    telephone: TELEFON,
    email: company.email.general,
    /* Auch hier stand die ROI-Garantie noch — siehe `getOrganizationSchema`. */
    description:
      "KI-Beratung und Softwareentwicklung für den deutschen Mittelstand: Prozess-Audit, Automatisierungen und individuelle Software, betrieben in europäischer Region oder auf eigener Hardware.",
    address: {
      ...POSTAL_ADDRESS,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 52.3859,
      longitude: 9.7529,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    priceRange: "€€€",
  };
}

export function getWebPageSchema(
  name: string,
  description: string,
  url: string
): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url,
    isPartOf: {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: company.shortName,
      url: "https://kitech-software.de",
    },
    /* Verweis statt Kopie: Der vollständige Knoten steht einmal global im
       Root-Layout. Vorher stand hier ein Stummel mit bloßem `name`, der mit dem
       Herausgeber der Artikel nichts zu tun hatte. */
    publisher: { "@id": ORGANISATION_ID },
  };
}

/**
 * Der Website-Knoten. Steht zusammen mit der Organisation global im Root-Layout.
 *
 * **Bewusst ohne `SearchAction`/Sitelinks-Suchfeld.** Diese Website hat keine
 * eigene Suche; ein `potentialAction`, das auf eine nicht vorhandene
 * Suchergebnisseite zeigt, wäre eine Angabe, die bei der ersten Prüfung
 * auffliegt.
 */
export function getWebSiteSchema(): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: company.shortName,
    url: "https://kitech-software.de",
    inLanguage: "de-DE",
    publisher: { "@id": ORGANISATION_ID },
  };
}

export function getFAQSchema(
  faqs: { question: string; answer: string }[]
): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function getServiceSchema(
  name: string,
  description: string
): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: {
      "@id": ORGANISATION_ID,
      "@type": "Organization",
      name: company.shortName,
      url: "https://kitech-software.de",
    },
    areaServed: {
      "@type": "Country",
      name: "Germany",
    },
    serviceType: "KI-Beratung und Softwareentwicklung",
  };
}

export function getReviewSchema(
  reviews: {
    author: string;
    text: string;
    rating: number;
  }[]
): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    /* Derselbe Knoten wie oben, nur um die Bewertungen ergänzt — deshalb
       dieselbe Kennung, statt einer zweiten namenlosen Organisation. */
    "@id": ORGANISATION_ID,
    name: company.shortName,
    review: reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      reviewBody: r.text,
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
      },
    })),
  };
}

export function getBreadcrumbSchema(
  items: { name: string; url: string }[]
): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function getSoftwareAppSchema(
  name: string,
  description: string,
  type: string,
  url?: string
): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    applicationCategory: "BusinessApplication",
    operatingSystem: type === "iOS App" ? "iOS" : "Web",
    url: url || "https://kitech-software.de",
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/PreOrder",
    },
    author: {
      "@id": ORGANISATION_ID,
      "@type": "Organization",
      name: company.shortName,
    },
  };
}

/**
 * ItemList of Organization entries – maps the client logos on /referenzen.
 */
export function getClientsItemListSchema(
  clients: { name: string; url?: string }[]
): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ausgewählte Kunden von KITech Software",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: clients.length,
    itemListElement: clients.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Organization",
        name: c.name,
        ...(c.url ? { url: c.url } : {}),
      },
    })),
  };
}

/**
 * ContactPage schema for /kontakt – includes telephone, email, address.
 */
export function getContactPageSchema(): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Kontakt – KITech Software",
    url: "https://kitech-software.de/kontakt",
    description: "1:1-KI-Check und Kontaktdaten der KITech Software.",
    mainEntity: {
      "@type": "Organization",
      name: company.shortName,
      url: "https://kitech-software.de",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: TELEFON,
        email: company.email.general,
        contactType: "customer service",
        availableLanguage: ["German", "English"],
      },
    },
  };
}

/**
 * Person-Schema für den Gründer A. Alkhalil.
 * Stärkt E-E-A-T und macht den Geschäftsführer in KI-Suchergebnissen sichtbar.
 */
export function getFounderPersonSchema(): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://kitech-software.de/#ayham-alkhalil",
    name: "Ayham Alkhalil",
    alternateName: ["A. Alkhalil", "Ayham Al Khalil"],
    givenName: "Ayham",
    familyName: "Alkhalil",
    jobTitle: "Gründer & Geschäftsführer",
    description:
      "Ayham Alkhalil ist Gründer und Geschäftsführer von KITech Software in Hannover. Er entwickelt KI- und Automatisierungslösungen für den deutschen Mittelstand.",
    image: "https://kitech-software.de/images/team/ayham.webp",
    url: "https://kitech-software.de/haltung",
    /*
     * Beide verweisen per `@id` auf den Organisations-Knoten, statt eine zweite
     * namenlose Organisation aufzumachen. Vorher stand hier zweimal ein
     * anonymes Objekt — für einen Verbraucher der Daten waren das drei
     * verschiedene Firmen mit demselben Namen.
     *
     * `name` bleibt stehen: `schema-validators.ts` verlangt es als Pflichtfeld,
     * und es macht den Knoten auch ohne Auflösung lesbar. Ein Verweis mit
     * Beschriftung ist keine Dublette.
     */
    worksFor: {
      "@id": ORGANISATION_ID,
      "@type": "Organization",
      name: company.shortName,
      url: "https://kitech-software.de",
    },
    founderOf: {
      "@id": ORGANISATION_ID,
      "@type": "Organization",
      name: company.shortName,
      url: "https://kitech-software.de",
    },
    nationality: { "@type": "Country", name: "Deutschland" },
    workLocation: {
      "@type": "Place",
      address: {
        ...POSTAL_ADDRESS,
      },
    },
    /*
     * Das persoenliche Profil, nicht die Unternehmensseite. Ein Person-Knoten,
     * dessen sameAs auf die Firma zeigt, verknuepft die falschen Entitaeten --
     * die Unternehmensseite steht bereits im sameAs der Organisation.
     */
    sameAs: [
      "https://www.linkedin.com/in/ayham-alkhalil-66bb451b5",
    ],
    /*
     * ⚠️ **Muss zu `getOrganizationSchema` passen.** Bis zum 05.09.2026 standen
     * hier neun Themen, sechs davon KI, und **kein einziges Microsoft-Produkt**
     * — obwohl der Organisationsknoten am 04.09. auf den Microsoft-Stack
     * umgestellt wurde. Eine Firma, die Power Automate kann, und ein Gründer,
     * der es nicht kennt: Das ist derselbe Widerspruch, den ein Leser auch
     * zwischen zwei Sätzen auf einer Seite bemerken würde, nur maschinenlesbar.
     *
     * „MLOps" ist bei der Gelegenheit gefallen — der Begriff kam in keiner
     * Angebotsdatei vor, und die Glossarseite dazu wurde am selben Tag aus
     * demselben Grund entfernt. Was hier steht, muss die Website auch anbieten.
     */
    knowsAbout: [
      "Microsoft Power Automate",
      "Microsoft Power BI",
      "Microsoft Dynamics 365",
      "Individuelle Softwareentwicklung",
      "Prozessautomatisierung",
      "Künstliche Intelligenz",
      "KI-Beratung",
      "Large Language Models",
      "DSGVO-konforme KI",
      "Mittelstandsberatung",
    ],
  };
}

export interface CloudPlatformInput {
  name: string;
  description: string;
  provider: string;
  url?: string;
  areaServed?: string[];
}

/**
 * ItemList of Service entries – maps the Enterprise-Cloud-Platforms block.
 * Each list item is a full Service entity (Azure, AWS, GCP, Sovereign).
 */
export function getEnterpriseCloudItemListSchema(
  platforms: CloudPlatformInput[]
): SchemaBase {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Enterprise-Cloud-Plattformen für KI-Agenten",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: platforms.length,
    itemListElement: platforms.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: p.name,
        description: p.description,
        serviceType: "KI-Agenten-Entwicklung auf Enterprise-Cloud-Plattformen",
        provider: {
          "@type": "Organization",
          name: company.shortName,
          url: "https://kitech-software.de",
        },
        brand: {
          "@type": "Brand",
          name: p.provider,
        },
        ...(p.url ? { url: p.url } : {}),
        areaServed: (p.areaServed ?? ["Germany", "Austria", "Switzerland"]).map((a) => ({
          "@type": "Country",
          name: a,
        })),
      },
    })),
  };
}

export function getEnterpriseCloudFAQSchema(): SchemaBase {
  return getFAQSchema([
    {
      question: "Welche Enterprise-Cloud-Plattformen unterstützt KITech für KI-Agenten?",
      answer:
        "KITech baut KI-Agenten auf Microsoft Azure AI Foundry, AWS Bedrock und Google Vertex AI – sowie auf souveränen Alternativen wie STACKIT, IONOS AI und On-Premise-Deployments mit vLLM oder Ollama.",
    },
    {
      question: "Sind die KI-Lösungen DSGVO-konform und in der EU gehostet?",
      answer:
        "Ja. Alle Deployments laufen in EU-Regionen (Frankfurt, Zürich, Amsterdam oder europe-west3) mit Auftragsverarbeitungsverträgen, Standardvertragsklauseln, Private Endpoints und Verschlüsselung mit CMEK/KMS.",
    },
    {
      question: "Was ist mit digitaler Souveränität, wenn Public Cloud ausgeschlossen ist?",
      answer:
        "Für regulierte Branchen oder Air-Gapped-Anforderungen setzen wir Open-Source-LLMs (Llama, Mistral, Qwen) auf STACKIT, IONOS, Open Telekom Cloud oder Ihrer eigenen Infrastruktur auf – BSI C5- und ISO 27001-konform.",
    },
  ]);
}

