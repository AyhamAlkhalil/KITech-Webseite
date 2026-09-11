/**
 * Die vier Fragen unter dem Gründerwort auf der Startseite.
 *
 * **Auf Ansage (14.08.2026)** ausgewählt: die Einwände, die im Gespräch als
 * erstes kommen — Preis, Dauer, „lohnt sich das bei uns überhaupt", Daten,
 * und was nach dem Projekt passiert. Am 04.09.2026 kam die Microsoft-Frage
 * dazu (Ansage): Bei Unternehmen mit Microsoft-Landschaft ist „passt ihr zu
 * unserem System" der Einwand, der vor allen anderen steht — und er entscheidet,
 * ob überhaupt weitergelesen wird.
 *
 * **Jede Antwort ist im Repo belegt** und nicht neu erfunden:
 *
 *   | Frage      | Beleg                                                    |
 *   |------------|----------------------------------------------------------|
 *   | Kosten     | `src/config/angebot.ts` (kostenlos, 30 Min), `services[0]` |
 *   | Dauer      | `src/data/client-results.ts` (40 Tage, 60 Tage, 2 Monate) |
 *   | Microsoft  | `techStack` und `services[2]` in `src/data/services.ts`   |
 *   | Daten      | `services[3]` (EU-Region über Azure/AWS mit AVV, eigene Hardware) |
 *
 * **Gekürzt am 17.08.2026, auf Ansage:** „Auch die FAQs sind ein bisschen zu
 * lang. Die Texte wirklich einfach, so einfach wie es geht." Jede Antwort steht
 * jetzt in ein bis zwei Sätzen (vorher drei bis vier), zusammen rund 90 statt
 * 190 Wörter. Gestrichen wurde nur Ausschmückung, kein Beleg: die Zahlen und
 * die EU-Region samt Auftragsverarbeitungsvertrag stehen unverändert drin. Zwei
 * Fragen sind selbst kürzer geworden („Wie lange dauert es?" statt „… bis etwas
 * läuft?").
 *
 * **Die Länge ist Teil der Sache.** Wer eine Antwort ergänzt, ergänzt einen
 * Satz — keinen Absatz. Eine FAQ, die man lesen muss, beantwortet nichts.
 *
 * **Am 11.09.2026 von sechs auf vier Fragen** (Ansage: „So viel Text. Das muss
 * alles viel kürzer und knackiger werden."). Geblieben sind Preis, Dauer,
 * Microsoft und Daten. Gestrichen:
 *
 *   - „Was, wenn sich KI bei uns nicht lohnt?" — dieselbe Zusage steht als
 *     Schritt 2 im Abschlussblock („Wo sich Automatisierung rechnet — und wo
 *     eine einfachere Lösung reicht", `data/check-einladung.ts`).
 *   - „Und wenn das Projekt fertig ist?" — Code-Eigentum und Wartung stehen
 *     ausführlich auf `/leistungen`, wohin die Weiche direkt darüber führt.
 *
 * ⚠️ Beide Antworten sind **nur von der Startseite** weg, nicht aus dem
 * Angebot. Wer sie vermisst, holt sie sich von der Zielseite — nicht aus einer
 * neu erfundenen Formulierung.
 *
 * ⚠️ **Keine Preise erfinden.** Zu Projektpreisen liegt im Repo keine Zahl vor,
 * deshalb steht in der Antwort auch keine. Wer hier einen Betrag einträgt, muss
 * ihn halten können — eine Preisangabe auf der Website ist eine Zusage.
 *
 * Die Fragen gehen zusätzlich als `FAQPage`-Schema an Google (siehe
 * `getFAQSchema` in `src/components/seo/StructuredData.tsx`). Deshalb gilt:
 * **Antworten hier müssen wortgleich auf der Seite stehen** — Google verlangt,
 * dass ausgezeichneter Inhalt sichtbar ist. Genau deshalb speist eine Quelle
 * beides.
 */

export interface FaqEintrag {
  frage: string;
  antwort: string;
}

export const faq: FaqEintrag[] = [
  {
    frage: "Was kostet das?",
    antwort:
      "Der 1:1-KI-Check kostet nichts. Den Projektpreis nennen wir nach dem Prozess-Audit.",
  },
  {
    /* Die drei Zahlen sind der Beleg dieser Antwort und stehen so in
       `client-results.ts`. Beim Kürzen fällt Fülltext, nie ein Beleg. */
    frage: "Wie lange dauert es?",
    antwort:
      "Wochen, keine Quartale: NiImmo-Portal nach 40 Tagen live, cert consulting nach 60, eine komplette SaaS-Anwendung nach zwei Monaten.",
  },
  {
    frage: "Wir arbeiten mit Microsoft — passt das?",
    antwort:
      "Unser Feld: Power Automate, Power BI, Dynamics 365 und Power Apps, angebunden an Microsoft 365 und Azure.",
  },
  {
    frage: "Was passiert mit unseren Daten?",
    antwort:
      "Europäische Region mit Auftragsverarbeitungsvertrag oder eure eigene Hardware. Ihr entscheidet, nicht der Anbieter.",
  },
];
