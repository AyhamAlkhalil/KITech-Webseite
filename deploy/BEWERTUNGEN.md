# Bewertungen einholen — ProvenExpert

> ⚠️ **HINFÄLLIG seit 07.09.2026. ProvenExpert wird nicht genutzt** (Ansage
> Ayham: „das benutzen wir nicht"). Das Profil ist aus `sameAs` entfernt, der
> offene Punkt aus CLAUDE.md gestrichen.
>
> **Das Problem dahinter besteht weiter:** Sechs der acht Referenzfälle tragen
> fünf Sterne auf rein mündlicher Grundlage. Nachweisbar sind sie damit nicht —
> siehe die ausführliche Einordnung am Feld `rating` in
> `src/data/client-results.ts`. Es braucht keinen Dienstleister dafür: Eine
> Mail, in der der Kunde seine Bewertung bestätigt, genügt als Beleg.
>
> Die Anschreiben weiter unten bleiben als Vorlage stehen — nur der Absatz zum
> ProvenExpert-Code ist gegenstandslos.

Stand 24.08.2026. Was zu tun ist, warum es eilt, und die Texte dafür.

---

## Die Ausgangslage

Das Profil **KITech Software UG** ist seit dem **06.11.2025** aktiv und hat
**null Bewertungen**. Es steht bereits im JSON-LD der Website als `sameAs` —
ein Prüfer, der dem Verweis folgt, findet also ein leeres Profil.

Gleichzeitig tragen **fünf Kundenkarten je fünf Sterne**:

| Kunde | Firma | Sterne | Beleg |
|---|---|---|---|
| Dennis Mikyas | NiImmo | 5 | ✅ Zitat in `testimonials.ts` |
| Benjamin Ronneburg | Pflegexperts | 5 | ❌ keiner |
| Jan Uwe Pane | cert consulting Pane | 5 | ❌ keiner |
| Thomas Grynia | Grynia Consulting | 5 | ❌ keiner |
| Mike Letzgus | Nereo | 5 | ❌ keiner |

Eugen Kretschmann (KREMA) hat ein belegtes Zitat, aber keinen Karteneintrag.

**Woher die vier übrigen Zahlen stammen** (Nachfrage am 26.08.2026): Alle vier
Kunden haben Ayham die fünf Sterne **mündlich** gegeben.

Das ändert die rechtliche Lage erheblich. Der Tatbestand im Anhang zu
§ 3 Abs. 3 Nr. 23c UWG trifft das **Erfinden** von Bewertungen. Eine mündlich
abgegebene Bewertung ist eine echte Bewertung — sie ist nur nicht dokumentiert.
Die vier Zahlen sind damit keine gefälschten Bewertungen.

⚠️ **Was fehlt, ist die Beweisbarkeit.** Wer die Angabe bestreitet, zwingt zum
Nachweis, und „wurde mir am Telefon gesagt" trägt vor Gericht wenig. Das ist
ein bewusst getragenes Risiko, keine Nachlässigkeit — und es verschwindet mit
den ersten schriftlichen Bewertungen.

**Was bis dahin hilft, ohne Aufwand:** Bei jedem mündlichen Lob eine Zeile
notieren — Datum, Person, Anlass, Wortlaut soweit erinnerlich. Eine Notiz vom
Tag des Gesprächs ist etwas völlig anderes als eine Erinnerung zwei Jahre
später, wenn jemand nachfragt.

**Fünf echte Bewertungen lösen beide Probleme auf einmal:** das leere Profil
und die unbelegten Sterne.

---

## Wie der Weg technisch läuft

ProvenExpert lässt **keine freien Bewertungen** zu. Auf dem Profil steht ein
Knopf „Jetzt bewerten", aber darunter der Hinweis, dass ein **Zugangscode**
nötig ist. Den vergibt die Firma.

1. Im ProvenExpert-Konto anmelden.
2. Unter **Bewertungen einholen** die Kunden mit Name und E-Mail eintragen.
3. ProvenExpert verschickt die Einladung samt Code.
4. Der Kunde bewertet, die Bewertung erscheint nach Prüfung im Profil.

Der Einladungstext lässt sich anpassen — die Vorlagen unten sind dafür.

---

## Wer angefragt wird

Die fünf Personen aus der Tabelle oben. Für jede liegt ein abgeschlossenes
Projekt vor, das auf der Website als Referenz steht.

**Reihenfolge nach Erfolgsaussicht:** zuerst Dennis Mikyas und Eugen
Kretschmann — beide haben bereits schriftlich etwas Positives abgegeben, die
Hürde ist dort am niedrigsten. Danach die übrigen.

⚠️ **Nicht anfragen, wo das Projekt offene Punkte hat.** Eine Bewertungsbitte
mitten in einer ungeklärten Sache bekommt entweder keine Antwort oder eine
ehrliche.

---

## Vorlage 1 — Kunden, die schon etwas gesagt haben

> Betreff: Kurze Bitte — zwei Minuten
>
> Hallo <Name>,
>
> du hattest mir damals geschrieben, dass <die konkrete Sache, die er gesagt hat>.
> Das hat mich gefreut, und ich würde es gern öffentlich sichtbar machen.
>
> Wir sammeln unsere Bewertungen seit Kurzem über ProvenExpert. Du bekommst
> gleich eine Mail von dort mit einem Zugangscode — das Ausfüllen dauert
> keine zwei Minuten, und du entscheidest selbst, was davon öffentlich steht.
>
> Wenn es gerade nicht passt, sag einfach Bescheid. Dann frage ich in ein paar
> Monaten noch einmal.
>
> Viele Grüße
> Ayham

## Vorlage 2 — Kunden ohne bisherige Rückmeldung

> Betreff: Wie lief es bei euch mit <Projekt>?
>
> Hallo <Name>,
>
> <Projekt> läuft jetzt seit <Zeitraum> bei euch. Ich würde gern wissen, wie es
> sich im Alltag anfühlt — und zwar ehrlich, auch wenn etwas fehlt.
>
> Falls du zufrieden bist: Wir sammeln unsere Bewertungen über ProvenExpert.
> Du bekommst eine Mail von dort mit einem Zugangscode, das Ausfüllen dauert
> zwei Minuten.
>
> Falls etwas nicht rundläuft, schreib mir das lieber direkt. Das ist mir
> nützlicher als eine Bewertung.
>
> Viele Grüße
> Ayham

---

## Was NICHT gemacht wird

- **Keine Bewertung im Namen eines Kunden schreiben**, auch nicht als Entwurf
  „zum Abnicken". Nach dem Anhang zu § 3 Abs. 3 Nr. 23c UWG ist die Angabe
  gefälschter Bewertungen ein Verstoß, und eine vorformulierte Bewertung, die
  der Kunde nur bestätigt, ist im Streitfall schwer davon zu trennen.
- **Keine Gegenleistung für eine Bewertung.** Rabatt, Gutschein oder Nachlass
  gegen Bewertung macht sie zu einer bezahlten Äußerung und damit
  kennzeichnungspflichtig.
- **Nicht nur zufriedene Kunden einladen.** Eine gezielte Vorauswahl ist als
  irreführend angreifbar. Wer fragt, fragt alle, bei denen das Projekt
  abgeschlossen ist.

---

## Nach den ersten Bewertungen

1. `rating` in `src/data/client-results.ts` prüfen: Die Zahl auf der Karte muss
   zu dem passen, was tatsächlich abgegeben wurde.
2. Bei belegten Zitaten `review` füllen — nur mit dem Wortlaut, der wirklich
   abgegeben wurde.
3. `npm run llms` und deployen.
4. Erst wenn Bewertungen vorliegen, lohnt `AggregateRating` im JSON-LD. Vorher
   wäre es genau die Auszeichnung, die Google als erfundene Bewertung wertet.
