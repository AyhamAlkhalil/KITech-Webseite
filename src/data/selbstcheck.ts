/**
 * Die acht Pruefpunkte des EU-AI-Act-Selbstchecks und ihre Auswertung.
 *
 * Getrennt von der Darstellung, weil dieselben Werte seit dem 18.09.2026 an
 * **drei** Stellen gebraucht werden: die View stellt die Fragen, die Route
 * `/api/selbstcheck` wertet sie noch einmal serverseitig aus, und der
 * PDF-Bauer schreibt sie in die Auswertung. Stuenden sie weiter nur in der
 * View, waere die Zahl im PDF frueher oder spaeter eine andere als die, die
 * der Besucher beantwortet hat — und niemand haette es gemerkt, weil der
 * Besucher das Ergebnis nicht mehr zu sehen bekommt.
 *
 * ⚠️ **Die Reihenfolge der Fragen ist Teil der Daten.** Der Client schickt nur
 * die Antworten als Liste, kein Frage-Label — wer hier eine Frage einschiebt
 * oder umstellt, verschiebt die Zuordnung in jeder PDF, die danach entsteht.
 * Kommt eine Frage dazu, gehoert sie ans Ende.
 */

export type Antwort = "yes" | "no" | "unsure";

export interface Frage {
  /** Kurzlabel fuer Fortschritt und Ergebnisliste */
  label: string;
  /** Die eigentliche Frage */
  text: string;
  /** Fundstelle in der Verordnung bzw. was konkret zaehlt */
  note: string;
  /** Doppelt gewichtet, wo eine Luecke in der Praxis zuerst auffaellt */
  weight: 1 | 2;
}

export const FRAGEN: Frage[] = [
  {
    label: "KI-Kompetenz",
    text: "Sind alle Mitarbeitenden, die KI-Werkzeuge im Alltag nutzen, nachweislich geschult?",
    note: "Art. 4 verlangt KI-Kompetenz seit dem 2. Februar 2025 — für ChatGPT & Co. genauso wie für eingebaute Copilot-Funktionen.",
    weight: 2,
  },
  {
    label: "Nachweise",
    text: "Könnten Sie diese Schulungen morgen früh belegen, wenn eine Behörde fragt?",
    note: "Gefragt sind Nachweise je Person, datiert und archiviert — nicht eine Teilnehmerliste im Postfach.",
    weight: 2,
  },
  {
    label: "Richtlinie",
    text: "Gibt es eine schriftliche Regelung, welche KI-Werkzeuge wofür eingesetzt werden dürfen?",
    note: "Versioniert, im Unternehmen bekannt und auffindbar. Eine mündliche Absprache zählt nicht.",
    weight: 1,
  },
  {
    label: "Inventar",
    text: "Wissen Sie, welche KI-Anwendungen im Unternehmen tatsächlich im Einsatz sind?",
    note: "Inklusive der KI-Funktionen, die in bestehender Software mitgeliefert werden, und ihrer Risiko-Einstufung.",
    weight: 2,
  },
  {
    label: "Vertraulichkeit",
    text: "Ist ausgeschlossen, dass vertrauliche Daten in Prompts öffentlicher Sprachmodelle landen?",
    note: "Geheimhaltungs- und Datenschutzpflichten gelten unverändert weiter, auch wenn das Werkzeug neu ist.",
    weight: 2,
  },
  {
    label: "Verbotene Praktiken",
    text: "Haben Sie geprüft, ob eine Ihrer Anwendungen unter die verbotenen Praktiken fällt?",
    note: "Art. 5 verbietet unter anderem Emotionserkennung am Arbeitsplatz und Social Scoring — ohne Übergangsfrist.",
    weight: 1,
  },
  {
    label: "Transparenz",
    text: "Erfahren Kunden und Mitarbeitende, wenn sie mit einem KI-System zu tun haben?",
    note: "Art. 50 verlangt Offenlegung bei Chatbots, KI-generierten Inhalten und automatisierten Entscheidungen.",
    weight: 1,
  },
  {
    label: "Aktualität",
    text: "Gibt es einen festen Termin, an dem all das überprüft und nachgezogen wird?",
    note: "Neue Werkzeuge und neue Fristen entwerten den Stand von gestern. Ein Quartalsrhythmus reicht meist aus.",
    weight: 1,
  },
];

export const MAX_PUNKTE = FRAGEN.reduce((summe, frage) => summe + frage.weight, 0);

export const ANTWORT_OPTIONEN: { value: Antwort; label: string; hint: string }[] = [
  { value: "yes", label: "Ja", hint: "Belegbar vorhanden" },
  { value: "no", label: "Nein", hint: "Fehlt oder unvollständig" },
  { value: "unsure", label: "Weiß ich nicht", hint: "Zählt wie eine offene Lücke" },
];

/** Wie eine Antwort in Auswertung und PDF heisst. */
export const ANTWORT_LABEL: Record<Antwort, string> = {
  yes: "Erfüllt",
  unsure: "Unklar",
  no: "Offen",
};

/**
 * Die drei Ergebnis-Baender. Ohne Farben: die trug frueher dieselbe Konstante,
 * aber seit die Auswertung im PDF landet und nicht mehr auf dem Bildschirm,
 * haben CSS-Variablen hier nichts mehr zu suchen.
 */
export const BAENDER = {
  solid: {
    label: "Tragfähig",
    headline: "Tragfähig — aber noch nicht lückenlos belegbar.",
    body: "Der Betrieb ist im Griff. Was in einer Prüfung zählt, ist trotzdem etwas anderes: der Nachweis je Person und je Werkzeug, ohne Suchen. Genau dieser letzte Schritt fehlt in den meisten Unternehmen.",
  },
  partial: {
    label: "Lückenhaft",
    headline: "Mehrere Pflichten sind noch nicht belegbar.",
    body: "Einiges läuft, anderes existiert nur im Kopf. Ohne strukturierten Nachweis wird daraus in einer Prüfung ein Befund — mit Bußgeld- und Haftungsfolge. Der Aufwand, das zu ordnen, ist überschaubar; der Zeitpunkt ist jetzt.",
  },
  critical: {
    label: "Kritisch",
    headline: "Zentrale Pflichten sind offen.",
    body: "Die Grundlagen fehlen noch — Schulung, Inventar, Nachweis. Das ist der Stand, mit dem die meisten Unternehmen starten, und er lässt sich in wenigen Wochen ordnen. Ungeklärt bleibt er ein reales Risiko.",
  },
} as const;

export type BandSchluessel = keyof typeof BAENDER;

export interface Auswertung {
  /** 0 bis 100, gewichtet nach `weight`. */
  prozent: number;
  /** Indizes der mit „Nein" beantworteten Fragen. */
  offen: number[];
  /** Indizes der mit „Weiß ich nicht" beantworteten Fragen. */
  unklar: number[];
  band: BandSchluessel;
}

/**
 * Rechnet aus den Antworten das Ergebnis.
 *
 * Fehlende Antworten zaehlen wie „Nein" — die Route laesst zwar keine
 * unvollstaendige Liste durch, aber die Funktion soll auch dann eine
 * belastbare Zahl liefern und nicht `NaN`.
 */
export function werteAus(antworten: (Antwort | undefined)[]): Auswertung {
  let punkte = 0;
  const offen: number[] = [];
  const unklar: number[] = [];

  FRAGEN.forEach((frage, i) => {
    const antwort = antworten[i];
    if (antwort === "yes") punkte += frage.weight;
    else if (antwort === "unsure") unklar.push(i);
    else offen.push(i);
  });

  const prozent = Math.round((punkte / MAX_PUNKTE) * 100);
  /* ⚠️ `unklar` schliesst „Tragfähig" **nicht** aus, nur `offen`. Wer eine
     einfach gewichtete Frage mit „Weiß ich nicht" beantwortet und sonst alles
     mit Ja, kommt auf 92 % und landet in `solid` — obwohl die Antwortoption
     dem Ausfüllenden sagt, sie „zählt wie eine offene Lücke".

     Das ist der Stand seit dem Relaunch (`72c8d9f`) und beim Umbau auf den
     Mailversand am 18.09.2026 bewusst unverändert geblieben: Die Bewertung ist
     die fachliche Aussage des Werkzeugs, nicht Teil des Versandwegs. Der
     Band-Text federt es ab („aber noch nicht lückenlos belegbar").
     Offen zur Entscheidung — wer `unklar.length === 0` ergänzt, verschiebt die
     Einstufung jedes Ausfüllenden, der irgendwo unsicher war. */
  const band: BandSchluessel =
    prozent >= 85 && offen.length === 0 ? "solid" : prozent >= 50 ? "partial" : "critical";

  return { prozent, offen, unklar, band };
}
