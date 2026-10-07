import { veroeffentlichteArtikel } from "./laden";
import type { Artikel } from "./schema";

/**
 * Welche Artikel unter welcher Seite stehen — und warum es diese Datei gibt.
 *
 * **Der Befund vom 24.08.2026:** Gemessen über acht Hauptseiten (`/`,
 * `/leistungen`, `/solo`, `/enterprise`, `/haltung`, `/referenzen`,
 * `/kontakt`, `/warum`) stand **kein einziger** Link auf einen Artikel. Der
 * gesamte Wissensbereich hing allein am Hub `/gratis-wissen`. Für eine
 * Suchmaschine heißt das: die Artikel bekommen nichts von der Autorität ab,
 * die auf den Hauptseiten liegt, und ein Crawler, der über die Startseite
 * kommt, braucht zwei Sprünge bis zum ersten Fachtext.
 *
 * Interne Verlinkung ist die einzige Ranking-Ressource, die vollständig in
 * eigener Hand liegt. Sie lag brach.
 *
 * **Warum eine Zuordnung nach Themenbereich und keine Handliste.** Eine feste
 * Liste aus Slugs veraltet mit jedem neuen Artikel, und niemand pflegt sie
 * nach — genau so sind Kopfzeile, Fußzeile und Sitemap vor dem 05.08.2026
 * auseinandergelaufen. Hier steht deshalb pro Seite, welche *Themen* dorthin
 * passen; welcher Artikel das am Ende ist, entscheidet der Bestand. Ein neuer
 * Beitrag im richtigen Bereich erscheint beim nächsten Build von selbst an der
 * passenden Stelle.
 *
 * **Reihenfolge der Themen ist Rangfolge.** Der erste Bereich liefert zuerst;
 * erst wenn er nichts hergibt, kommt der zweite zum Zug. Bleibt danach ein
 * Platz frei, füllt der neueste Artikel auf — eine Seite zeigt lieber einen
 * thematisch nur halb passenden Beitrag als einen leeren Kasten.
 */

/** Was der Darstellungsblock braucht — bewusst nicht der ganze Artikel. */
export type ArtikelTeaser = {
  slug: string;
  titel: string;
  teaser: string;
  kategorie: string;
  lesezeit: number;
};

/**
 * Die Zuordnung. Schlüssel ist der Pfad der Seite, Wert die Themenbereiche in
 * absteigender Passgenauigkeit.
 *
 * `/kontakt` steht bewusst **nicht** hier: Wer dort ist, sucht eine
 * Telefonnummer, keinen Lesestoff. Ein Empfehlungsblock wäre an dieser Stelle
 * eine Ablenkung vom einzigen Zweck der Seite.
 */
const THEMEN_JE_SEITE: Record<string, string[]> = {
  "/": ["ki-strategie", "prozessautomatisierung", "ki-betrieb"],
  "/leistungen": ["prozessautomatisierung", "dokumente-und-belege", "ki-betrieb"],
  "/solo": ["ki-strategie", "dokumente-und-belege", "prozessautomatisierung"],
  "/enterprise": ["ki-betrieb", "ki-und-datenschutz", "prozessautomatisierung"],
  "/haltung": ["ki-strategie", "ki-gestuetzte-entwicklung"],
  "/referenzen": ["ki-gestuetzte-entwicklung", "prozessautomatisierung", "ki-betrieb"],
  "/warum": ["ki-strategie", "prozessautomatisierung"],
};

function alsTeaser(artikel: Artikel): ArtikelTeaser {
  return {
    slug: artikel.slug,
    titel: artikel.titel,
    teaser: artikel.teaser,
    kategorie: artikel.kategorie,
    lesezeit: artikel.lesezeit,
  };
}

/**
 * Die Artikel für eine Seite, in der Reihenfolge, in der sie dort stehen sollen.
 *
 * Läuft **serverseitig** — `veroeffentlichteArtikel()` liest Dateien und kann
 * deshalb nicht in einer Client Component aufgerufen werden. Der Aufruf gehört
 * in `src/app/<pfad>/page.tsx`, das Ergebnis wird als Prop weitergereicht.
 * Deshalb auch der schmale Typ: durch die Client-Grenze geht nur, was der
 * Kasten anzeigt, nicht der komplette Artikel mit allen Abschnitten.
 *
 * Gibt eine leere Liste zurück, wenn es zur Seite nichts gibt — der Block
 * rendert dann gar nicht, statt eine Überschrift ohne Inhalt zu zeigen.
 */
export function empfehlungenFuer(pfad: string, anzahl = 3): ArtikelTeaser[] {
  const themen = THEMEN_JE_SEITE[pfad];
  if (!themen) return [];

  return empfehlungenNachThemen(themen, anzahl);
}

/**
 * Dieselbe Auswahl für eine Seite, die ihre Themen selbst mitbringt statt in
 * `THEMEN_JE_SEITE` zu stehen — derzeit `/vergleich/prozessautomatisierung`.
 * Der Unterschied ist nur der Eintrag: Die Hauptseiten oben stehen unter einem
 * Test, der für jeden Schlüssel eine View mit Empfehlungsblock verlangt.
 */
export function empfehlungenNachThemen(themen: string[], anzahl = 3): ArtikelTeaser[] {
  const alle = veroeffentlichteArtikel();
  const gewaehlt: ArtikelTeaser[] = [];
  const vergeben = new Set<string>();

  for (const thema of themen) {
    for (const artikel of alle) {
      if (gewaehlt.length >= anzahl) break;
      if (artikel.cluster !== thema || vergeben.has(artikel.slug)) continue;
      vergeben.add(artikel.slug);
      gewaehlt.push(alsTeaser(artikel));
    }
  }

  /* Auffüllen mit dem Neuesten, falls die Themen nicht genug hergeben. */
  for (const artikel of alle) {
    if (gewaehlt.length >= anzahl) break;
    if (vergeben.has(artikel.slug)) continue;
    vergeben.add(artikel.slug);
    gewaehlt.push(alsTeaser(artikel));
  }

  return gewaehlt;
}

/** Für den Test: welche Seiten tragen einen Empfehlungsblock? */
export function seitenMitEmpfehlungen(): string[] {
  return Object.keys(THEMEN_JE_SEITE);
}
