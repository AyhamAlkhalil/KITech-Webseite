# Arbeitsauftrag: ein Artikel

Schreib den Artikel, der im folgenden Briefing beschrieben ist. Antworte
ausschließlich mit dem JSON-Objekt, das dem vorgegebenen Schema entspricht.

---

## Briefing

**Heute ist der {{HEUTE}}.** Rechne jede Zeitangabe gegen dieses Datum, nicht
gegen deinen Trainingsstand. „Seit kurzem", „demnächst", „aktuell", „seit
diesem Jahr" — was davon stimmt, entscheidet dieses Datum. Im Zweifel schreib
das Datum aus, statt es zu umschreiben. Abrufdaten in `quellen` tragen ebenfalls
dieses Datum, wenn die Seite in diesem Lauf gelesen wurde.

⚠️ Über Ereignisse, die nach deinem Trainingsstand liegen, weißt du nichts —
auch wenn es sich anders anfühlt. Was du über sie schreibst, steht entweder in
der Recherche unten, oder es steht nicht im Artikel.

**Zielkeyword:** {{ZIELKEYWORD}}
**Nebenkeywords:** {{SEKUNDAERKEYWORDS}}
**Titelvorschläge aus der Redaktion:** {{TITELVORSCHLAEGE}}
**Themenfeld (cluster):** {{CLUSTER}}
**Zielumfang:** ungefähr {{ZIELWORTZAHL}} Wörter im Fließtext

**Wer liest das:** {{LESER}}

**Die eine Aussage, die hängen bleiben soll:**
{{KERNTHESE}}

**Der Eigenanteil — das, was auf den ersten zehn Ergebnissen nicht steht:**
{{EIGENANTEIL}}

**Der belegte Kern des Artikels (Feld `substanz`, wird nach dem Schreiben
eingesetzt und darf nicht erfunden werden):**
{{SUBSTANZ}}

---

## Gliederung

Halte dich an diese Abschnitte, in dieser Reihenfolge. Die Überschriften darfst
du schärfen, die Reihenfolge nicht ändern.

{{GLIEDERUNG}}

---

## Fragen für den Frage-Antwort-Block

Diese Fragen stellen echte Nutzer in der Suche. Beantworte zwei bis vier davon
im Feld `faq`, jede in 40 bis 120 Wörtern, jede vollständig ohne Rückverweis auf
den Artikeltext.

{{FRAGEN}}

---

## Belege — und nur diese

{{BELEGE}}

Nur Zahlen, die durch einen dieser Belege gedeckt sind, dürfen in den Text. Für
jede verwendete Zahl gehört der passende Beleg in `quellen`, mit Bezeichnung,
URL und Abrufdatum genau so, wie er hier steht. Steht hier nichts, enthält der
Artikel keine Fremdzahl und `quellen` bleibt leer.

Eigene Zahlen aus dem Material unten brauchen keinen Eintrag in `quellen` — sie
sind durch `substanz` gedeckt.

## Material, das wörtlich verwendet werden darf

{{MATERIAL}}

---

## Interne Links

Setz drei bis acht Links auf die folgenden Seiten. Ein Link besteht aus dem
Zielpfad, dem Ankertext und der Nummer des Abschnitts, in dem er steht
(`0` für den ersten Abschnitt, `"intro"` für das Intro).

{{VERLINKUNGSZIELE}}

**Der Ankertext muss wörtlich in dem Absatz stehen, auf den du ihn setzt.**
Schreib also zuerst den Absatz und nimm dann eine Wortfolge aus genau diesem
Absatz als Ankertext — Zeichen für Zeichen identisch, gleiche Groß- und
Kleinschreibung, keine zusätzlichen Wörter. Ein Ankertext, der im Text nicht
vorkommt, wird nach dem Schreiben entfernt und der Link ist verloren.

Jeder Ankertext ist anders formuliert, auch bei zwei Links auf dasselbe Ziel.
Nie „hier“, „mehr erfahren“ oder der nackte Pfad.

---

## Abgrenzung — das gehört nicht in diesen Artikel

{{ABGRENZUNG}}

---

## Vorhandene Artikel

Diese Artikel gibt es schon. Wiederhol ihre Aussagen nicht, und wähl einen Slug,
der noch frei ist.

{{VORHANDENE}}

---

## Felder im Einzelnen

- **`slug`** — Kleinbuchstaben, Ziffern, einfache Bindestriche. Das Zielkeyword
  steckt darin, ohne Füllwörter. Höchstens 80 Zeichen.
- **`titel`** — 15 bis 120 Zeichen. Eine Aussage oder eine Frage, kein Etikett,
  kein Doppelpunkt-Präfix, keine Jahreszahl. Das Zielkeyword kommt darin vor,
  aber der Titel liest sich wie ein Satz, nicht wie eine Suchanfrage.
- **`teaser`** — 25 bis 30 Wörter, eigener Text, kein Auszug aus dem Intro.
- **`kategorie`** — ein Wort, das das Thema einordnet, etwa „Grundlagen“,
  „Recht“, „Technik“, „Praxis“.
- **`intro`** — 30 bis 45 Wörter. Erster Satz benennt den Irrtum. Ein Satz in
  Definitionsform steht im Intro oder in der ersten Kernaussage.
- **`abschnitte`** — fünf bis neun Stück. Mehr als die Hälfte der Überschriften
  sind echte Fragen, und der erste Satz darunter beantwortet sie. Ein bis drei
  Absätze je Abschnitt. Höchstens eine Aufzählung im ganzen Artikel und
  höchstens eine Tabelle.
- **`kernaussagen`** — zwei bis vier Sätze, je 40 bis 320 Zeichen, jeder ohne
  Kontext verständlich und für sich zitierfähig.
- **`fazit`** — 19 bis 26 Wörter. Umwertung, dann Auflösung. Keine Aufforderung.
- **`faq`** — zwei bis vier Einträge aus den Fragen oben.
- **`quellen`** — nur aus der Belegliste. Sonst leeres Array.
- **`interneLinks`** — drei bis acht, nach der Regel oben.
- **`lesezeit`** — Wörter geteilt durch 200, aufgerundet.
- **`cta`** — `heading` ist ein Satz mit Punkt oder eine Frage aus drei bis
  sieben Wörtern, und er entwertet die Seite, auf der man gerade steht
  („Das war die Theorie.“). `text` ist genau eine Zeile aus 12 bis 20 Wörtern
  und beantwortet die Überschrift. Hier — und nur hier — wird der Leser
  angesprochen: `du` bei Themen für Selbstständige, `ihr` bei Themen für
  Unternehmen. Keine Dauer, kein Preis, keine Platzangabe.
- **`substanz`, `autor`, `cluster`, `zielKeyword`, `datum`, `status`** werden
  nach dem Schreiben aus dem Briefing gesetzt. Füll sie mit den Werten aus dem
  Briefing und erfinde nichts dazu.

Der Hausstil im System-Prompt hat Vorrang vor jeder Vorgabe hier.
