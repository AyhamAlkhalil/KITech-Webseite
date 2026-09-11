/**
 * Das Gründerwort unter dem Kundenlaufband auf der Startseite.
 *
 * **Auf Ansage (14.08.2026):** Unter den Referenzen soll etwas stehen, und es
 * soll Ayham sein — bei dieser Zielgruppe trägt die Person, nicht die Firma.
 *
 * **Woher die Texte kommen:**
 *
 *   - `zitat` ist von Ayham und steht wortgleich auf `/haltung`
 *     (`src/views/Haltung.tsx`). Das ist Absicht: eine Aussage, die auf zwei
 *     Seiten steht, wirkt wie eine Haltung; zwei verschiedene wirken wie
 *     Werbetexte. Wer es hier ändert, ändert es dort mit.
 *   - `absaetze` ist ein **Entwurf** und der einzige Text auf dieser Seite, der
 *     nicht belegt ist. Er sagt nichts, was nicht anderswo im Repo steht
 *     (Prozess-Audit zuerst, Betrieb im Tagesgeschäft, der Code gehört euch) —
 *     aber es sind nicht Ayhams Worte.
 *
 * **Gekürzt am 17.08.2026, auf Ansage:** „Das ist mit meinem Zitat alles ein
 * bisschen zu lang, das liest kein Mensch mehr. Die Texte wirklich einfach, so
 * einfach wie es geht." Der ganze Block ist von rund 170 auf rund 55 Wörter
 * heruntergegangen:
 *
 *   - Das Zitat behält Ayhams Bilder und seinen Satzbau, verliert aber den
 *     Umweg („in Projekte gehen, die … und nie in der Bilanz ankommen" →
 *     „enden statt in der Bilanz"). **Nicht neu formulieren** — kürzen heißt
 *     hier streichen, nicht umschreiben.
 *   - Aus zwei Absätzen von je vier Zeilen sind zwei Sätze geworden. Was
 *     wegfiel (an welcher Stelle sich Automatisierung lohnt, wo die Daten
 *     liegen), steht direkt darunter in der FAQ — es stand also zweimal da.
 *
 * **Zweite Kürzung am 11.09.2026, auf Ansage:** „Das wirkt zu plump, wird
 * einfach hingeklatscht. Mach den Satz kürzer, radikaler." Der Vorspann „Ich
 * habe zu oft gesehen, wie …" ist weg, die Aussage beginnt jetzt bei der Zahl.
 * „Mittelstand kann sich das nicht leisten" ist zu „Das kann sich kein
 * Mittelständler leisten" geworden — dieselbe Aussage, aber an eine Person
 * gerichtet statt an eine Branche. Die Fassung hat Ayham selbst gewählt; wer
 * sie erneut anfasst, braucht wieder seine Ansage.
 *
 * Die Darstellung zog am selben Tag mit („mach das irgendwie zu mehr
 * Highlights") — größer gesetzt, mit Signalstrich darüber. Sie steht in
 * `components/sections/Gruenderwort.tsx`.
 *
 * ⚠️ **Offen:** `absaetze` durch Ayhams Wortlaut ersetzen. Nur diese Datei
 * anfassen, die Komponente bleibt unberührt. Wer sie ersetzt, hält die Länge:
 * ein Satz pro Absatz.
 */

export interface Gruenderwort {
  /**
   * Überschrift des Abschnitts — **unsichtbar**, nur für Screenreader und die
   * Dokumentgliederung. Sichtbar trägt das Zitat den Block. Eine kleine Zeile
   * über einer Überschrift wäre genau das Label-Muster, das auf dieser Website
   * nicht gebaut wird. Genauso macht es `/haltung`.
   */
  ueberschrift: string;
  /** Der Satz, der trägt. Wörtlich von Ayham, identisch zu `/haltung`. */
  zitat: string;
  /** Zwei bis drei kurze Absätze darunter. Siehe Warnung oben. */
  absaetze: string[];
  /** Was unter dem Namen steht, statt eines weiteren Knopfes. */
  abschluss: string;
  /** Überschrift über den Kacheln. Sichtbar, aber klein. */
  teamUeberschrift: string;
  /**
   * Wer gezeigt wird — Namen wie in `src/data/team.ts`, in dieser Reihenfolge.
   *
   * **Auf Ansage (14.08.2026):** „Da, wo mein Bild auftaucht, gerne auch mein
   * Team anzeigen … Alle nebeneinander auch — nicht nur mich so prominent
   * darstellen!"
   *
   * Deshalb steht Ayham **in derselben Reihe** und nicht mehr als großes
   * Portrait daneben: gleich breite Kacheln, gleiche Bildhöhe, keine
   * Auszeichnung für den Gründer.
   *
   * ⚠️ **Leon stand am 23.08.2026 kurzzeitig nicht mehr hier.** Die Ansage
   * „Leon soll überall raus. Er ist kein Geschäftsführer!" war zu weit
   * ausgelegt worden — gemeint war allein die Zeile „Vertreten durch" im
   * Impressum. Am 26.08.2026 richtiggestellt: Er ist Mitarbeiter
   * (Technischer Manager) und steht hier, in `team.ts` und in
   * `content/seo/autoren.json`. Nur im Impressum nicht.
   *
   * Jennifer (Werkstudentin Backoffice) ist bewusst nicht dabei. Wer sie
   * ergänzen will, trägt hier den Namen ein — Foto, Rolle und Satz kommen
   * automatisch aus `team.ts`. Ab vier Namen bricht das Raster auf zwei
   * Zeilen um, das trägt es.
   */
  teamNamen: string[];
  /**
   * Die Einladung unter der Teamliste — führt auf `/karriere`.
   *
   * **Auf Ansage (17.08.2026):** „mach auch gerne so einen Button, ob jemand
   * dabei sein möchte, also Einladung zur Bewerbung." Eine Frage statt einer
   * Stellenausschreibung: die offenen Stellen stehen auf der Zielseite.
   *
   * ⚠️ `/karriere` steht auf `noindex`, solange die vier Stellen Platzhalter
   * sind (`isPlaceholder` in `src/data/jobs.ts`). Wer hier klickt, landet
   * derzeit also auf Beispielstellen — das ist der offene Punkt an diesem Weg.
   */
  teamEinladung: string;
}

export const gruenderwort: Gruenderwort = {
  ueberschrift: "Wer dahintersteht",

  zitat:
    "Sechsstellige Beträge enden in einer schicken Demo statt in der Bilanz. Das kann sich kein Mittelständler leisten.",

  absaetze: [],

  abschluss: "Im 1:1-KI-Check sprichst du mit mir, nicht mit einem Vertrieb.",

  teamUeberschrift: "Das Team",
  teamNamen: ["Ayham Alkhalil", "Leon Battel", "Jörg Kratzat"],

  teamEinladung: "Du willst dabei sein?",
};
