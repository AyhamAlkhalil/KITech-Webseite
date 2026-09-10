
/**
 * Kundendaten für das Ergebnisraster auf der Startseite (`ClientResults.tsx`)
 * sowie für Referenzen-Übersicht und Detailseiten (`ReferenceCard.tsx`,
 * `ReferenzDetail.tsx`).
 *
 * Die Startseitenkarte zeigt das ERGEBNIS prominent: die Kennzahl gross und
 * unterstrichen, dazu Beleglinks (`liveUrl` / `companyUrl`), Sterne und Foto.
 * Am 05.08.2026 war sie kurzzeitig auf eine reine Bewertungskarte ohne Zahlen
 * reduziert — das ist auf Ansage zurueckgenommen worden ("ganz prominent die
 * Ergebnisse zeigen"). Wer sie erneut entkernt, nimmt der Startseite ihren
 * einzigen harten Beweis.
 *
 * Inhalte stammen aus dem Briefing von Ayham (30.07.2026). Was noch fehlt oder
 * bestätigt werden muss, steht pro Eintrag in `openPoints` — daraus rendert die
 * Karte einen sichtbaren Marker. Leere/fehlende `openPoints` = freigegeben.
 *
 * Vor dem Livegang: jede Karte braucht die schriftliche Freigabe des Kunden für
 * Name, Foto und Zahlen.
 *
 * Fotos der Personen liegen unter `public/images/referenzen/portraits/` als freigestellte WebPs
 * mit transparentem Hintergrund, auf die Person zugeschnitten, 520 px hoch.
 * Quelle waren die SVG-Freisteller von Ayham. Firmenlogos liegen dagegen als
 * Asset-Import in src/assets.
 *
 * ENTFERNT am 12.08.2026 — Lead-Pipeline (Felix Bechtoldt):
 * Auf Ansage herausgenommen, weil kein Foto vorliegt ("Felix bitte herausnehmen,
 * weil er kein Bild hat"). Der Fall trug die Kennzahl "100+ qualifizierte Leads,
 * jeden Morgen um 8" und den Prozessvergleich "3 Stunden Recherche → 2 Minuten".
 * Vollständig im Commit davor; zurückholen mit
 * `git show <commit>:src/data/client-results.ts`.
 *
 * ANGELEGT am 12.08.2026 — Thomas / Grynia:
 * Ersetzt den entfernten Recherche-Fall. Belegt sind aus Ayhams Ansage: Vorname
 * Thomas, Branche (Vermittlung von Arbeitskräften), was gebaut wurde
 * (automatisierte Kette) und die Kennzahl. Das Foto lag seit dem 05.08.2026
 * bereit.
 *
 * PRÄZISIERT am 26.08.2026 (Ansage Ayham: „Anstatt 5h nun 5 Minuten
 * Leadrecherche"): Die Kennzahl stand als „Kundenrecherche in 10 Minuten" —
 * beides ist damit korrigiert. Es geht um die **Lead**recherche, sie dauert
 * **fünf** Minuten, und der Ausgangswert ist jetzt belegt: **fünf Stunden**.
 * Der Vorher-Wert steht bewusst im `headline.label` und nicht in
 * `before`/`after`: die Startseitenkarte rendert nur `headline`, und der
 * Kontrast ist hier die eigentliche Aussage. Doppelt gesetzt stünde er auf der
 * Übersichtskarte zweimal.
 *
 * Der Slug bleibt `grynia-kundenrecherche` — die Detailseiten stehen auf
 * `noindex`, ein Umbenennen brächte nichts und bräche geteilte Links.
 *
 * Name und Firma sind bestätigt: **Thomas Grynia**, **Grynia Consulting**,
 * Vermittlung von Arbeitskräften. "Grynia" ist der Nachname, nicht die Firma —
 * der Dateiname der Bildlieferung hatte anderes nahegelegt, und in der Ansage
 * klang die Firma wie "Grüner Consulting" (Spracherkennung).
 *
 * Offen bleiben wie bei den anderen Fällen die Ausgangslage beim Kunden, die
 * eingesetzte Technik und ein freigegebenes Zitat.
 *
 * ACHTUNG — was in den Detailtexten stehen darf:
 * Belegt sind die Angaben aus dem Briefing (Name, Firma, was gebaut wurde,
 * Dauer, eingesparte Stellen) und die geprüften Adressen.
 *
 * Bis zum 12.08.2026 standen in `detail.sections[].paragraphs` als
 * "Platzhalter:" markierte Fragetexte — sichtbar für jeden Besucher der
 * Detailseiten. Sie sind auf Ansage durch Fließtext ersetzt worden, und zwar
 * nach einer Regel, die hier bleibt:
 *
 *   Über den KUNDEN steht nur das, was im Briefing belegt ist. Was allgemein
 *   gilt — wie eine solche Aufgabe aussieht, wie wir arbeiten, was eine
 *   Rechtslage verlangt — ist als allgemeine Aussage formuliert und nicht als
 *   Behauptung über diesen Betrieb. Sätze wie "vorher lief alles über
 *   Excel-Listen" stehen deshalb NICHT da: das mag naheliegen, weiß aber
 *   niemand.
 *
 * Die Ausgangslage beim Kunden fehlt damit weiterhin in fast allen Fällen —
 * genau das steht in `openPoints`, und genau deshalb bleiben die Detailseiten
 * auf `noindex`. Wer die Angaben nachliefert, ergänzt hier einen Abschnitt
 * "Ausgangslage" und streicht den zugehörigen offenen Punkt.
 *
 * `phases` und `stack` bleiben leer, `quote` bleibt null, bis es dafür belegte
 * Angaben und (beim Zitat) eine schriftliche Freigabe des Kunden gibt. Einzige
 * Ausnahme: NiImmo — dort ist das Zitat über src/data/testimonials.ts belegt.
 * Nichts hier erfinden — auch nichts Naheliegendes.
 */

export interface ClientResult {
  /** URL-Segment für die Detailseite /referenzen/:slug */
  slug: string;
  /** Firmenname oder, solange der nicht freigegeben ist, die Branche. */
  company: string;
  logo: string | null;
  /**
   * Das GEBAUTE Produkt, öffentlich erreichbar. Der stärkste Beleg, den eine
   * Karte tragen kann: nicht "wir haben ein Portal gebaut", sondern "hier ist es".
   * Nur eintragen, wenn die Adresse tatsächlich das Ergebnis dieses Projekts
   * zeigt — nicht die Firmenwebsite des Kunden, dafür ist `companyUrl` da.
   * Alle Einträge am 05.08.2026 per Abruf geprüft (HTTP 200 + passender Titel).
   */
  liveUrl: string | null;
  /** Website des Kunden. Belegt, dass es die Firma wirklich gibt. */
  companyUrl: string | null;
  /**
   * Blendet den Fall auf der STARTSEITE aus; in der Referenz-Uebersicht und auf
   * der Detailseite bleibt er sichtbar. Gesteuert ueber `homeClientResults`
   * am Dateiende.
   *
   * Aktuell nur bei klargehalt gesetzt (Leon Battel) — auf Ansage vom
   * 05.08.2026, ohne Begruendung im Briefing. Nicht ohne Ruecksprache
   * entfernen.
   */
  hideOnHome?: boolean;
  /**
   * Wohin ein Klick auf die Karte führt.
   *
   *   - `"detail"` (Standard, auch ohne Angabe): auf `/referenzen/<slug>`.
   *   - `"live"`: direkt auf `liveUrl`, in einem neuen Tab.
   *
   * **Auf Ansage (17.08.2026):** „Wenn man auf klargehalt-Referenz klickt, soll
   * man dahin gebracht werden. Zu klargehalt.de." Der Fall hat weder Person noch
   * Zitat noch Bewertung — sein einziger Beleg ist das Produkt selbst. Eine
   * Detailseite schiebt genau dazwischen noch einen Klick.
   *
   * Ohne gesetzte `liveUrl` fällt der Wert auf die Detailseite zurück (siehe
   * `kartenLink()`), statt einen toten Link zu erzeugen.
   */
  klickZiel?: "detail" | "live";
  /**
   * Die Person, die für den Fall steht.
   *
   * `null`, wenn der Fall ohne Gesicht auskommt — dann trägt ihn allein das
   * Firmenlogo. Bei `klargehalt.de` ist das so gewollt (Ansage 14.08.2026,
   * siehe dort): Leon Battel steht auf derselben Startseite bereits im Team,
   * und der eigene Entwickler als Kundenreferenz liest sich wie ein
   * gestellter Beleg.
   */
  person: {
    name: string;
    /** Rolle beim Kunden, optional. */
    role: string | null;
    /** Pfad unter /public. null => Initialen-Platzhalter. */
    photo: string | null;
  } | null;
  /**
   * Sterne-Bewertung dieses Kunden, 1–5. Erscheint auf der Bewertungskarte.
   *
   * Steht seit 05.08.2026 überall auf 5 — so von Ayham vorgegeben ("Alle
   * Bewertungen erhalten 5 von 5 Sternen"). Vorher stand hier durchgängig 4.
   *
   * ACHTUNG: Das ist eine Bewertung, die einer namentlich genannten Person
   * zugeschrieben wird, und sie steht laut Vorgabe ausdrücklich für die
   * jeweilige Kundenaussage — nicht allgemein für die Zusammenarbeit.
   *
   * **Woher die Zahlen stammen (Stand 26.08.2026, auf Nachfrage von Ayham):**
   *
   * | Kunde | Grundlage |
   * |---|---|
   * | Dennis Mikyas | schriftlich, siehe `testimonials.ts` |
   * | Eugen Kretschmann | schriftlich, siehe `testimonials.ts` (kein Karteneintrag) |
   * | Benjamin Ronneburg | **mündlich gegenüber Ayham** |
   * | Jan Uwe Pane | **mündlich gegenüber Ayham** |
   * | Thomas Grynia | **mündlich gegenüber Ayham** |
   * | Mike Letzgus | **mündlich gegenüber Ayham** |
   * | ProOptima | **mündlich gegenüber Ayham** (07.09.2026) |
   * | Martin Ziemann | **mündlich gegenüber Ayham** (07.09.2026) |
   *
   * Eine mündlich abgegebene Bewertung ist eine **echte** Bewertung. Der
   * Tatbestand im Anhang zu § 3 Abs. 3 Nr. 23c UWG trifft das *Erfinden* von
   * Bewertungen, nicht das Fehlen eines Formulars — die vier Zahlen sind
   * deshalb keine gefälschten Bewertungen.
   *
   * ⚠️ **Was fehlt, ist die Beweisbarkeit, nicht die Bewertung.** Wer die
   * Angabe bestreitet, zwingt zum Nachweis, und "wurde mir am Telefon gesagt"
   * trägt vor Gericht wenig. Solange das so steht, ist das ein bewusst
   * getragenes Risiko und keine Nachlässigkeit.
   *
   * **Entschieden am 07.09.2026 (Ayham): Es bleibt dabei.** Die mündliche
   * Grundlage ist ausdrücklich in Ordnung, ein Beleg-Kanal wird nicht
   * aufgesetzt; ProvenExpert wird nicht genutzt. Das ist eine bewusste
   * Entscheidung des Geschäftsführers über sein eigenes Risiko und **kein
   * offener Punkt mehr** — wer hier erneut einen Beleg-Prozess vorschlägt,
   * trägt eine erledigte Frage noch einmal vor.
   *
   * Unberührt davon gilt weiterhin: **Wer eine dieser Zahlen ändert, ohne mit dem Kunden gesprochen
   * zu haben, erfindet sie** — und genau das ist der Tatbestand.
   *
   * Was hier unter keinen Umständen passieren darf: eine Zahl höher setzen als
   * das, was der Kunde gesagt hat, einen Kunden ergänzen, der nichts gesagt
   * hat, oder aus einer mündlichen Bewertung ein wörtliches Zitat machen
   * (dafür ist `review` da, und das bleibt ohne Wortlaut `null`).
   *
   * ⚠️ **Norm am 19.08.2026 korrigiert.** Hier stand vorher § 5b Abs. 3 UWG.
   * Der regelt aber die *Informationspflicht* darüber, ob und wie ein Anbieter
   * die Echtheit veröffentlichter Bewertungen sicherstellt. Erfundene
   * Bewertungen selbst fallen unter die Schwarze Liste im Anhang zu § 3 Abs. 3
   * UWG — Nr. 23c (gefälschte Verbraucherbewertungen) und Nr. 23b (Irreführung
   * über die Echtheit). Der Unterschied ist erheblich: Die Schwarze Liste greift
   * **ohne Interessenabwägung**, ein Verstoß ist per se unlauter.
   */
  rating: number | null;
  /**
   * Steht anstelle der Sterne, wenn `rating` null ist — ein kurzer Beleg in
   * derselben Zeile, z. B. "20+ Enterprise-Nutzer".
   *
   * **Auf Ansage (26.08.2026):** „Bei der klargehalt gibt es ja keine Sterne.
   * Mach statt den Sternen iwas dahin — sowas wie 20+ Kunden usw."
   *
   * Der Fall ohne Person hat keine Bewertung (siehe `rating`) und dadurch eine
   * sichtbare Lücke im Kartenkopf, wo bei allen anderen fünf Sterne stehen.
   * Diese Zeile füllt sie mit dem, was der Fall tatsächlich vorweisen kann.
   *
   * ⚠️ Das ist **keine** Ersatzbewertung. Hier gehört eine nachprüfbare
   * Tatsache hin — Nutzung, Laufzeit, Umfang — und nichts, was sich als Urteil
   * eines Kunden lesen lässt. Sterne ohne Absender wären genau der Fall, den
   * der Anhang zu § 3 Abs. 3 Nr. 23c UWG trifft; eine Zahl, die man nachzählen
   * kann, ist es nicht.
   *
   * Wo `rating` gesetzt ist, gewinnen die Sterne — beides nebeneinander wäre
   * eine überladene Zeile.
   */
  stattSterne?: string | null;
  /**
   * Der kurze Bewertungssatz auf der Karte, wörtlich so abgegeben. Genau ein
   * Satz — keine mehrzeiligen Testimonials, das ist Vorgabe.
   *
   * `null`, solange kein belegter Satz vorliegt: die Karte zeigt dann Name,
   * Firma und Sterne, aber keine Aussage. Hier NICHTS erfinden und auch nichts
   * aus `summary` oder `headline` umformulieren — das wäre eine Bewertung, die
   * dem Kunden in den Mund gelegt wird (Anhang zu § 3 Abs. 3 Nr. 23c UWG).
   *
   * TODO (Ayham): Sätze für Benjamin Ronneburg, Leon Battel, Jan Uwe Pane
   * und Mike Letzgus nachliefern.
   */
  review: string | null;
  /**
   * Was für ein Projekt das war, in zwei bis drei Wörtern — "Claude-Code-Setup",
   * "Kundenportal", "SaaS-Entwicklung". Steht als Pille auf der Karte.
   *
   * Auf Ansage ergänzt (12.08.2026): "sowas wie Claude Code Setup oder KI Setup
   * deutlicher darstellen". Vorher musste man aus der Kennzahl erraten, was
   * überhaupt gebaut wurde — "4 Wochen" allein sagt nichts über die Leistung.
   */
  kategorie: string;
  /** Die eine radikale Zahl, groß gesetzt. */
  headline: {
    value: string;
    label: string;
  };
  /** Was gebaut wurde, ein bis zwei Sätze. */
  summary: string;
  /** Projektdauer als fertiger String, z. B. "40 Tage bis live". */
  duration: string | null;
  /** Vorher/Nachher-Paar, nur wo es einen echten Prozessvergleich gibt. */
  before: string | null;
  after: string | null;
  /** Zusätzliche Kennzahl unter dem Vorher/Nachher. */
  extra: string | null;
  /** Was an diesem Eintrag noch offen ist. Leer => freigegeben. */
  openPoints?: string[];
  /**
   * Inhalt der Detailseite unter /referenzen/<slug>. Fehlt das Feld, zeigt die
   * Detailseite nur die Kartendaten plus einen Hinweis, dass der Fall gerade
   * aufbereitet wird — statt einer leeren Seite.
   */
  detail?: ClientResultDetail;
}

/** Ein Abschnitt der Fallbeschreibung: Überschrift plus Absätze. */
export interface DetailSection {
  heading: string;
  paragraphs: string[];
  /** Optionale Aufzählung unter den Absätzen. */
  bullets?: string[];
}

/** Ein Schritt im Projektverlauf. */
export interface DetailPhase {
  /** z. B. "Woche 1–2" */
  period: string;
  title: string;
  description: string;
}

/** Eine Kennzahl im Ergebnis-Raster der Detailseite. */
export interface DetailMetric {
  value: string;
  label: string;
}

export interface ClientResultDetail {
  /** Ein Satz als Aufmacher der Detailseite. */
  intro: string;
  /** Ausgangslage, Aufgabe, Lösung — je ein Abschnitt. */
  sections: DetailSection[];
  /** Projektverlauf als Zeitleiste. Leer lassen, wenn nicht belegbar. */
  phases: DetailPhase[];
  /** Ergebnis-Kennzahlen, ergänzend zur Kernzahl der Karte. */
  metrics: DetailMetric[];
  /** Eingesetzte Technik. */
  stack: string[];
  /** Wörtliches Zitat des Kunden — nur mit echter Freigabe. */
  quote: { text: string; author: string } | null;
}

export const clientResults: ClientResult[] = [
  /*
   * Steht bewusst an erster Stelle (Ansage 07.09.2026): Seit dem 04.09.2026
   * ist der Microsoft-Stack die Positionierung der Website — und dies ist der
   * einzige Fall im Bestand, der sie belegt. Eine Positionierung ohne Beleg
   * ist eine Behauptung; der Beleg gehört dorthin, wo er zuerst gesehen wird.
   */
  {
    slug: "prooptima-vertrieb-power-automate",
    company: "ProOptima",
    logo: null,
    liveUrl: null,
    /* Am 07.09.2026 abgerufen: HTTP 200, Titel „ProOptima – Dienstleister der
       Kunststofftechnik". Deckt sich mit der Navigation, die Ayham mitgeliefert
       hat (Spritzgießen, Peripherie, Automation). */
    companyUrl: "https://www.prooptima.de",
    person: null,
    /* Fünf Sterne auf Ansage Ayham (07.09.2026), Grundlage mündlich — dieselbe
       Lage wie bei Ronneburg, Pane, Grynia und Letzgus. Absender ist hier die
       Firma: Ohne `person` setzt die Karte `company` unter die Sterne, sie
       stehen also nicht ohne Urheber da. Ein Wortlaut liegt nicht vor, deshalb
       bleibt `review` leer — aus einer mündlichen Bewertung ein Zitat zu machen,
       wäre der Tatbestand aus dem Anhang zu § 3 Abs. 3 Nr. 23c UWG. */
    rating: 5,
    /* Bei gesetztem `rating` gewinnen die Sterne, `stattSterne` wäre toter
       Code. Das Werkzeug steht deshalb in der Kategorie-Pille — dort trägt es
       die Positionierung sogar sichtbarer. */
    stattSterne: null,
    review: null,
    kategorie: "Vertrieb mit Power Automate",
    headline: { value: "10 Minuten", label: "für einen Vertriebsvorgang, vorher 3 Stunden" },
    summary:
      "Ein wiederkehrender Vorgang im Vertrieb läuft automatisiert über Power Automate: Was vorher drei Stunden von Hand gebraucht hat, ist in zehn Minuten erledigt.",
    duration: null,
    before: "3 Stunden von Hand",
    after: "10 Minuten automatisiert",
    extra: null,
    /*
     * Die Angaben stammen aus einer mündlichen Kurzbeschreibung (Ayham,
     * 07.09.2026, ausdrücklich als „grob" gekennzeichnet). Kennzahl und
     * Werkzeug sind damit belegt, der Rest nicht — und was nicht belegt ist,
     * steht hier statt im Fließtext.
     */
    openPoints: [
      "Freigabe des Kundennamens nicht schriftlich bestätigt",
      "Welcher Vertriebsvorgang genau — nicht dokumentiert",
      "Projektdauer nicht dokumentiert",
      "Bewertung nur mündlich — nicht schriftlich belegbar",
      "Kein freigegebenes Zitat",
    ],
  },
  {
    slug: "pflegexperts-claude-code",
    company: "Pflegexperts",
    logo: "/images/referenzen/logos/pflegexperts.png",
    liveUrl: null,
    companyUrl: "https://pflegexperts.de",
    person: {
      name: "Benjamin Ronneburg",
      role: null,
      photo: "/images/referenzen/portraits/benjamin-ronneburg.webp",
    },
    rating: 5,
    review: null,
    kategorie: "Claude-Code-Setup",
    headline: { value: "4 Wochen", label: "bis Claude Code einsatzbereit war" },
    summary:
      "Bei Pflegexperts steht Claude Code mit eingerichteter Arbeitsumgebung, klaren Regeln und Automatisierungen für die tägliche Arbeit.",
    duration: null,
    before: null,
    after: null,
    extra: null,
    openPoints: [
      "Ausgangslage beim Kunden nicht dokumentiert",
      "Eingesetzte Technik nicht dokumentiert",
      "Kein freigegebenes Zitat",
    ],
    detail: {
      intro:
        "In vier Wochen ein komplettes Claude-Code-Setup: Arbeitsumgebung, Regeln und " +
        "Automatisierungen für den täglichen Einsatz.",
      sections: [
        {
          heading: "Was wir gebaut haben",
          paragraphs: [
            "Aufgesetzt wurde ein komplettes Claude-Code-Setup: Arbeitsumgebung, Regeln " +
              "und Automatisierungen für den täglichen Einsatz. Nach vier Wochen stand es " +
              "und wurde benutzt.",
            "Ein solches Setup besteht aus drei Teilen. Die Arbeitsumgebung ist der Rahmen: " +
              "womit gearbeitet wird, worauf zugegriffen werden darf, wo Ergebnisse landen. " +
              "Die Regeln sind schriftlich hinterlegte Vorgaben — wie hier gearbeitet wird, " +
              "was ohne Rückfrage passieren darf und was ausdrücklich nicht. Die " +
              "Automatisierungen übernehmen die wiederkehrenden Handgriffe, die vorher " +
              "jedes Mal jemand selbst gemacht hat.",
          ],
        },
        {
          heading: "Warum ein Setup und nicht nur ein Zugang",
          paragraphs: [
            "Ein Werkzeugzugang ist in fünf Minuten eingerichtet und verändert wenig. " +
              "Ohne hinterlegte Regeln beantwortet ein Sprachmodell jede Aufgabe nach " +
              "eigenem Ermessen — es ist dann ein besserer Chat, kein Bestandteil der " +
              "Arbeit. Was den Unterschied macht, ist der Aufbau darum herum.",
            "Genau deshalb ist dieser Aufbau bei uns die eigentliche Arbeit. Er ist auch " +
              "der Grund, warum die Einführung an dieser Stelle vier Wochen gedauert hat " +
              "und nicht einen Nachmittag.",
          ],
        },
      ],
      phases: [],
      metrics: [{ value: "4 Wochen", label: "bis zum fertigen Setup" }],
      stack: [],
      quote: null,
    },
  },
  {
    slug: "klargehalt-saas",
    company: "klargehalt.de",
    /* Wortmarke von klargehalt.de, freigestellt aus deren og-image. */
    logo: "/images/referenzen/logos/klargehalt.png",
    liveUrl: "https://klargehalt.de",
    companyUrl: null,
    hideOnHome: true,
    /*
     * Klick fuehrt auf klargehalt.de, nicht auf die Detailseite (Ansage
     * 17.08.2026, siehe `klickZiel` im Interface). Die Detailseite bleibt unter
     * /referenzen/klargehalt-saas erreichbar, sie wird nur nicht mehr verlinkt.
     */
    klickZiel: "live",
    /*
     * **Ohne Person, auf Ansage (14.08.2026):** "Du musst Leon rausnehmen aus
     * den Referenzen — mach nur klargehalt.de und das Logo von klargehalt.de
     * und fertig." Leon steht auf der Startseite bereits im Team; derselbe
     * Mensch ein paar Bildschirme tiefer als Kunde ist kein Beleg, sondern
     * eine Selbstauskunft.
     *
     * `rating` faellt damit weg: eine Bewertung braucht jemanden, der sie
     * abgibt. Fuenf Sterne ohne Absender waeren eine Behauptung ueber eine
     * Kundenzufriedenheit, die hier niemand geaeussert hat.
     */
    person: null,
    rating: null,
    /*
     * Steht an der Stelle der Sterne (Ansage Ayham, 26.08.2026: „bei der
     * klargehalt gibt es ja keine Sterne. Mach statt den Sternen iwas dahin —
     * sowas wie 20+ Kunden usw.").
     *
     * „Nutzer", nicht „Kunden": belegt ist die Zahl der Nutzer im
     * Enterprise-Tarif („20+ Enterprise User bereits on Board"). Wie viele
     * Firmen dahinterstehen, weiss hier niemand — daraus „20 Kunden" zu machen,
     * waere eine Umdeutung nach oben, und Kundenzahlen sind genau die Sorte
     * Angabe, die jemand nachrechnet.
     *
     * Die Zahl waechst; „20+" bleibt damit richtig, solange sie nicht faellt.
     */
    stattSterne: "20+ Enterprise-Nutzer",
    review: null,
    kategorie: "SaaS-Entwicklung",
    headline: { value: "2 Monate", label: "von der ersten Zeile bis zum Livegang" },
    summary:
      "SaaS zur EU-Entgelttransparenzrichtlinie gebaut — Bezahlsystem und Abrechnung inklusive.",
    duration: null,
    before: null,
    after: null,
    extra: null,
    openPoints: [
      "Funktionsumfang im Einzelnen nicht dokumentiert",
      "Eingesetzte Technik nicht dokumentiert",
      "Kein freigegebenes Zitat",
    ],
    detail: {
      intro:
        "In zwei Monaten von null auf live: ein komplettes SaaS zur " +
        "EU-Entgelttransparenzrichtlinie, inklusive Bezahlsystem und Abrechnung.",
      sections: [
        {
          heading: "Worum es geht",
          paragraphs: [
            "Die EU-Entgelttransparenzrichtlinie verpflichtet Arbeitgeber, offenzulegen, " +
              "wie Gehälter zustande kommen: Beschäftigte können Auskunft über das " +
              "Entgeltniveau vergleichbarer Tätigkeiten verlangen, und ab bestimmten " +
              "Betriebsgrößen muss über Entgeltunterschiede berichtet werden.",
            "Das ist eine Aufgabe, die sich schlecht einmalig erledigen lässt. Sie " +
              "wiederholt sich, sie braucht saubere Daten, und die Auswertung muss " +
              "nachvollziehbar bleiben — der klassische Fall für ein Produkt statt für " +
              "eine Tabelle.",
          ],
        },
        {
          heading: "Was wir gebaut haben",
          paragraphs: [
            "Gebaut wurde ein komplettes SaaS zur EU-Entgelttransparenzrichtlinie, " +
              "inklusive Bezahlsystem und Abrechnung. Von null auf live in zwei Monaten.",
            "Dass Bezahlung und Abrechnung dazugehören, ist der Teil, der solche Projekte " +
              "üblicherweise aufhält: Ein Produkt, das rechnen kann, aber kein Geld " +
              "einnimmt, ist kein Produkt. Beides war zum Livegang fertig.",
          ],
        },
        {
          heading: "Wo es läuft",
          paragraphs: [
            "Das Ergebnis steht öffentlich unter klargehalt.de und ist der belastbarste " +
              "Beleg, den dieser Fall hat: keine Beschreibung eines Projekts, sondern das " +
              "Produkt selbst.",
            "Inzwischen arbeiten über 20 Nutzer im Enterprise-Tarif damit. Das ist der " +
              "Unterschied zwischen einem Produkt, das fertig geworden ist, und einem, " +
              "das benutzt wird.",
          ],
        },
      ],
      phases: [],
      metrics: [
        { value: "2 Monate", label: "von null auf live" },
        { value: "20+", label: "Enterprise-Nutzer" },
      ],
      stack: [],
      quote: null,
    },
  },
  {
    slug: "niimmo-portal",
    company: "NiImmo Wohnungsbaugesellschaft",
    logo: "/images/referenzen/logos/niimmo.png",
    liveUrl: "https://dashboard.niimmo.de",
    companyUrl: "https://niimmo.de",
    person: {
      name: "Dennis Mikyas",
      role: null,
      photo: null,
    },
    rating: 5,
    // Belegt: identischer Wortlaut wie in src/data/testimonials.ts.
    review: "Hier versteht jemand die Nutzung von KI.",
    kategorie: "Kundenportal",
    headline: { value: "1,5", label: "Vollzeitstellen an eingespartem Aufwand" },
    summary:
      "Nach 40 Tagen lief die gesamte Objekt- und Kundenverwaltung in einem Portal.",
    duration: "40 Tage bis live",
    before: null,
    after: null,
    extra: null,
    openPoints: [
      "Ausgangslage beim Kunden nicht dokumentiert",
      "Eingesetzte Technik nicht dokumentiert",
    ],
    detail: {
      intro:
        "In 40 Tagen ein komplettes Portal für die gesamte Objekt- und Kundenverwaltung — " +
        "der eingesparte Aufwand entspricht 1,5 Vollzeitstellen.",
      sections: [
        {
          heading: "Was wir gebaut haben",
          paragraphs: [
            "Gebaut wurde ein komplettes Portal für die gesamte Objekt- und " +
              "Kundenverwaltung. Nach 40 Tagen war es live.",
            "„Gesamte“ ist dabei der entscheidende Teil. Objekte und Kunden getrennt zu " +
              "verwalten ist einfach; der Aufwand entsteht dort, wo beides " +
              "zusammengehört und heute noch von Hand zusammengetragen wird. Das Portal " +
              "führt diese Stellen an einem Ort zusammen, statt eine weitere Insel " +
              "danebenzustellen.",
          ],
        },
        {
          heading: "Was dabei herauskam",
          paragraphs: [
            "Der eingesparte Aufwand entspricht 1,5 Vollzeitstellen. Die Zahl beschreibt " +
              "eine Aufwands-Äquivalenz — also die Arbeitszeit, die vorher für diese " +
              "Vorgänge gebunden war und heute nicht mehr anfällt.",
            "Das Portal ist unter dashboard.niimmo.de im Einsatz.",
          ],
        },
      ],
      phases: [],
      metrics: [
        { value: "40 Tage", label: "bis live" },
        { value: "1,5", label: "Vollzeitstellen eingespart" },
      ],
      stack: [],
      /* Belegt: identischer Wortlaut wie in src/data/testimonials.ts, dort mit
         Rolle. Das einzige Zitat, das auf einer Detailseite stehen darf. */
      quote: {
        text: "Hier versteht jemand die Nutzung von KI",
        author: "Dennis Mikyas, Geschäftsführer NiImmo Holding GmbH",
      },
    },
  },
  {
    slug: "zertifizierungsmanagement-portal",
    company: "cert consulting Pane",
    logo: "/images/referenzen/logos/cert-consulting.svg",
    liveUrl: "https://ccp-portal.de",
    companyUrl: null,
    person: {
      name: "Jan Uwe Pane",
      role: null,
      photo: null,
    },
    rating: 5,
    review: null,
    kategorie: "Prozess-Portal",
    headline: { value: "1,2", label: "Vollzeitkräfte an eingespartem Aufwand" },
    summary:
      "Antrag rein, Zertifikat raus — der ganze Weg dazwischen steckt in einem Portal.",
    duration: "60 Tage bis live",
    before: null,
    after: null,
    extra: null,
    openPoints: [
      "Ausgangslage beim Kunden nicht dokumentiert",
      "Eingesetzte Technik nicht dokumentiert",
      "Kein freigegebenes Zitat",
    ],
    detail: {
      intro:
        "In 60 Tagen ein komplettes Zertifizierungsmanagement-Portal — vom Antrag bis " +
        "zum ausgestellten Zertifikat — und 1,2 eingesparte Vollzeitkräfte.",
      sections: [
        {
          heading: "Was wir gebaut haben",
          paragraphs: [
            "Gebaut wurde ein komplettes Zertifizierungsmanagement-Portal, das den " +
              "gesamten Weg vom Antrag bis zum ausgestellten Zertifikat abbildet. Nach " +
              "60 Tagen war es live.",
            "Eine Zertifizierung ist kein Vorgang, sondern eine Kette: Antrag, " +
              "Unterlagenprüfung, Rückfragen, Nachweise, Entscheidung, Ausstellung, " +
              "Ablage. Jede Übergabe dazwischen ist eine Stelle, an der etwas liegen " +
              "bleibt oder doppelt erfasst wird. Das Portal bildet die Kette am Stück " +
              "ab, statt einzelne Schritte zu digitalisieren und die Übergaben von Hand " +
              "zu lassen.",
          ],
        },
        {
          heading: "Was dabei herauskam",
          paragraphs: [
            "Der eingesparte Aufwand entspricht 1,2 Vollzeitkräften — die Arbeitszeit, " +
              "die vorher für diese Bearbeitung gebunden war.",
            "Das Portal ist unter ccp-portal.de im Einsatz.",
          ],
        },
      ],
      phases: [],
      metrics: [
        { value: "60 Tage", label: "bis live" },
        { value: "1,2", label: "Vollzeitkräfte eingespart" },
      ],
      stack: [],
      quote: null,
    },
  },
  {
    slug: "grynia-kundenrecherche",
    company: "Grynia Consulting",
    logo: null,
    liveUrl: null,
    companyUrl: null,
    person: {
      name: "Thomas Grynia",
      role: null,
      photo: "/images/referenzen/portraits/grynia.webp",
    },
    rating: 5,
    review: null,
    kategorie: "Vertriebs-Automatisierung",
    headline: { value: "5 Minuten", label: "für die Leadrecherche, vorher 5 Stunden" },
    summary:
      "Eine automatisierte Kette für die Vermittlung von Arbeitskräften: Die Leadrecherche, die vorher von Hand lief, ist in fünf Minuten erledigt.",
    duration: null,
    before: null,
    after: null,
    extra: null,
    openPoints: [
      "Ausgangslage beim Kunden nicht dokumentiert",
      "Eingesetzte Technik nicht dokumentiert",
      "Kein freigegebenes Zitat",
    ],
    detail: {
      intro:
        "Eine automatisierte Kette für die Vermittlung von Arbeitskräften — die " +
        "Leadrecherche dauert fünf Minuten statt fünf Stunden.",
      sections: [
        {
          heading: "Was wir gebaut haben",
          paragraphs: [
            "Gebaut wurde eine automatisierte Kette für die Leadrecherche in der " +
              "Vermittlung von Arbeitskräften. Der Schritt, der am Anfang jedes " +
              "Vermittlungsvorgangs steht, hat vorher fünf Stunden gebraucht und " +
              "dauert jetzt fünf Minuten.",
            "„Kette“ ist dabei der entscheidende Teil: Recherche besteht nicht aus einem " +
              "Handgriff, sondern aus einer Reihe davon — suchen, prüfen, zuordnen, " +
              "festhalten. Automatisiert man nur einen davon, bleibt die Übergabe " +
              "dazwischen von Hand und der Zeitgewinn verpufft.",
          ],
        },
        {
          heading: "Warum ausgerechnet die Recherche",
          paragraphs: [
            "Es ist die Sorte Aufwand, die in keiner Auswertung auftaucht: Sie " +
              "verschwindet nicht, sie wird nur nicht gezählt. Bezahlt wird eine " +
              "Vermittlung für die Vermittlung, nicht für das Zusammensuchen von " +
              "Informationen davor.",
            "Genau deshalb ist sie eine gute erste Stelle für Automatisierung — sie " +
              "liegt am Anfang, sie wiederholt sich, und der Gewinn ist sofort " +
              "sichtbar.",
          ],
        },
      ],
      phases: [],
      metrics: [
        { value: "5 Minuten", label: "für die Leadrecherche" },
        { value: "5 Stunden", label: "die sie vorher gebraucht hat" },
      ],
      stack: [],
      quote: null,
    },
  },
  {
    slug: "nereo-claude-code",
    company: "Nereo",
    logo: "/images/referenzen/logos/nereo.svg",
    liveUrl: null,
    companyUrl: null,
    person: {
      name: "Mike Letzgus",
      role: null,
      /* Foto am 09.09.2026 von Ayham geliefert (Shooting-Aufnahme), hier
         freigestellt und auf Kopf bis Brust beschnitten. */
      photo: "/images/referenzen/portraits/mike-letzgus.webp",
    },
    rating: 5,
    review: null,
    kategorie: "Claude-Code-Setup",
    headline: { value: "3 Wochen", label: "Setup bei Nereo, fertig zum Arbeiten" },
    summary:
      "Für Nereo eine Arbeitsumgebung aufgesetzt, feste Regeln hinterlegt und Automatisierungen für den Alltag gebaut.",
    duration: null,
    before: null,
    after: null,
    extra: null,
    openPoints: [
      "Ausgangslage beim Kunden nicht dokumentiert",
      "Eingesetzte Technik nicht dokumentiert",
      "Kein freigegebenes Zitat",
    ],
    detail: {
      intro:
        "In drei Wochen ein komplettes Claude-Code-Setup: Arbeitsumgebung, Regeln und " +
        "Automatisierungen für den täglichen Einsatz.",
      sections: [
        {
          heading: "Was wir gebaut haben",
          paragraphs: [
            "Aufgesetzt wurde ein komplettes Claude-Code-Setup: Arbeitsumgebung, Regeln " +
              "und Automatisierungen für den täglichen Einsatz. Nach drei Wochen stand es.",
            "Die Arbeitsumgebung legt fest, womit gearbeitet wird und worauf zugegriffen " +
              "werden darf. Die Regeln halten schriftlich fest, wie hier gearbeitet wird " +
              "und was ohne Rückfrage passieren darf. Die Automatisierungen übernehmen " +
              "die wiederkehrenden Handgriffe.",
          ],
        },
        {
          heading: "Warum drei Wochen und nicht drei Tage",
          paragraphs: [
            "Der Zugang selbst ist an einem Nachmittag eingerichtet. Die Zeit geht in " +
              "den Teil, den man nicht kaufen kann: die Regeln so zu fassen, dass sie zur " +
              "tatsächlichen Arbeitsweise passen, und die Automatisierungen so zu bauen, " +
              "dass sie auch dann noch laufen, wenn niemand daneben sitzt.",
            "Ohne diesen Teil bleibt ein Sprachmodell ein besserer Chat — hilfreich, " +
              "aber ohne Wirkung auf den Ablauf.",
          ],
        },
      ],
      phases: [],
      metrics: [{ value: "3 Wochen", label: "bis zum fertigen Setup" }],
      stack: [],
      quote: null,
    },
  },
  {
    slug: "ziemann-mailautomatisierung",
    company: "Martin Ziemann Agrargesellschaft",
    logo: null,
    liveUrl: null,
    /* Bewusst null: Unter ziemann-agrar.de antwortet zwar ein Server, die Seite
       trägt aber weder einen Titel noch eine Erwähnung von Lockstedt oder
       Martin Ziemann. Damit ist nicht belegt, dass es dieselbe Firma ist — und
       eine falsch verlinkte Firma ist schlimmer als keine Verlinkung. */
    companyUrl: null,
    /* Martin Ziemann ist als Person benannt und steht selbst für den Betrieb —
       damit tragen die Sterne einen konkreten Absender statt nur die Firmierung,
       die ohnehin noch zu klären ist. Kein Foto: keins vorliegend, die Karte
       setzt dann Initialen. */
    person: { name: "Martin Ziemann", role: null, photo: null },
    /* Fünf Sterne auf Ansage Ayham (07.09.2026), Grundlage mündlich — siehe die
       ausführliche Begründung am Feld `rating` oben. */
    rating: 5,
    stattSterne: null,
    review: null,
    kategorie: "Mail-Automatisierung",
    headline: { value: "2 Wochen", label: "vom Auftrag bis zum laufenden Server" },
    summary:
      "Ein eigener Linux-Server für die Mail-Automatisierung, nach zwei Wochen betriebsbereit — übergeben zusammen mit einer n8n-Schulung, damit der Betrieb im Haus bleibt.",
    duration: "2 Wochen bis betriebsbereit",
    before: null,
    after: null,
    extra: null,
    /*
     * ⚠️ Dieser Fall belegt **nicht** die Microsoft-Positionierung. Linux, n8n
     * und ein eigener Mailserver sind das Gegenteil des Power-Platform-Stacks.
     * Er steht hier, weil er ein echter Fall ist — nicht als Beleg für etwas,
     * das er nicht zeigt. Wer ihn dafür heranzieht, belegt eine Aussage mit
     * einem Gegenbeispiel.
     */
    openPoints: [
      "Genaue Firmierung ungeklärt — im Register stehen mehrere Gesellschaften auf Martin Ziemann",
      "Freigabe des Kundennamens nicht schriftlich bestätigt",
      "Was die Mail-Automatisierung konkret leistet — nicht dokumentiert",
      "Bewertung nur mündlich — nicht schriftlich belegbar",
      "Kein freigegebenes Zitat",
    ],
  },
];

/**
 * Wohin der Klick auf eine Kundenkarte fuehrt — eine Entscheidung fuer alle
 * Einbaustellen (Laufband auf der Startseite, Uebersicht unter /referenzen).
 *
 * Stuende sie zweimal im Code, koennte dieselbe Karte an der einen Stelle auf
 * die Detailseite und an der anderen nach draussen fuehren.
 */
export function kartenLink(result: ClientResult): { href: string; extern: boolean } {
  if (result.klickZiel === "live" && result.liveUrl) {
    return { href: result.liveUrl, extern: true };
  }
  return { href: `/referenzen/${result.slug}`, extern: false };
}

/**
 * Die Faelle, die auf der STARTSEITE erscheinen — Reihenfolge = Reihenfolge im
 * Raster (zwei Spalten, also Index 1 = oben rechts).
 *
 * Abgeleitet aus `clientResults`, damit beide Listen nicht auseinanderlaufen:
 * wer einen Fall ergaenzt, hat ihn automatisch auch hier. Ausgeblendet wird
 * ausschliesslich ueber `hideOnHome` am jeweiligen Eintrag.
 */
export const homeClientResults: ClientResult[] = clientResults.filter(
  (result) => !result.hideOnHome
);
