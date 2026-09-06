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

## Format

- **SVG bevorzugt**, sonst PNG mit transparentem Grund.
- Auf den Inhalt beschnitten, ohne weißen Rahmen — die Komponente zeigt sie auf
  hellem Grund mit 48 px Höhe.
- Dateiname kebab-case, nach dem Zeichen benannt: `dsgvo-geprueft.svg`.
- Herstellervorgaben zu Mindestgröße und Schutzraum beachten; sie stehen im
  Regelfall im Zertifikat oder in den Nutzungsbedingungen des Ausstellers.

## Nicht hierher

Logos von Produkten, mit denen wir arbeiten — Power Automate, Power BI,
Dynamics 365, n8n, Claude. Die stehen als Symbole in `src/data/stack-marken.ts`
und laufen im Hero der Startseite durch. Ein Produktlogo neben Prüfzeichen liest
sich als Partnerstatus oder Zertifizierung; das ist etwas anderes als „wir
setzen das ein".
