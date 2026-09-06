/**
 * Was wir im Microsoft-Umfeld bauen — die Bauweise, nicht einzelne Kundenfälle.
 * Gezeigt von `components/sections/MicrosoftLoesungen.tsx` auf `/referenzen`.
 *
 * ## Warum es diese Datei gibt und warum sie NICHT `client-results.ts` ist
 *
 * Die Positionierung steht seit dem 04.09.2026 auf Power Automate, Power BI und
 * Dynamics 365 — belegt ist sie durch keinen einzigen Fall in
 * `client-results.ts`. Das ist der offene Punkt „Microsoft-Referenzen fehlen"
 * in CLAUDE.md.
 *
 * Auf Ansage vom 04.09.2026 sollten dort zunächst „zwei, drei Fake-Referenzen"
 * mit Power Automate und CRM hinein. Nach Rückfrage entschieden: **stattdessen
 * dieser Block.** Der Grund ist nicht Vorsicht, sondern Haftung — eine
 * erfundene Kundenreferenz ist eine irreführende geschäftliche Handlung nach
 * § 5 Abs. 1, Abs. 2 Nr. 3 UWG, und mit Bewertung oder Sternen fiele sie unter
 * die Schwarze Liste (Anhang zu § 3 Abs. 3 Nr. 23c UWG), die **ohne
 * Interessenabwägung** greift. Dieselbe Grenze steht seit dem 19.08.2026
 * ausführlich im Kopf von `client-results.ts`; sie hier zu unterlaufen, hätte
 * sie dort wertlos gemacht.
 *
 * ⚠️ **Die Trennung ist die ganze Idee.** Was hier steht, ist eine Aussage über
 * *uns* — wie wir solche Ketten bauen. Was in `client-results.ts` steht, ist
 * eine Aussage über einen *Kunden*. Wer einen Eintrag von hier nach dort
 * verschiebt und ihm einen Firmennamen gibt, macht aus dem einen das andere.
 *
 * ## Regeln für Einträge
 *
 *   - **Keine Kennzahlen.** Kein „spart 12 Stunden", kein „40 % schneller".
 *     Eine Zahl ohne gemessenes Projekt dahinter ist genau die Behauptung, die
 *     dieser Block vermeidet. `wasSichAendert` beschreibt den Zustand, nicht
 *     den Gewinn.
 *   - **Kein Kunde, keine Branche, kein „ein Kunde von uns".** Auch nicht
 *     angedeutet.
 *   - **Nur Ketten, die wir tatsächlich so bauen.** Jeder Schritt in `aufbau`
 *     muss mit den genannten Produkten ohne Zwischenschicht gehen — das ist die
 *     Stelle, an der ein Einkäufer mit Power Platform im Haus nachfragt.
 *   - **Produktnamen zeichengenau** (`stack-marken.test.ts` prüft dieselbe
 *     Schreibweise im Hero): Dynamics 365 Sales, Power Automate, Power BI,
 *     Power Apps, Dataverse, SharePoint, Microsoft Teams, Azure.
 */

export interface MicrosoftLoesung {
  /** Kurzes Kürzel, nur als React-Key und Anker. */
  id: string;
  /** Der Aufbau in einer Zeile — als Aussage, nicht als Schlagwort. */
  titel: string;
  /** Die Aufgabe, die dahintersteht. Ein Satz. */
  aufgabe: string;
  /** Die Kette, Schritt für Schritt. Drei bis vier Punkte. */
  aufbau: string[];
  /** Eingesetzte Produkte, zeichengenau. */
  werkzeuge: string[];
  /** Wie der Zustand danach aussieht — ohne Kennzahl, ohne Versprechen. */
  wasSichAendert: string;
}

export const microsoftLoesungen: MicrosoftLoesung[] = [
  {
    id: "angebotsfreigabe",
    titel: "Angebotsfreigaben, die im CRM stattfinden statt im Postfach",
    aufgabe:
      "Ab einer bestimmten Summe braucht ein Angebot die Freigabe der Leitung. Läuft " +
      "das über Mail, steht die Entscheidung danach in einem Postfach und nicht am Vorgang.",
    aufbau: [
      "Power Automate hört auf den Angebotsdatensatz in Dataverse und startet, sobald der Betrag die hinterlegte Grenze überschreitet.",
      "Die Anfrage geht als Adaptive Card in Microsoft Teams an die zuständige Person — mit Kunde, Summe, Marge und den beiden Knöpfen darin.",
      "Die Antwort schreibt der Ablauf zurück auf den Datensatz in Dynamics 365 Sales: Status, wer entschieden hat, wann.",
      "Das freigegebene Angebot landet als PDF in der SharePoint-Bibliothek des Vorgangs, verknüpft mit demselben Datensatz.",
    ],
    werkzeuge: ["Dynamics 365 Sales", "Power Automate", "Microsoft Teams", "SharePoint"],
    wasSichAendert:
      "Wer den Vorgang öffnet, sieht die Freigabe daran hängen — samt Name und Zeitpunkt. " +
      "Niemand muss ein Postfach durchsuchen, um zu belegen, dass sie erteilt wurde.",
  },
  {
    id: "rechnungseingang",
    titel: "Rechnungseingang, der sich selbst sortiert",
    aufgabe:
      "Rechnungen kommen als PDF in ein Sammelpostfach. Jemand öffnet sie, tippt " +
      "Nummer, Datum und Betrag ab und legt sie in den richtigen Ordner.",
    aufbau: [
      "Power Automate zieht neue Anhänge aus dem freigegebenen Outlook-Postfach, sobald sie eintreffen.",
      "Azure AI Document Intelligence liest Lieferant, Rechnungsnummer, Datum, Netto und Steuer aus dem PDF.",
      "Was eindeutig ist, wird in SharePoint abgelegt und in der Liste eingetragen — benannt nach Lieferant und Nummer.",
      "Was unklar bleibt — schlecht gescannt, unbekannter Lieferant, abweichender Betrag — geht in eine Prüfliste in Power Apps, statt still falsch abgelegt zu werden.",
    ],
    werkzeuge: ["Power Automate", "Azure AI Document Intelligence", "SharePoint", "Power Apps"],
    wasSichAendert:
      "Abgetippt wird nur noch der Rest, der wirklich unklar ist. Und dieser Rest ist " +
      "sichtbar, statt sich unter den erledigten Fällen zu verstecken.",
  },
  {
    id: "vertriebsbericht",
    titel: "Ein Vertriebsbericht, den niemand mehr baut",
    aufgabe:
      "Die Zahlen liegen in Dynamics, im ERP und in ein paar Tabellen. Einmal im " +
      "Monat setzt sie jemand von Hand zu einer Auswertung zusammen.",
    aufbau: [
      "Power BI liest Dataverse direkt und holt die übrigen Quellen über eine geplante Aktualisierung dazu.",
      "Kennzahlen und Zeiträume liegen im Datenmodell, nicht in einzelnen Berichten — eine Definition, überall dieselbe Zahl.",
      "Zugriff über die Rechte, die schon gelten: Row-Level-Security nach Gebiet, angebunden an Microsoft Entra ID.",
      "Der Versand läuft als Abo aus Power BI heraus, zum festen Termin, ohne dass jemand exportiert.",
    ],
    werkzeuge: ["Power BI", "Dataverse", "Dynamics 365 Sales", "Azure"],
    wasSichAendert:
      "Die Auswertung ist am Stichtag da, und alle sehen dieselbe. Diskussionen darüber, " +
      "wessen Datei die aktuelle ist, entfallen — es gibt keine Datei mehr.",
  },
];
