export interface GlossarySection {
  heading: string;
  content: string;
}

export interface GlossaryTerm {
  slug: string;
  term: string;
  shortDefinition: string;
  metaDescription: string;
  sections: GlossarySection[];
  /**
   * Verwandte Begriffe, als Slugs. Erscheinen am Fuß der Detailseite.
   *
   * ⚠️ **Gegenseitig pflegen.** Bis zum 01.09.2026 verwies `computer-vision`
   * auf drei andere Begriffe, aber kein einziger zurück — die Seite war eine
   * Sackgasse mit genau einem eingehenden Link (der Übersicht). Ausgerechnet
   * sie holte mit 15 Impressionen die meisten der ganzen Domain: Google zeigte
   * sie, die Website behandelte sie wie eine Nebenseite.
   *
   * Wer einen Verweis einträgt, prüft den Rückweg mit. Er muss inhaltlich
   * tragen — ein Ring aus Links, den niemand liest, ist ein Rankingtrick und
   * kein Wegweiser.
   */
  related: string[];
  faqs?: { question: string; answer: string }[];
  datePublished?: string;
  dateModified?: string;
}

export const GLOSSARY_DEFAULT_PUBLISHED = "2026-06-20";
export const GLOSSARY_DEFAULT_MODIFIED = "2026-06-23";
/*
 * Vorschaubild der Glossarseiten. Zeigte bis zum 26.08.2026 auf
 * storage.googleapis.com/gpt-engineer-file-uploads/... -- einen fremden Bucket
 * aus der Lovable-Herkunft des Projekts, ueber den niemand hier Kontrolle hat.
 * Dieselbe Altlast war am 21.08.2026 fuer das Standard-Vorschaubild behoben
 * worden; die sechs Glossarseiten lagen ausserhalb jener Pruefung und gaben den
 * fremden Bucket weiter im Article-Schema aus.
 */
export const GLOSSARY_DEFAULT_IMAGE = "https://kitech-software.de/images/og/standard.png";

export const glossaryTerms: GlossaryTerm[] = [
  {
    slug: "roi-garantie",
    term: "ROI-Garantie",
    shortDefinition:
      "Vertragsmodell, bei dem ein Anbieter einen in Euro messbaren Wertbeitrag zusichert und die Vergütung an das Erreichen dieses Ziels koppelt.",
    metaDescription:
      "ROI-Garantie bei KI-Projekten: was der Begriff bedeutet, wie der Wertbeitrag gemessen wird und welche Voraussetzungen ein solches Modell braucht.",
    sections: [
      {
        heading: "Definition",
        content:
          "Eine ROI-Garantie bei KI-Projekten ist eine vertragliche Zusicherung des Anbieters, einen vorab definierten, in Euro messbaren wirtschaftlichen Wertbeitrag zu erreichen. Wird das vereinbarte Ziel nicht erreicht, entfällt die Vergütung – ganz oder teilweise. Damit verschiebt sich das Projektrisiko vom Auftraggeber auf den KI-Dienstleister.",
      },
      {
        heading: "Warum eine ROI-Garantie?",
        content:
          "Klassische KI-Projekte werden auf Zeit- und Materialbasis abgerechnet. Das Risiko liegt damit vollständig beim Auftraggeber, und ein erheblicher Teil der Vorhaben kommt über den Pilotstatus nie hinaus. Eine ROI-Garantie verschiebt dieses Risiko: Sie zwingt den Anbieter, nur Anwendungsfälle anzunehmen, die einen quantifizierbaren Business Case haben – und den vorab zu prüfen.",
      },
      {
        heading: "Wie wird der ROI gemessen?",
        content:
          "Der ROI wird vor Projektstart als Kennzahl definiert – etwa eingesparte Personenstunden pro Monat, Reduktion der Bearbeitungszeit pro Vorgang, Senkung der Fehlerquote oder zusätzliche Umsatzpotenziale aus automatisierten Prozessen. Vor dem Go-Live wird ein Baseline-Wert erhoben. Nach einer vereinbarten Beobachtungsphase erfolgt die Messung gegen die Baseline. Die Messmethodik ist Bestandteil des Vertrags.",
      },
      {
        heading: "Voraussetzungen",
        content:
          "Eine ROI-Garantie funktioniert nur, wenn (1) der Use Case klar abgegrenzt ist, (2) die heutige Baseline messbar erhoben werden kann, (3) der Kunde Daten und Fachexperten bereitstellt und (4) ein KI-Audit den technischen und organisatorischen Reifegrad bestätigt hat.",
      },
    ],
    related: ["ki-audit", "llm-integration"],
    faqs: [
      {
        question: "Was passiert, wenn das ROI-Ziel nicht erreicht wird?",
        answer:
          "Das hängt vom Vertrag ab. Üblich ist eine Staffelung: Die Vergütung entfällt ganz oder anteilig, gemessen am vereinbarten Zielwert. Welche Staffelung gilt, steht im jeweiligen Vertrag und ist kein Merkmal des Begriffs.",
      },
      {
        question: "Für welche Projekte eignet sich eine ROI-Garantie?",
        answer:
          "Geeignet sind Projekte mit klarem Business Case, messbarer Baseline und konkretem Prozessbezug – etwa Dokumentenautomatisierung, Service-Assistenten, Qualitätsprüfung oder strukturierte Datenextraktion.",
      },
    ],
  },
  {
    slug: "ki-audit",
    term: "KI-Audit",
    shortDefinition:
      "Strukturierte Bestandsaufnahme von Prozessen, Daten und Systemen, um KI-Potenziale mit belastbarem Business Case zu identifizieren.",
    metaDescription:
      "KI-Audit: Definition, Ablauf und Ergebnisse. Wie ein KI-Audit Use Cases mit belastbarem ROI identifiziert – methodisch, datenbasiert, DSGVO-konform.",
    sections: [
      {
        heading: "Definition",
        content:
          "Ein KI-Audit ist eine strukturierte Analyse eines Unternehmens entlang dreier Achsen: Prozesse, Daten und Systeme. Ziel ist die Identifikation konkreter Use Cases, für die KI-Technologie einen messbaren wirtschaftlichen Wertbeitrag liefert – inklusive Aufwandsschätzung, Business Case und Priorisierung.",
      },
      {
        heading: "Ablauf",
        content:
          "Ein KI-Audit gliedert sich typischerweise in vier Phasen: (1) Interviews mit Fach- und Führungsebene, (2) Sichtung relevanter Prozesse und Datenquellen, (3) Bewertung der technischen und organisatorischen Reife sowie (4) Priorisierung der Use Cases nach Umsetzbarkeit und Wertbeitrag.",
      },
      {
        heading: "Ergebnisse",
        content:
          "Das Audit-Ergebnis ist eine Roadmap mit priorisierten Use Cases, jeweils inklusive geschätztem ROI, technischem Lösungskonzept, Datenanforderungen, Risikoeinschätzung und DSGVO-Bewertung. Wo eine ROI-Garantie vereinbart werden soll, ist eine solche Roadmap die Voraussetzung: Sie schließt Anwendungsfälle aus, die wirtschaftlich oder technisch nicht tragfähig sind.",
      },
      {
        heading: "Abgrenzung zur KI-Strategieberatung",
        content:
          "Während klassische KI-Strategieberatung oft auf Vision und Marktanalyse abzielt, ist ein KI-Audit operativ und umsetzungsnah. Es liefert keine Powerpoint-Strategie, sondern konkrete, umsetzbare Maßnahmen mit Aufwand und Nutzen in Euro.",
      },
    ],
    related: ["roi-garantie", "dsgvo-konforme-ki", "computer-vision"],
    faqs: [
      {
        question: "Wie lange dauert ein KI-Audit?",
        answer:
          "Ein fokussiertes KI-Audit dauert je nach Unternehmensgröße zwischen zwei und sechs Wochen.",
      },
      {
        question: "Welche Daten müssen bereitgestellt werden?",
        answer:
          "Benötigt werden in der Regel Prozessbeschreibungen, exemplarische Dokumente, Volumendaten sowie ein Überblick über die bestehende System- und Datenlandschaft.",
      },
    ],
  },
  {
    slug: "llm-integration",
    term: "LLM-Integration",
    shortDefinition:
      "Anbindung großer Sprachmodelle (Large Language Models) an Geschäftsprozesse und Fachsysteme – inklusive Retrieval, Tool-Use und DSGVO-konformem Betrieb.",
    metaDescription:
      "LLM-Integration für den Mittelstand: Definition, Architektur (RAG, Tool-Use, Agenten) und DSGVO-konformer Betrieb großer Sprachmodelle.",
    sections: [
      {
        heading: "Definition",
        content:
          "LLM-Integration bezeichnet die produktive Anbindung großer Sprachmodelle wie GPT, Claude oder Mistral an bestehende Geschäftsprozesse, Daten und Fachsysteme. Sie umfasst Architekturmuster wie Retrieval Augmented Generation (RAG), Tool-Use und Agenten-Orchestrierung.",
      },
      {
        heading: "Typische Architekturmuster",
        content:
          "Retrieval Augmented Generation (RAG) verbindet das LLM mit einer Vektordatenbank, um Antworten auf Basis eigener Dokumente zu erzeugen. Tool-Use erlaubt dem Modell, definierte Funktionen aufzurufen – etwa eine API oder eine Datenbankabfrage. Agenten-Architekturen kombinieren beides zu mehrstufigen Workflows mit Planung, Ausführung und Verifikation.",
      },
      {
        heading: "DSGVO-konformer Betrieb",
        content:
          "DSGVO-konforme LLM-Integration setzt voraus, dass personenbezogene Daten entweder pseudonymisiert oder ausschließlich in EU-gehosteten Modellen verarbeitet werden. KITech setzt hier auf europäische Cloud-Provider und On-Premise-Optionen sowie auf strikte Daten-Verträge mit den Modell-Anbietern.",
      },
    ],
    related: ["roi-garantie", "dsgvo-konforme-ki"],
  },
  {
    slug: "dsgvo-konforme-ki",
    term: "DSGVO-konforme KI",
    shortDefinition:
      "KI-Systeme, deren Datenverarbeitung den Anforderungen der DSGVO und des EU AI Act entspricht – mit nachvollziehbarer Rechtsgrundlage und technisch-organisatorischen Maßnahmen.",
    metaDescription:
      "DSGVO-konforme KI: Was ist erforderlich? Rechtsgrundlage, EU-Hosting, Datenminimierung, Auftragsverarbeitung und EU AI Act – kompakt erklärt.",
    sections: [
      {
        heading: "Definition",
        content:
          "DSGVO-konforme KI bezeichnet KI-Systeme, deren Datenverarbeitung im Einklang mit der EU-Datenschutz-Grundverordnung (DSGVO) und – soweit anwendbar – dem EU AI Act steht. Zentral sind Rechtsgrundlage, Datenminimierung, Transparenz und nachvollziehbare technisch-organisatorische Maßnahmen.",
      },
      {
        heading: "Anforderungen",
        content:
          "Erforderlich sind: (1) eine zulässige Rechtsgrundlage für die Verarbeitung, (2) ein Auftragsverarbeitungsvertrag mit dem KI-Anbieter, (3) Hosting innerhalb der EU oder in Ländern mit Angemessenheitsbeschluss, (4) Datenminimierung und Pseudonymisierung, (5) Informationspflichten gegenüber Betroffenen und (6) ein Verzeichnis der Verarbeitungstätigkeiten.",
      },
      {
        heading: "EU AI Act",
        content:
          "Der EU AI Act ergänzt die DSGVO durch ein risikobasiertes Klassifikationssystem. Je nach Risikoklasse gelten zusätzliche Pflichten – etwa Risikomanagement, Transparenz, menschliche Aufsicht und Konformitätsbewertung. KI-Systeme mit hohem Risiko unterliegen umfangreichen Dokumentations- und Auditpflichten.",
      },
    ],
    related: ["ki-audit", "llm-integration", "computer-vision"],
  },
  {
    slug: "computer-vision",
    term: "Computer Vision",
    shortDefinition:
      "Teilgebiet der KI, das Computer befähigt, Bilder und Videos zu interpretieren – von Qualitätsprüfung über Dokumentenerkennung bis zur Objekterkennung.",
    metaDescription:
      "Computer Vision im Mittelstand: Definition, Anwendungsfälle (OCR, Qualitätsprüfung, Objekterkennung) und Voraussetzungen für den produktiven Einsatz.",
    sections: [
      {
        heading: "Definition",
        content:
          "Computer Vision ist das Teilgebiet der Künstlichen Intelligenz, das Computer befähigt, visuelle Informationen aus Bildern und Videos zu extrahieren und zu interpretieren. Moderne Verfahren basieren auf tiefen neuronalen Netzen und multimodalen Foundation Models.",
      },
      {
        heading: "Typische Anwendungsfälle",
        content:
          "Zu den häufigsten Anwendungsfällen im Mittelstand zählen: automatisierte Dokumentenerfassung (OCR und Strukturierung), visuelle Qualitätsprüfung in der Fertigung, Bestandserfassung im Lager, sicherheitsrelevante Überwachung sowie Schadenserkennung in Versicherung und Immobilienwirtschaft.",
      },
      {
        heading: "Voraussetzungen",
        content:
          "Erfolgreiche Computer-Vision-Projekte setzen ausreichende, repräsentative Trainings- oder Beispiel-Daten, definierte Beleuchtungs- und Aufnahmebedingungen sowie eine klare Abgrenzung der zu erkennenden Klassen voraus. Diese Voraussetzungen werden im Rahmen eines KI-Audits geprüft.",
      },
    ],
    related: ["ki-audit", "roi-garantie"],
  },
];

export function getTermBySlug(slug: string): GlossaryTerm | undefined {
  return glossaryTerms.find((t) => t.slug === slug);
}
