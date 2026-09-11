import { angebot, konditionen } from "@/config/angebot";

/**
 * Inhalte der beiden Sales-Letter-Funnels.
 *
 * Aufbau bewusst wie ein Sales Letter, nicht wie eine Leistungsseite:
 * Schmerz -> Problem -> warum die üblichen Antworten scheitern -> der eigentliche
 * Grund -> was stattdessen funktioniert -> Beweis -> CTA.
 *
 * ZUM STAND DER TEXTE (12.08.2026): Hier stand bis heute an jeder Stelle
 * derselbe Blindtext ("Platzhalter. Hier steht der Fließtext von Ayham"), und
 * beide Seiten sind aus der Navigation heraus erreichbar. Auf Ansage sind sie
 * jetzt ausgeschrieben, damit dort nichts Halbfertiges steht, bis Ayhams eigener
 * Wortlaut kommt.
 *
 * Was in den Texten steht und was nicht:
 *   - Alle Zahlen sind belegt und stammen aus `src/data/client-results.ts`
 *     (40 Tage / 1,5 Vollzeitstellen, 60 Tage / 1,2 Vollzeitkräfte, 3 Stunden
 *     auf 2 Minuten, zwei Monate bis zum Livegang). Es ist bewusst KEINE
 *     Fremdstatistik über gescheiterte KI-Projekte eingebaut — solche Zahlen
 *     kursieren in vielen Fassungen und wären hier nicht belegbar.
 *   - Es steht keine Kundenaussage darin, die nicht in den Daten belegt ist.
 *   - Die Knöpfe ziehen aus `src/config/angebot.ts`. Vorher stand hier noch
 *     "30 Minuten, unverbindlich" und "Kostenlose ROI-Analyse" — beides war seit
 *     der Umstellung auf die einstündige KI-Bewertung falsch.
 *
 * `isPlaceholder` bleibt gesetzt: nicht mehr, weil hier Blindtext stünde,
 * sondern weil dieser Wortlaut nicht von Ayham stammt. Solange das Flag steht,
 * bleiben beide Seiten auf `noindex` und aus der Sitemap — sie sollen nicht in
 * der Suche ranken, bevor der Text der ist, den er selbst sagen würde. Ersetzt
 * wird ausschließlich in dieser Datei, die Komponente bleibt unberührt.
 *
 * Bilder: Je Brief steht genau EIN Foto, im Block "Der eigentliche Grund" —
 * dieselbe freigestellte Aufnahme wie im Hero der Startseite. Die übrigen
 * Bildeinschübe sind entfallen: sie zeigten eine gestrichelte Fläche mit
 * "Bild von Ayham folgt", also wieder einen Platzhalter. Kommen weitere
 * Aufnahmen, hier `image` am Block ergänzen (`src` = Pfad unter /public).
 */

export interface SalesLetterBlock {
  /** Kleine Überzeile über der Block-Headline. */
  kicker?: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  /** Bild-Einschub als Rhythmus-Brecher. Seite wechselt blockweise. */
  image?: {
    src: string | null;
    alt: string;
    align: "left" | "right";
  };
}

export interface SalesLetterContent {
  slug: string;
  /** Für die Segmentierung: wohin führt der CTA am Ende? */
  audience: "solo" | "unternehmen";
  seo: {
    title: string;
    description: string;
  };
  hero: {
    badge: string;
    headline: string;
    /** Zweiter Teil der Headline, im weißen Marker gesetzt. */
    headlineHighlight: string;
    sub: string;
    ctaLabel: string;
    ctaHint: string;
  };
  blocks: SalesLetterBlock[];
  closing: {
    heading: string;
    paragraph: string;
    ctaLabel: string;
    ctaHint: string;
  };
  isPlaceholder?: boolean;
}

/**
 * Zweite Zeile im Knopf: Preis und Dauer. Die Platzangabe, die hier bis zum
 * 11.09.2026 dahinter stand, ist von der ganzen Website raus — siehe
 * `config/angebot.ts`.
 */
const ctaHint = konditionen();

export const soloLetter: SalesLetterContent = {
  slug: "warum-du-mit-ki-kein-geld-verdienst",
  audience: "solo",
  seo: {
    title: "Warum du mit KI kein Geld verdienst – KITech Software",
    description:
      "Du hast die Werkzeuge, du kennst die Prompts — und am Monatsende steht dieselbe Zahl wie vorher. Warum das so ist und woran es tatsächlich liegt.",
  },
  hero: {
    badge: "Für Einzelunternehmer und Selbstständige",
    headline: "Warum du mit KI",
    headlineHighlight: "kein Geld verdienst.",
    sub:
      "Du hast die Werkzeuge. Du kennst die Prompts. Du sparst jeden Tag Zeit — und am Monatsende steht trotzdem dieselbe Zahl wie vor einem Jahr. Das liegt nicht daran, dass du zu wenig weißt.",
    ctaLabel: angebot.cta,
    ctaHint,
  },
  blocks: [
    {
      kicker: "Das Problem",
      heading: "Du hast die Tools. Es passiert trotzdem nichts.",
      paragraphs: [
        "Abo bezahlt, Kurs gesehen, Automatisierung gebaut. Der Newsletter schreibt sich schneller, die Angebote sind in zehn Minuten fertig, die E-Mails beantworten sich fast von selbst. Es fühlt sich nach Fortschritt an.",
        "Nur ändert sich an dem, was hinten herauskommt, nichts. Du bist schneller geworden in Tätigkeiten, für die dich niemand bezahlt. Das ist der ganze Unterschied zwischen Zeit sparen und Geld verdienen — und er wird selten ausgesprochen, weil sich Zeitersparnis viel leichter verkaufen lässt.",
      ],
    },
    {
      kicker: "Warum die üblichen Antworten scheitern",
      heading: "Noch ein Prompt-Kurs löst dein Problem nicht.",
      paragraphs: [
        "Die naheliegende Reaktion ist, noch mehr zu lernen: der nächste Kurs, das nächste Werkzeug, die nächste Vorlagensammlung. Danach kannst du mehr — und stehst an derselben Stelle.",
      ],
      bullets: [
        "Ein Kurs bringt dir Bedienung bei. Deine Frage ist aber nicht, wie ein Werkzeug funktioniert, sondern an welcher Stelle deines Geschäfts es überhaupt etwas bewegt.",
        "Vorlagen sind für einen Durchschnittsfall gebaut. Dein Ablauf ist der Grund, warum Kunden bei dir kaufen und nicht woanders — genau der ist in keiner Vorlage abgebildet.",
        "Was du dir nebenbei zusammensteckst, hält so lange, wie du es selbst pflegst. Fällt eine Woche aus, fällt es aus — und du merkst es meistens am Kunden zuerst.",
      ],
    },
    {
      kicker: "Der eigentliche Grund",
      heading: "Die KI sitzt an der falschen Stelle.",
      paragraphs: [
        "Fast jeder setzt sie dort ein, wo es am einfachsten ist: beim Schreiben. Texte, Mails, Beiträge. Das sind aber selten die Stellen, an denen dein Geld entsteht oder verloren geht.",
        "Verloren geht es meistens vorher und nachher — beim Nachfassen, das liegen bleibt. Bei der Anfrage, die zwei Tage unbeantwortet steht. Beim Angebot, das nie rausging. An der Übergabe, die jedes Mal jemand von Hand macht. Wer dort ansetzt, merkt den Unterschied am Kontostand, nicht nur im Kalender.",
        "Das ist der Satz hinter allem, was wir hier machen: Falsche KI kostet mehr als keine KI. Sie kostet dich das Geld, das Abo, die Einarbeitung — und die Überzeugung, dass es bei dir eben nicht funktioniert.",
      ],
      image: {
        src: "/images/team/ayham-hero.webp",
        alt: "Ayham Alkhalil, Geschäftsführer von KITech Software",
        align: "right",
      },
    },
    {
      kicker: "Was stattdessen funktioniert",
      heading: "Erst der Ablauf. Dann die Technik.",
      paragraphs: [
        "Wir fangen nicht mit dem Werkzeug an, sondern mit deinem Geschäft: Wo kommen Anfragen her, was passiert damit, und an welcher Stelle bleibt regelmäßig etwas liegen. Erst wenn das auf dem Tisch liegt, reden wir darüber, was davon automatisiert gehört — und was ausdrücklich nicht.",
      ],
      bullets: [
        "Wir gehen deinen Ablauf durch und suchen die Stelle, an der Geld liegen bleibt — nicht die, an der Automatisierung am leichtesten wäre.",
        "Wir rechnen vorher, was es bringt. Trägt sich eine Sache nicht, sagen wir das, bevor jemand dafür bezahlt.",
        "Wir bauen genau diese eine Stelle — so, dass sie ohne dich läuft und du sie in einem Jahr noch verstehst.",
      ],
    },
  ],
  closing: {
    heading: "Eine halbe Stunde, und du weißt, woran es liegt.",
    paragraph:
      "Im kostenlosen 1:1-KI-Check gehen wir deine Aufstellung durch: was du schon nutzt, was davon trägt, wo es hakt und was sich zuerst lohnt. Am Ende hast du eine Einschätzung, mit der du auch allein weiterarbeiten kannst — Zusammenarbeit ist möglich, aber nicht der Zweck des Termins.",
    ctaLabel: angebot.cta,
    ctaHint,
  },
  isPlaceholder: true,
};

export const unternehmenLetter: SalesLetterContent = {
  slug: "warum-unternehmen-mit-ki-kein-geld-verdienen",
  audience: "unternehmen",
  seo: {
    title: "Warum Unternehmen mit KI kein Geld verdienen – KITech Software",
    description:
      "Der Pilot lief, die Präsentation war gut, danach kam nichts. Warum KI-Projekte im Mittelstand im Pilotstadium stehen bleiben — und woran man es vorher erkennt.",
  },
  hero: {
    badge: "Für Geschäftsführung und Bereichsleitung",
    headline: "Warum Unternehmen mit KI",
    headlineHighlight: "kein Geld verdienen.",
    sub:
      "Der Pilot lief. Die Präsentation war gut. Ein Jahr später arbeitet die Abteilung wie vorher, und in der Bilanz steht nur der Aufwand. Das liegt fast nie an der Technik.",
    ctaLabel: angebot.cta,
    ctaHint,
  },
  blocks: [
    {
      kicker: "Das Problem",
      heading: "Der Pilot lief. Danach kam nichts.",
      paragraphs: [
        "Ein Bereich probiert etwas aus, es funktioniert im Kleinen, alle sind zufrieden. Dann soll es in den Betrieb — und dort wartet die Wirklichkeit: gewachsene Systeme, Zuständigkeiten, Datenschutz, ein Team, das den bisherigen Weg beherrscht und für den neuen keine Zeit hat.",
        "Am Ende läuft das Werkzeug auf drei Rechnern weiter und der Rest arbeitet wie vorher. Niemand hat etwas falsch gemacht. Es hat nur nie jemand entschieden, wer den Prozess danach besitzt.",
      ],
    },
    {
      kicker: "Warum die üblichen Antworten scheitern",
      heading: "Eine Strategie ist noch kein laufendes System.",
      paragraphs: [
        "Die übliche Reaktion ist ein Konzept: Reifegradmodell, Anwendungsfall-Landkarte, Roadmap über drei Jahre. Das ist nicht falsch — es ist nur nicht das, was fehlt.",
      ],
      bullets: [
        "Ein Konzept beschreibt, was möglich wäre. Ins Tagesgeschäft kommt davon nichts, solange niemand die Anbindung an eure bestehenden Systeme baut und betreibt.",
        "Wer nur berät, übergibt am Ende ein Dokument. Wer nur entwickelt, baut, was im Ticket steht. Dazwischen fällt genau die Frage durch, ob sich die Sache überhaupt rechnet.",
        "Große Plattformprojekte binden ein Jahr, bevor der erste Vorgang schneller wird. In der Zeit ändert sich die Lage — und mit ihr die Begründung des Projekts.",
      ],
    },
    {
      kicker: "Der eigentliche Grund",
      heading: "Es scheitert nicht an der Technik.",
      paragraphs: [
        "Die Modelle sind gut genug. Sie sind es seit einer Weile. Was fehlt, ist die Verbindung zwischen dem, was ein Modell kann, und dem Vorgang, an dem in eurem Haus tatsächlich Zeit und Geld hängen.",
        "Diese Verbindung ist Arbeit, die niemand gern übernimmt: Datenqualität, Rechte, Schnittstellen zu Systemen, die seit Jahren laufen, Verantwortlichkeiten nach der Einführung. Genau daran entscheidet sich, ob aus einem Piloten ein Betriebsmittel wird oder eine Anekdote.",
        "Deshalb kostet falsch eingesetzte KI mehr als gar keine: Sie bindet Budget, bindet die besten Leute und hinterlässt im Haus die Überzeugung, dass das Thema nichts bringt.",
      ],
      image: {
        src: "/images/team/ayham-hero.webp",
        alt: "Ayham Alkhalil, Geschäftsführer von KITech Software",
        align: "right",
      },
    },
    {
      kicker: "Was stattdessen funktioniert",
      heading: "Erst rechnen, dann bauen — und dann betreiben.",
      paragraphs: [
        "Wir nehmen einen Vorgang, an dem messbar Aufwand hängt, und rechnen vor dem Bauen durch, was eine Automatisierung dort einspart. Trägt sie sich nicht, sagen wir das. Trägt sie sich, bauen wir sie bis in den Betrieb — nicht bis zur Demo.",
        "Wie das aussieht, steht auf dieser Website mit Adresse: bei einer Wohnungsbaugesellschaft lief die gesamte Objekt- und Kundenverwaltung nach 40 Tagen in einem Portal, der eingesparte Aufwand entspricht 1,5 Vollzeitstellen. Bei einer Zertifizierungsstelle deckt ein Portal seit 60 Tagen den Weg vom Antrag bis zum Zertifikat ab, das entspricht 1,2 Vollzeitkräften. In einem Vertrieb dauert die tägliche Recherche statt drei Stunden zwei Minuten.",
      ],
      bullets: [
        "Prozess-Audit: welcher Vorgang kostet wie viel, und was davon ist automatisierbar.",
        "Rechnung vor dem Bauen — inklusive der ehrlichen Antwort, wenn sie negativ ausfällt.",
        "Umsetzung bis in den Betrieb, mit Anbindung an eure Systeme statt neben ihnen.",
        "Betrieb, Überwachung und Übergabe an eure Leute. Der Code gehört euch.",
      ],
    },
  ],
  closing: {
    heading: "Rechnen wir es gemeinsam durch.",
    paragraph:
      "Im kostenlosen 1:1-KI-Check sehen wir uns eure Aufstellung an: was läuft, was im Pilotstadium hängt, welcher Vorgang sich zuerst rechnet. Er dauert eine halbe Stunde und endet mit einer Einschätzung, nicht mit einem Angebot.",
    ctaLabel: angebot.cta,
    ctaHint,
  },
  isPlaceholder: true,
};
