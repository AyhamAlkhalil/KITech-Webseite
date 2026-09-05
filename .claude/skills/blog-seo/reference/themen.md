# Der Themen-Vorrat

Themen kommen aus einer gepflegten Liste, nicht aus einer Keyword-API. Das ist die eine
Arbeit an dieser Automatik, die ein Mensch machen muss — und sie ist einmalig statt täglich.

Datei: `content/seo/themen-pool.json`. Typ: `ThemaImVorrat` in
`scripts/blog-engine/lib/typen.ts`. Gelesen von Schritt 01, bewertet von Schritt 02.

**Warum überhaupt ein Vorrat.** Googles Prüfliste für hilfreiche Inhalte nennt als Warnsignal
wörtlich: *„Are you producing lots of content on many different topics in hopes that some of
it might perform well in search results?"* Genau das entsteht, wenn eine Maschine sich ihre
Themen aus Keyword-Vorschlägen zieht. Die Schnittstelle liefert hier ausschließlich **Zahlen
zu Themen, die vorher ein Mensch aufgeschrieben hat.**

---

## Die Felder

| Feld | Pflicht | Wozu |
|---|---|---|
| `id` | ja | Eindeutige Kennung. Steht im Protokoll und in `LaufProtokoll.themen` |
| `arbeitstitel` | ja | Der endgültige Titel entsteht beim Schreiben, aus SERP und Brief |
| `zielKeyword` | ja | Das eine Keyword. Höchstens 80 Zeichen und 10 Wörter, sonst weist die Google-Ads-Schnittstelle **den gesamten Task** ab und alle anderen Kandidaten verlieren ihr Suchvolumen |
| `cluster` | ja | Slug aus `content/seo/cluster.json` |
| `autor` | ja | Slug aus `content/seo/autoren.json`. Nie ein Modell |
| `substanz` | ja, darf `null` sein | Der nicht generierbare Anteil. `null` heißt: wird nicht produziert |
| `prioritaet` | ja | Kleiner ist wichtiger |
| `fruehestens` / `spaetestens` | nein | ISO-Datum. Stichtage und Saison |
| `erledigt` | nein | Slug des entstandenen Artikels. Nimmt das Thema aus dem Rennen |
| `notiz` | nein | Für den nächsten Menschen, der hier reinsieht |
| `aktualitaet` | nein | `{ suche, fenster }` — holt frische Quellen. Siehe unten |

`substanz` trägt zusätzlich ein optionales `material`: Textbausteine, Zahlen oder
Codeausschnitte, die **wörtlich** in den Artikel dürfen, weil ein Mensch sie eingetragen und
damit belegt hat. Alles, was in `material` steht, darf zitiert werden; alles andere muss aus
`quellen` kommen.

---

## Themen, deren Wert an der Aktualität hängt

Ein neues Modell, eine Ankündigung, eine Rechtsänderung von letzter Woche. Dafür trägt das
Thema ein zusätzliches Feld:

```json
"aktualitaet": {
  "suche": "reasoning model release",
  "fenster": "qdr:m"
}
```

`suche` ist **nicht** das Zielkeyword. Das Zielkeyword ist auf Suchvolumen optimiert
(„reasoning modell kosten"), hier braucht es die Formulierung, unter der die Meldung
tatsächlich berichtet wird. `fenster` ist `qdr:d`, `qdr:w` oder `qdr:m` — Schritt 04 warnt,
wenn keine gefundene Quelle mehr hineinfällt.

Was dann passiert: Schritt 04 fragt **vor** der regulären Recherche die Nachrichtenquelle ab
und liest die Treffer. Das läuft unabhängig von DataForSEO — dessen Tagesbudget ist
erfahrungsgemäß genau dann aufgebraucht, wenn man es braucht. Das Erscheinungsdatum geht mit
in den Auftrag an das Modell; ohne es ist eine frische Meldung für ein Modell nicht von einem
alten Ratgebertext zu unterscheiden.

### Aktualität ersetzt Substanz nicht

Das ist der Punkt, an dem diese Sorte Thema kippt. **„Modell X ist erschienen" steht am
selben Tag auf hundert Seiten** — das ist per Definition commodity content, und ein Feld
`aktualitaet` ändert daran nichts. Ein Thema mit `aktualitaet` und `substanz: null` wird
genauso wenig produziert wie jedes andere.

Die Meldung ist der **Anlass**. Der Artikel ist das, was daneben steht:

| Statt | Besser | `substanz.art` |
|---|---|---|
| „Modell X ist da" | „Modell X an unserem eigenen Blog-Prompt gemessen: was sich ändert" | `eigene-messung` |
| „Die Neuerungen im Überblick" | „Was in der Modellkarte steht, das in den Meldungen fehlt" | `primaerquelle` |
| „Was das für Unternehmen bedeutet" | „Warum wir trotzdem beim alten Modell bleiben — die Rechnung" | `architekturentscheidung` |
| „Erste Erfahrungen" | „Der Umstieg hat uns X gekostet, hier ist der Fehler" | `fehlerbericht` |

⚠️ **Das schreibende Modell weiß über die Meldung nichts.** Es kennt nur seinen
Trainingsstand und hält ihn für die Gegenwart. Alles, was im Artikel über das Ereignis steht,
kommt aus den frisch gelesenen Seiten — oder es steht nicht im Artikel. Wer ein
Aktualitätsthema ohne `aktualitaet`-Feld einträgt, bekommt einen Artikel, der sich sicher
anhört und erfunden ist.

---

## Die dreizehn Cluster

Zuordnung: `cluster` im Thema = `slug` in `content/seo/cluster.json`. Volumen- und
Wettbewerbsangaben sind Schätzbänder aus der SERP-Auswertung vom 19.08.2026, keine Tool-Werte
— vor der Redaktionsplanung mit einem Volumen-Werkzeug gegenprüfen.

| Slug | Pillar-Keyword | Wettbewerb | Conversion-Nähe |
|---|---|---|---|
| `prozessautomatisierung` | prozesse automatisieren unternehmen | mittel — viele Agenturblogs, kaum echte Praxis | 4/5 |
| `ki-und-datenschutz` | ki dsgvo konform einsetzen | hoch (Kanzleien) — **die technische Ebene ist frei** | 3/5 |
| `eu-ai-act` | eu ai act unternehmen pflichten | sehr hoch | 3/5, beste Brücke zum Selbstcheck |
| `foerderung-und-finanzierung` | ki förderung mittelstand | mittel, die „Nachfolger"-Terme unbesetzt | 3/5, sehr hohe Lead-Qualität |
| `rag-und-unternehmensdaten` | rag system unternehmen | mittel | 4/5 |
| `ki-agenten` | ki agenten für unternehmen | mittel, viel Hype | 3/5 |
| `ki-gestuetzte-entwicklung` | mit ki programmieren im unternehmen | **niedrig auf Deutsch** | 1–2/5 direkt, höchster Autoritätswert |
| `individualsoftware` | individualsoftware entwickeln lassen | hoch | 5/5 |
| `ki-betrieb` | ki on premise betreiben | niedrig–mittel | 4/5, höchste Auftragswerte |
| `ki-strategie` | ki strategie mittelstand | hoch, inhaltlich generisch | 2–3/5, Top-of-Funnel |
| `dokumente-und-belege` | rechnungsverarbeitung automatisieren | hoch bei Kopf-Keywords, long tail offen | 5/5 |
| `ki-beratung-hannover` | ki beratung hannover | niedrig–mittel lokal | 5/5 |
| `sprachmodelle-im-betrieb` | sprachmodell im unternehmen einsetzen | hoch bei Modellnamen, **die Betriebssicht ist frei** | 3/5 |

Das stärkste Cluster ist `prozessautomatisierung`: hohe Kaufnähe, und jeder Spoke lässt sich
mit einem echten Workflow belegen. Das riskanteste ist `eu-ai-act` — dort steht KITech gegen
Kanzleien, TÜV und Verbände, und dort veralten Zahlen am schnellsten.

`sprachmodelle-im-betrieb` (angelegt 05.09.2026) ist das Zuhause der Themen mit
`aktualitaet`. Gegen den Modellnamen selbst („gpt-6", „gemini 3.8") ist kein Ankommen —
dort schreiben am Erscheinungstag alle. Frei ist die Betriebssicht: was der Wechsel an einer
Stelle kostet, an der schon etwas läuft. Genau die Frage beantwortet keine der Meldungen,
und sie lässt sich nur mit eigenen Zahlen beantworten.

---

## Wo der Erstquellen-Vorteil liegt — und wo nicht

Die Trennlinie: Alles, wofür man **Artefakte aus echter Arbeit** braucht, kann die
KI-Blog-Konkurrenz nicht liefern. Sie kann einen Gesetzestext paraphrasieren. Sie kann keinen
Fehler zeigen, der ihr im dritten Sprint passiert ist.

**Trägt** — hier lohnt jeder Artikel:

| Feld | Was nur hier vorliegt |
|---|---|
| `ki-gestuetzte-entwicklung` | Eine gewachsene `CLAUDE.md` eines echten Projekts mit den Stellen, die sich als falsch erwiesen haben. Skills mit Auslösebeschreibungen, die tatsächlich greifen, samt Fehlversuchen. Token- und Kostenabrechnungen über Monate — die Zahl, nach der jeder CTO sucht und die niemand veröffentlicht |
| `prozessautomatisierung` | Dieser Workflow, diese Knoten, dieser Fehler, diese Laufzeit, diese Kosten. Belegbar aus dem Bestand: die eigene Ereignismeldung und der Tagesbericht — inklusive der Vorgeschichte, dass der alte Weg 404 lieferte und Token im Client-Bundle lagen |
| `ki-und-datenschutz`, `ki-betrieb` | Die Ebene unter der Rechtslage: Löschpfad durch ein RAG-System über Original, Chunks, Embeddings, Cache, Logs und Backup. Berechtigungsvererbung in den Retrieval-Filter. Einwilligungsfreies Tracking, das die Website selbst belegt |
| `individualsoftware`, `ki-strategie` | Die drei Referenzprodukte mit aufrufbarer Adresse — ccp-portal.de, dashboard.niimmo.de, klargehalt.de. Kaum ein Wettbewerber in Hannover zeigt laufende Produkte |
| alle | Der eigene Betrieb als Beweisstück: Migration aus SEO-Gründen, Docker-Prüfung vor jedem Deploy, ein Test, der jeden internen Link prüft |

**Trägt nicht** — hier entsteht Commodity-Content, egal wie gut geschrieben:

- **Begriffserklärungen**, die auf zehn Seiten gleich stehen. Die gehören ins Glossar.
- **Gesetzeszusammenfassungen** ohne eigene Auswertung. Ohne `substanz.art: "primaerquelle"`
  mit Fundstelle und Datum ist es eine Kanzlei-Kopie.
- **Marktzahlen und Trendlisten.** Die deutschen SERPs sind damit geflutet, und die Zahlen
  widersprechen sich zwischen den Blogs, die voneinander abschreiben („72 % der KI-Projekte
  scheitern" — nie ungeprüft übernehmen).
- **Werkzeugvergleiche ohne eigene Messung.** „X vs. Y" trägt nur mit eigenen Laufzeiten,
  eigenen Kosten und der Entscheidung, die daraus folgte.

---

## Ein Thema eintragen

```json
{
  "id": "auto-2026-014",
  "arbeitstitel": "Was ein n8n-Workflow im Jahr wirklich kostet",
  "zielKeyword": "n8n kosten unternehmen",
  "cluster": "prozessautomatisierung",
  "autor": "ayham-alkhalil",
  "prioritaet": 20,
  "substanz": {
    "art": "eigene-messung",
    "beschreibung": "Betriebskosten von drei laufenden Workflows über zwölf Monate, aufgeschlüsselt nach Server, Ausführungen und Arbeitszeit für Störungen.",
    "herkunft": "Eigener n8n-Dienst, Abrechnung 08/2025 bis 07/2026.",
    "material": ["Die Arbeitszeit für Störungen war etwa dreimal so teuer wie der Server."]
  },
  "notiz": "Kundenprojekte bleiben draußen, nur der eigene Betrieb."
}
```

**Reihenfolge beim Eintragen:** erst die sieben Prüffragen aus `substanz-gate.md`, dann der
Eintrag. Nicht umgekehrt — wer den Arbeitstitel zuerst schreibt, findet hinterher immer
irgendeine Substanz, und das ist genau die Selbsttäuschung, gegen die das Feld gebaut ist.
Fällt keine Prüffrage positiv aus: `substanz: null`, dazu eine `notiz`, was zur Freigabe
fehlt. Schritt 02 überspringt solche Themen, statt sie zu produzieren.

---

## Prioritäten

`prioritaet` ist eine Zahl, kleiner ist wichtiger. Sie ist die **einzige Reihenfolge, die
ohne Netzwerkzugriff funktioniert** — fällt die Keyword-Schnittstelle aus, fällt die Auswahl
darauf zurück (`ohneAbbruch` in Schritt 01). Deshalb muss sie für sich allein Sinn ergeben.

Was die Priorität nach vorn zieht, in dieser Reihenfolge:

1. **Ein Stichtag steht bevor** — E-Rechnungs-Versandpflicht ab 01.01.2027 (Unternehmen über
   800.000 € Vorjahresumsatz), Kennzeichnungspflicht für KI-Inhalte ab 02.12.2026,
   Hochrisiko-Pflichten nach Anhang III ab 02.12.2027. Vorher wirkt der Artikel, nachher ist
   er Altpapier.
2. **Das Keyword ist unbesetzt** — `go-digital nachfolger`, `digital jetzt alternative`: die
   Programme sind ausgelaufen, das Suchvolumen läuft weiter, und die rankenden Artikel
   beschreiben Antragswege, die es nicht mehr gibt.
3. **Conversion-Nähe 4 oder 5** (siehe Cluster-Tabelle).
4. **Der Eigenanteil ist ungewöhnlich stark** — ein Fehlerbericht mit Kosten schlägt eine
   Prozesszerlegung, beide schlagen eine Primärquellen-Auswertung.

**Kein Kriterium ist das Suchvolumen allein.** Ein Thema mit 40 Suchen im Monat und
Conversion-Nähe 5 ist mehr wert als eines mit 2.000 Suchen, bei dem Wikipedia und drei
Verlage die ersten Plätze halten. Schritt 03 markiert solche Ergebnisseiten als
`aussichtslos`.

---

## `fruehestens` und `spaetestens`

Beide sind ISO-Daten und werden lexikografisch verglichen — bei `JJJJ-MM-TT` ist das dasselbe
wie chronologisch. Das Tagesdatum kommt in **deutscher Zeit** (`Europe/Berlin`); mit UTC stünde
zwischen Mitternacht und zwei Uhr noch der Vortag, und ein Thema mit `fruehestens: heute` fiele
einen Lauf lang durch, ohne dass jemand den Grund fände.

| Feld | Wann setzen |
|---|---|
| `fruehestens` | Ein Ereignis muss erst eingetreten sein: eine Frist greift, ein Gesetz ist im Amtsblatt, eine Messe hat stattgefunden, ein Förderprogramm ist angekündigt. Auch für Saisonales: „Budget 2027 planen" trägt ab September, nicht im März |
| `spaetestens` | Der Anlass läuft ab. Ein Artikel zur Kennzeichnungspflicht ab 02.12.2026 will im Oktober erscheinen, nicht im Dezember — nach dem Stichtag sucht niemand mehr nach der Vorbereitung |

Ohne beide Felder ist ein Thema ganzjährig fällig. Das ist der Normalfall; die Datumsfelder
sind für die Ausnahmen da, nicht für einen Redaktionskalender.

---

## Begriffsdefinitionen gehören ins Glossar

**Ein Begriff wird an genau einer Stelle erklärt.** Steht dieselbe Definition im Glossar und
in einem Artikel, konkurrieren zwei eigene Seiten um dieselbe Suche.

| Sorte | Wohin |
|---|---|
| „Was ist X?" — Definition, Abgrenzung, ein Beispiel | `src/data/glossary.ts` → `/glossar/<slug>` |
| „Wie entscheidet man zwischen X und Y, und was hat das gekostet?" | Artikel |

Ein Artikel darf einen Begriff in einem Satz einordnen und dann ins Glossar verlinken — ein
guter Ankertext-Kandidat. Was er nicht darf, ist den Glossareintrag nachbauen.

Nebenbei: Definitionsseiten sind das Format, das die Zitationsdaten am stärksten belohnen
(Definitionssprache in zitierten Passagen fast doppelt so häufig — Indig, 18.012 verifizierte
Zitate). Das Glossar auszubauen ist Blogarbeit mit anderem Ablageort.

---

## Kannibalisierung: ein Keyword, ein Artikel

Der Loader (`src/lib/wissen/laden.ts`) bricht ab, wenn zwei **veröffentlichte** Artikel
dasselbe `zielKeyword` tragen. Das ist hart, und es ist Absicht:

- Zwei eigene Seiten auf dasselbe Ziel konkurrieren gegeneinander statt gegen den Wettbewerb.
  Google muss raten, welche gemeint ist, und rät nicht immer gleich.
- ChatGPT **dedupliziert Ergebnisse zusätzlich pro Domain** (Netzwerkanalyse, ~1.240
  Source-Records). Eine starke Seite je Behauptung schlägt zehn schwache — und die schwächere
  kann die stärkere verdrängen.
- Die eingehenden internen Links verteilen sich auf zwei Ziele. Zwei Seiten mit je 15 Links
  liegen beide unter dem Korridor 20–40, den eine Seite mit 30 erreicht hätte.

**Entwürfe belegen kein Keyword.** Ein Entwurf, der auf dasselbe Ziel schreibt wie ein
Live-Artikel, ist meistens genau der geplante Ersatz und darf danebenliegen.

**Einen bestehenden Artikel ersetzen, in dieser Reihenfolge:**

1. Den neuen Artikel als `status: "entwurf"` mit demselben `zielKeyword` anlegen. Er stört
   nichts.
2. Alle internen Links prüfen, die auf den alten Slug zeigen (`verlinkungsBild()`), und die
   Ziele umschreiben. Sonst hängen 20 Links an einer Seite, die gleich verschwindet.
3. Den alten Artikel auf `status: "zurueckgezogen"` setzen. Damit ist er sofort von der
   Website und aus der Sitemap.
4. Neuen Artikel auf `veroeffentlicht` mit `freigabe`, `npm test && npm run build`.
5. Im Themen-Vorrat das alte Thema mit `erledigt` auf den **neuen** Slug zeigen lassen.

**Was nicht geht:** den neuen Artikel danebenstellen und schauen, welcher besser läuft. Wenn
ein Thema zwei Artikel verdient, sind es zwei verschiedene Keywords — und die muss man beide
benennen können, ohne zu zögern. Der Brief hat dafür das Feld `abgrenzung`: was in diesem
Artikel **nicht** vorkommen darf, weil es dem Nachbarartikel gehört.
