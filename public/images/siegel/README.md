# Siegel und Prüfzeichen

Hier liegen die Logos der Prüfzeichen, die **dieser Gesellschaft tatsächlich
verliehen wurden**. Gezeigt werden sie von `src/components/sections/Konformitaet.tsx`,
eingetragen in `src/data/konformitaet.ts` (Liste `siegel`).

## Bevor ein Logo hier landet

Drei Bedingungen, alle drei müssen erfüllt sein:

1. **Verliehen an KITech Software UG (haftungsbeschränkt)** — nicht an ein
   Werkzeug, das wir einsetzen, und nicht an Ayham persönlich.
2. **Noch gültig.** Läuft es ab, gehört das Datum in `gueltigBis`.
3. **Beim Aussteller nachprüfbar** über eine Adresse, die im Eintrag als
   `nachweisUrl` steht.

Ein fremdes Prüfzeichen ohne Berechtigung zu führen, ist Markenverletzung und
Irreführung zugleich — und Aussteller verfolgen das, weil ihr Zeichen sonst
wertlos wird. Im Zweifel: nicht einbauen.

## Woher die Datei kommt — nicht nachbauen

⚠️ **Das Zeichen wird beim Aussteller heruntergeladen, nie nachgezeichnet und
nie aus einem Screenshot geschnitten.** Die gelieferte Datei trägt geprüfte
Proportionen, den vorgeschriebenen Schutzraum und teils eine Kennung; ein
selbst gebautes Abbild ist auch mit vorhandenem Status eine Markenverletzung.

| Zeichen | Wo die Datei liegt |
|---|---|
| Microsoft Solutions Partner | Partner Center → **Logo Builder** (Farbe und Schwarzweiß, je Designation eine Datei) |
| AWS Partner | Partner Central → Marketing Central, mit dem eigenen Tier |
| Google Cloud Partner | Partner-Advantage-Portal |
| ISO/IEC 27001 | vom Zertifizierer zusammen mit dem Zertifikat, mit Zertifikatsnummer |

## Format

- **Datei unverändert lassen.** Nicht freistellen, nicht einfärben, nichts
  wegschneiden — der schwarze Fußbalken mit der Designation gehört bei
  Microsoft-Badges zum Zeichen.
- SVG bevorzugt, sonst PNG. Die Komponente zeigt das Bild mit 104 px Höhe
  (ab `sm` 124 px) und setzt **keinen** eigenen Rahmen darum.
- Dateiname kebab-case, nach Zeichen und Ausprägung benannt:
  `microsoft-solutions-partner-data-ai-azure.png`.

## Nicht hierher

Logos von Produkten, mit denen wir arbeiten — Power Automate, Power BI,
Dynamics 365, n8n, Claude. Die stehen als Symbole in `src/data/stack-marken.ts`
und laufen im Hero der Startseite durch. Ein Produktlogo neben Prüfzeichen liest
sich als Partnerstatus oder Zertifizierung; das ist etwas anderes als „wir
setzen das ein".
