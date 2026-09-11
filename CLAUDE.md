# CLAUDE.md – KITech Software Website

Corporate-Website von **KITech Software UG (haftungsbeschränkt)**, Hannover —
Softwareentwicklung und KI-Beratung für den Mittelstand.
Live: [kitech-software.de](https://kitech-software.de) · Sprache: de_DE ·
Geschäftsführer: Ayham Alkhalil.

> **Diese Datei beschreibt den Zustand und die Regeln — nicht die Geschichte.**
> Warum etwas so ist, steht in der Commit-Nachricht der Änderung
> (`git log -S "<Suchbegriff>"`) und in den Kopfkommentaren der jeweiligen Datei.
> Wer hier etwas ergänzt, fragt sich: Verhindert das künftig einen Fehler? Wenn
> nein, gehört es ins Commit.

---

## Wofür die Website gebaut ist

Ansage Ayham, 05.09.2026. Diese sechs Absätze stehen über den Detailregeln
weiter unten. Wo eine Regel ihnen widerspricht, gewinnen sie — und die Regel
gehört korrigiert.

**Sie soll verkaufen, nicht gefallen.** Der Aufbau ist verkaufspsychologisch:
Beweis vor Behauptung, Referenzen weit vorne, hinter jedem Gedanken ein Knopf.
Ladezeit und Auffindbarkeit sind Verkaufsargumente — Animation ist keins. Wo
„sieht besser aus" gegen „lädt schneller" steht, gewinnt schneller.

**IT-Dienstleister, der auch KI macht.** Nicht KI-Agentur. Die Reihenfolge
*ist* die Positionierung, und sie ist der Grund für den Microsoft-Stack seit
dem 04.09.2026. ⚠️ Der Bestand steht dagegen: „KI" gegen klassische IT-Begriffe
**161:4** in `src/data`, `src/config`, `src/views`; „IT-Dienstleister",
„Systemhaus", „Softwarehaus" **null** Treffer; 11 von 16 indexierbaren Titeln
führen mit KI. Jede neue Copy verschiebt das Verhältnis in die eine oder die
andere Richtung — es gibt keine neutrale Zeile. Der Produktname
**„1:1-KI-Check" bleibt** (Entscheidung 05.09.2026): Er ist das Angebot, nicht
die Positionierung.

**Tempo ist das Profil, der Preis nicht.** Wir arbeiten schnell, weil wir gut
in KI sind — das ist die Aussage, und sie ist belegt: ein Portal in 40 Tagen
live, eines in 60, ein SaaS in zwei Monaten, über 50 Projekte seit dem
16.01.2026 mit vier Leuten (`data/client-results.ts`, `config/company.ts`).
⚠️ **Preisaussagen kommen nicht in die Copy** (Entscheidung 05.09.2026): kein
„günstig", kein „günstiger als", keine Beträge, keine Zusagen wie „Festpreis".
Den Vorteil rechnet der Leser selbst. Zwei Gründe, beide praktisch: Eine
Preisangabe ist eine Zusage, die gehalten werden muss, und bei einer
Vergleichsaussage liegt die Darlegungslast beim Werbenden (§ 5 Abs. 1 UWG) —
und über den Preis zu verkaufen bricht mit der eigenen H1 „Falsche KI kostet
mehr als keine KI."

**So wenig erkennbar generierter Text wie möglich.** Die Marker, an denen man
ihn erkennt und die deshalb nicht ins Produkt gehören: Dreierfiguren
(„schnell, sauber, verlässlich"), gehäuftes „nicht X, sondern Y",
Erklärabsätze, die nur die Überschrift umformulieren, Nutzenversprechen ohne
Zahl, ein Gedankenstrich in jedem zweiten Satz. Gemessen: **15,3
Gedankenstriche je 1000 Wörter** in der Marketing-Copy gegen **2,2** in der
handgeschriebenen Datenschutzerklärung desselben Repos. Der Blog ist dabei
nicht der schlimmste Fall, sondern `src/data`.

**Kürzen heißt Erklärabsätze streichen, nie Belege.** Weg dürfen Fülltext,
Doppelungen und Platzhalter. Bleiben müssen: die Kennzahlen der Kundenkarten,
die Beleg-Links der Konformitätsangaben, interne Verweise und CTAs. Sonst wird
aus „kürzer" eine dünne Seite — und 14 von 39 Sitemap-Adressen stehen bei
Google ohnehin schon auf „Gefunden – zurzeit nicht indexiert".

⚠️ **An diesem Arbeitsbaum arbeiten ständig mehrere Sessions gleichzeitig.**
Nicht gelegentlich — im Regelfall. Wer hier etwas ändert, muss damit rechnen,
dass parallel jemand anderes dieselbe Datei anfasst, und dass die Blog-Automatik
werktags 6:30 von sich aus committet und deployt. Daraus folgen drei Handgriffe,
die keine Ausnahme kennen:

1. **Vor jeder Änderung** `git status --short` lesen. Was fremd und uncommittet
   im Baum liegt, wird nicht angefasst und nicht mitcommittet.
2. **Immer mit Pathspec committen** (`git commit -m "…" -- <dateien>`), nie den
   ganzen Index. Ein `git add -A` liefert bei einem Deploy fremde, unfertige
   Arbeit mit aus.
3. **Vor dem Deploy** `git log --oneline -3` — ein Deploy liefert alles aus, was
   gerade in `main` liegt, nicht nur die eigene Änderung.

Besonders kollisionsgefährdet, weil mehrere Themen darauf zugreifen:
`CLAUDE.md`, `config/navigation.ts`, `data/client-results.ts`,
`data/testimonials.ts`, `content/wissen/` und `content/seo/themen-pool.json`.

---


## Commands

```bash
npm run dev            # Dev-Server, Port 8080
npm run build          # Production Build
npm run lint           # ESLint
npm test               # Vitest

npm run llms           # llms.txt + llms-full.txt neu erzeugen (nach JEDER Inhaltsänderung)
npm run og             # Standard-Vorschaubild rendern (braucht Chrome)
npm run pruefe:jsonld  # JSON-LD des ausgelieferten HTML prüfen (Live oder URL als Argument)
npm run gsc            # Google Search Console abfragen (ohne Argument: alle Befehle)
npm run gsc -- abdeckung   # jede Sitemap-Adresse einzeln bei Google nachschlagen
npm run bing           # Bing Webmaster Tools — Index, Crawl, Keyword-Volumen
npm run bing -- abdeckung  # dasselbe bei Bing: welche Adressen es nie geholt hat
bash scripts/pruefe-container.sh   # Vollprüfung im Container — vor jedem Deploy

npm run blog:brief -- <thema-id>   # Redaktionsbriefing, kostenlos
npm run blog:lauf -- --trocken     # Automatik-Probelauf, kostet nichts
npm run blog:lauf -- --auto        # durchlaufen bis zur ausgelieferten Seite
npm run blog:pruefen -- <slug> -v  # Hausstil, 81 Regeln
npm run blog:freigeben -- <slug> --von "Name"
npm run blog:indexnow              # nach dem Deploy
```

Vitest läuft über Vite (`vitest.config.ts`), unabhängig vom Next-Build — das ist
Absicht: die Tests lesen einzelne Alt-Seiten per `?raw`-Import.

---

## Was von selbst läuft

| Wann | Was | Wo abschalten |
|---|---|---|
| werktags **6:30** | Blog-Automatik schreibt, prüft, gibt frei, committet, deployt, meldet an IndexNow | `BLOG_ENGINE_FREIGABE_VON` in `.env` leeren |
| täglich **8:00** | Besucherbericht des Vortags per Microsoft Graph | crontab-Zeile |
| bei jedem Besuch | n8n meldet Firmen und Kontaktsignale per Mail | `EREIGNIS_WEBHOOK_URL` in Coolify |

Alle drei in der crontab des Benutzers `deploy` bzw. in n8n — **nichts davon
hängt an einem Deploy.** ⚠️ Zeitangaben gelten nur, weil `CRON_TZ=Europe/Berlin`
in der crontab **vor** den Zeilen steht; sonst liefe alles nach UTC.

---

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript 5.8 (strict **aus**) ·
Tailwind 3.4 · shadcn/ui (Radix) · Framer Motion · Lucide · Onest (@fontsource) ·
React Query · React Hook Form + Zod · Sonner · Plausible (self-hosted) · npm.

Path Alias `@/` → `src/`.

---

## Struktur

```
content/            Redaktionelle Inhalte als JSON (von der Blog-Automatik beschrieben)
  wissen/<slug>.json  ein Artikel je Datei, Dateiname = URL
  seo/                autoren.json, cluster.json, themen-pool.json, laeufe/
public/images/      ALLE inhaltlichen Bilder (team/, referenzen/, og/, siegel/) — siehe images/README.md
scripts/
  blog-engine/      Die Blog-Automatik (lauf.ts, schritte/, lib/, prompts/)
  llms-txt.ts       erzeugt llms.txt + llms-full.txt
  pruefe-jsonld.mjs prüft das ausgelieferte HTML
  pruefe-container.sh  Vollprüfung im Container, vor jedem Deploy
  tagesbericht/     Python, Cron, Microsoft Graph
src/
  app/              Routing (dünne Server-Wrapper, exportieren nur metadata)
  views/            Seiten-Komponenten (NICHT src/pages/ — das wäre Pages Router)
    legacy/         Alt-Seiten, nicht geroutet, aus tsconfig/eslint ausgenommen
  components/
    layout/         PageShell (Rahmen aller Seiten), SiteHeader/Footer, CheckShell,
                    FunnelShell, SignalBackdrop, site-container.ts
    sections/ conversion/ seo/ canvas/ ui/
  config/           navigation.ts (EINZIGE Quelle für Nav + Routen), company.ts,
                    angebot.ts, announcement.ts, suchkonsolen.ts
  data/             Inhalte getrennt von der Darstellung
  lib/              metadata.ts, consent.ts, plausible.ts, wissen/, __tests__/
  proxy.ts          Host-Rewrite: funnel./fokus./app. → interne Pfade
deploy/             COOLIFY.md, BLOG-ENGINE.md, BENACHRICHTIGUNGEN.md, SUCHKONSOLEN.md,
                    n8n-benachrichtigung.json, blog-automatik.cron
Dockerfile          Multi-Stage, node:22-alpine, standalone, Port 3000 — der aktive Build Pack
```

---

## Routen

| Route | Index | Anmerkung |
|---|---|---|
| `/` | ja | Hero (**eine** Aussage + CTA, Werkzeug-Spur links), Kundenkarten, Gründerwort + Team, FAQ, Konformität, CTA |
| `/warum` + zwei Sales Letter | Weiche ja, Letter **nein** | Letter sind Platzhaltertext (`isPlaceholder`) |
| `/leistungen`, `/solo`, `/enterprise` | ja | Eine Vorlage, zwei Zielgruppen (`data/segments.ts`) |
| `/referenzen`, `/referenzen/[slug]` | Übersicht ja, Details **nein** | Details `noindex`, solange `openPoints` offen sind. Unter den Karten `Agentenfaehig` und `MicrosoftLoesungen` — beides Bauweise, keine Kunden |
| `/gratis-wissen` + `[slug]`, `/gratis-wissen/thema/[cluster]`, `/gratis-wissen/rss.xml` | ja | Content-Bereich, Server Components. ⚠️ Alle drei liegen **unter** `/gratis-wissen` — `/rss.xml` und `/thema/…` an der Wurzel sind 404 |
| `/autoren`, `/autoren/[slug]` | ja | `ProfilePage`, Inhalt `content/seo/autoren.json` |
| `/haltung`, `/kontakt`, `/glossar` + `[slug]` | ja | |
| `/karriere` + `[slug]` | **nein** | Platzhalterstellen — siehe Regel unten |
| `/lass-uns-reden` (Alias `/termin`) | ja | Calendly-Embed, consent-gated. Ziel **aller** Termin-CTAs |
| `/selbstcheck_eu_ai_act` (Alias `/selbstcheck`) | **nein** | Markenfrei, siehe Sonderseiten |
| `/funnel`, `/fokus` | **nein** | Kampagnendomains, siehe Sonderseiten |
| `/impressum`, `/datenschutz`, `/agb` | ja | |
| `/app/*` | nein | Eingeloggter Bereich (LogTo), noch nicht freigeschaltet |
| alles andere | – | Echte 404 mit voller Navigation |

**Navigation:** `src/config/navigation.ts` speist Kopfzeile, Fußzeile, Sitemap
und den Routen-Test. Wer eine Seite anlegt, trägt sie dort in eine Navigation
**und** in `siteRoutes` ein — sonst schlägt `npm test` fehl.

`routes.test.ts` liest die echten Routen aus `src/app/**/page.tsx` und prüft:
jeder interne Link zeigt auf eine Route, jede öffentliche Route ist erreichbar,
`siteRoutes` stimmt mit der Wirklichkeit überein, Platzhalter stehen auf
`noindex`. Ausgenommen: `legacy/`, `/funnel`, `/fokus`, der Selbstcheck.

---

## Regeln beim Bauen

**Eine neue Seite:** Inhalt nach `src/data/` → View nach `src/views/` (PageShell
+ `SITE_CONTAINER` + `PageHeading` + `CtaBanner`) → dünner Wrapper
`src/app/<pfad>/page.tsx` mit `buildMetadata()` → in `navigation.ts` eintragen →
`npm test`.

**Was nicht gebaut wird** (Vorgabe Ayham): das Muster *kleines Rechteck-Label →
Überschrift → Erklärabsatz*, und Raster aus gleich großen Karten mit Icon im
abgerundeten Quadrat. Beides liest sich als Baukasten. Stattdessen: Aussage als
Überschrift, höchstens ein Satz darunter, Listen mit Trennlinien (`divide-y`)
statt Kacheln.

**Eckig statt rund.** Neue Komponenten verwenden keine `rounded-*`-Klassen. Nur
`CookieConsent` und die shadcn-Bausteine tun das noch.

**Texte von Ayham sind wörtlich.** Rollen, Bios, Hero-Aussage, Zitate — nicht
umformulieren, auch nicht „glätten".

**CTA-Konvention:** Jeder Termin-Knopf navigiert intern zu `/lass-uns-reden`,
nie per `window.open()` zu Calendly. Die einzige externe Calendly-URL ist die
`data-url` im Embed selbst.

**Microsoft-Produktnamen zeichengenau.** Seit dem 04.09.2026 ist der
Enterprise-Stack die Positionierung: **Power Automate**, **Power BI**,
**Dynamics 365 Sales**, **Power Apps**, **Microsoft 365**, **Azure**. Nicht
„Dynamic Sales", und ein „Dynamics BI" gibt es nicht — das BI-Produkt heißt
Power BI. Auf der Gegenseite sitzt jemand, der die Namen täglich benutzt; ein
falscher Name kostet mehr Glaubwürdigkeit, als die ganze Liste aufbaut.
Gepflegt an sechs Stellen, die zusammenpassen müssen: `data/services.ts`
(`techStack`, Schritt 03), `data/segments.ts` (nur `enterprise` — `/solo`
behält n8n/Supabase, dort stimmt es), `data/faq.ts`, `sections/WegeBlock.tsx`,
`data/stack-marken.ts` (Hero-Laufband) und `data/microsoft-loesungen.ts`.
Dazu `knowsAbout` in `getOrganizationSchema()`.

`stack-marken.test.ts` hält davon den Teil unter Test, der sich prüfen lässt:
Jeder Name im Hero-Laufband, der mit „Power" oder „Dynamics" beginnt, muss
zeichengenau in `techStack` stehen — und die Reihenfolge muss Microsoft vor n8n
und Claude führen. Die Reihenfolge ist die Positionierung: „Ich möchte keine
KI-Agentur sein, sondern eine IT-Agentur, die auch KI macht" (Ansage
04.09.2026). Stünde Claude vorn, sagte der Hero das Gegenteil.

**Referenz oder Bauweise — nie dazwischen.** `data/client-results.ts` trägt
Aussagen über einen **Kunden**, `data/microsoft-loesungen.ts` und
`data/agentenfaehig.ts` Aussagen über **uns**. Der Unterschied ist die ganze Idee: Eine erfundene Kundenreferenz ist
irreführend nach § 5 Abs. 1, Abs. 2 Nr. 3 UWG, mit Bewertung oder Sternen fällt
sie unter die Schwarze Liste (Anhang zu § 3 Abs. 3 Nr. 23c UWG). Am 04.09.2026
sollten drei „Fake-Referenzen" mit Power Automate und CRM entstehen; daraus ist
auf Rückfrage der Block `MicrosoftLoesungen` auf `/referenzen` geworden — ohne
Kunden, ohne Kennzahlen, ohne JSON-LD, mit dem Kennzeichnungssatz **vorn**.
⚠️ Wer einen Eintrag von dort nach `client-results.ts` verschiebt und ihm einen
Firmennamen gibt, macht aus dem einen das andere.

**Agentenfähigkeit ist eine Leistungsbeschreibung, keine Bestandsangabe.**
`data/agentenfaehig.ts` (07.09.2026, auf Ansage) sagt, **wie wir bauen**: MCP-Server,
Sprachnachricht, Frage in Worten, Anschluss vorhandener Assistenten. Die Ansage
lautete „alle meine Produkte sind agentenfähig" — als Aussage über jede jemals
ausgelieferte Anwendung wäre das eine Zusicherung, die im Streitfall der Werbende
darlegen muss (§ 5 Abs. 1 UWG), und die Portale von 2026 haben den Zugang nicht
nachträglich bekommen. ⚠️ Sobald ein Fall ihn belegt, gehört er als Fall nach
`client-results.ts` — ein Kunde mit Namen ist mehr wert als jede Zeile hier.
Der Abschnitt steht auf `/` unter dem Kundenlaufband und auf `/referenzen` unter
den Karten, und **er muss in `llms.txt` stehen**: Wer sie liest, ist die Maschine,
über die er spricht.

**Konformitätsangaben nur mit Beleg auf dieser Website.** `data/konformitaet.ts`
→ jede Zeile verlinkt die Seite, auf der dieselbe Angabe verbindlich steht
(Datenschutz, Impressum, Selbstcheck). Kein „100 % DSGVO-konform", kein Siegel
ohne Zertifikat — und **kein pauschales „Ihre Daten bleiben in der EU"**: Die
Firmenerkennung läuft über ipinfo.io auf US-Servern (Standardvertragsklauseln,
Art. 46 Abs. 2 lit. c DSGVO), die Datenschutzerklärung benennt das. Echte
Prüfzeichen kommen nach `public/images/siegel/` (README dort: drei Bedingungen);
solange die Liste `siegel` leer ist, rendert der Block den Bereich gar nicht —
**kein Platzhalter**, eine angedeutete Zertifizierung wirkt wie eine vorhandene.

**Naming:** Dateien kebab-case, Komponenten PascalCase, TS-Variablen camelCase,
Konstanten UPPER_SNAKE.

---

## Design-System

**Hell, ein Blau als Signal.** ⚠️ Hier stand bis zum 11.09.2026 „Dark-first"
mit near-black-Tokens — das war seit dem Umbau auf die helle Vorlage falsch und
hat mehrfach zu Fehlannahmen geführt. Der Stand in `src/index.css`, HSL:
`--background` 0 0% 100% · `--foreground` 231 36% 12% · `--primary` 224 76% 44% ·
`--border` 0 0% 89%. `:root` und `.dark` tragen dieselben Werte; ein zweites
Farbschema gibt es nicht. Dazu `--surface` (0 0% 98%) und `--surface-strong`
(0 0% 94%) als Sektionsgründe sowie `--solo-accent` und `--enterprise-accent`,
beide im selben Blau. Der einzige dunkle Block der Website ist `CheckEinladung`
am Fuß der Startseite (`bg-foreground`).

**Schrift:** Poppins für alles — Body, Headlines (`kinetic-display`) und Zahlen
(`kinetic-data`). ⚠️ Die Klassennamen stammen aus dem abgelösten
Recursive-System und stehen an über hundert Stellen; sie bleiben als Namen und
zeigen auf Poppins. Onest und „Recursive Variable" sind draußen.

**Container:** `SITE_CONTAINER` (1180 px) für alles, `TEXT_CONTAINER` (760 px)
für Fließtext (Rechtstexte, Glossar). Die Tailwind-`container`-Klasse (1280 px)
stammt aus dem Alt-Layout und wird nicht mehr verwendet.

**Hintergrund:** `SignalBackdrop` über `PageShell` steuern
(`backdrop="header" | "full" | "none"`, `backdropClassName` für eigene Höhe).

### Vier Regeln, die schon einmal Geld gekostet haben

| Regel | Warum |
|---|---|
| **Knöpfe: `min-h-[…] py-…`, nie `h-[…]`** | Die Beschriftung kommt aus `config/angebot.ts` und ändert sich mit dem Angebot. Bei fester Höhe läuft längerer Text oben und unten heraus. Bei **360 px** nachsehen. |
| **Zeilen aus Text + mehreren Knöpfen bei 768 px messen** | Dort ist es am engsten: `md` hat gegriffen, der Platz noch nicht. Und `flex-1` braucht `min-w-0`, sonst drückt der Text die Knöpfe aus dem Bild statt selbst nachzugeben. |
| **`.kinetic-morph-in` animiert nur `transform`** | Mit `opacity: 0` zählt Chrome das Element nicht als gezeichnet — die H1 ist auf jeder Seite der LCP-Kandidat. Kostete einmal 820 ms auf der Startseite. |
| **`kinetic-morph-in` nur auf der H1** | Sonst zappelt beim Laden die ganze Seite. |

---

## SEO und Sichtbarkeit

**Metadaten:** `buildMetadata()` in `src/lib/metadata.ts` — Title, Description,
OpenGraph, Twitter, Canonical, optional `noindex`. Grenzen: **Titel 60**,
**Beschreibung 155** Zeichen, geprüft von `metadaten.test.ts` (auch für Titel,
die zur Laufzeit aus JSON entstehen). Artikel können über `metaTitel` einen
kürzeren Suchtitel als ihre H1 tragen.

**Sitemap** (`src/app/sitemap.ts`) pflegt keine eigene Liste: statische Routen
aus `siteRoutes`, Details aus den Datendateien. Ausgeschlossen werden
`indexable: false` und Alias-Routen. Kein `priority`, kein `changefreq` —
Google ignoriert beide ausdrücklich.

**JSON-LD:** Schema-Funktionen in `components/seo/StructuredData.tsx`,
Zod-Validierung in `lib/schema-validators.ts`.

- ⚠️ Der **Organisations-Knoten** steht in `PageShell` — **nicht ins Root-Layout
  verschieben**. Der Selbstcheck läuft über `CheckShell` und muss markenfrei
  bleiben; Firmenname, Anschrift und Telefon im Kopf wären genau das, was dort
  nicht hingehört.
- `getLocalBusinessSchema()` auf `/kontakt` trägt dieselbe `@id`, damit
  Öffnungszeiten und Geo in dieselbe Entität fließen.
- **Verweise per `@id`, keine ausgeschriebenen Zweitknoten.** Eine anonyme
  zweite `Organization` in `publisher`/`author`/`worksFor` liest sich als
  zweite Firma.
- `npm run pruefe:jsonld` prüft das **ausgelieferte HTML** (19 Seiten): kein
  Typ doppelt, jede `@id` aufgelöst. Nötig, weil Schemas an drei Orten entstehen
  (Views, Sammelfunktionen, `PageShell`) — was am Ende auf einer Seite steht,
  sieht man erst am gerenderten HTML. Statisch Prüfbares zusätzlich in
  `breadcrumb-dubletten.test.ts`.

**llms.txt wird erzeugt, nicht gepflegt** (`npm run llms`). Regel: **Hier steht
nur, was auf der Website steht** — keine Kundennamen ohne `client-results.ts`,
keine Zitate ohne `testimonials.ts`. Ein Test bricht ab, sobald die Dateien vom
Stand der Datendateien abweichen. KI-Systeme lesen sie leichter als das HTML;
eine veraltete Fassung ist teurer als gar keine.

**Suchkonsolen:** Google (URL-Präfix) und Bing bestätigt, Kennungen in
`src/config/suchkonsolen.ts`, ausgegeben vom Root-Layout. ⚠️ **Sie bleiben
dauerhaft stehen** — fällt das Tag weg, verliert die Domain **still** ihren
Status (`suchkonsolen.test.ts`). Der TXT-Eintrag `MS=ms60455894` in der DNS-Zone
ist Microsoft 365, nicht Bing.

**Search Console API** (seit 01.09.2026): `npm run gsc` — Leistungsdaten,
URL-Prüfung, Sitemap-Stand, jeder Befehl mit `--json`. Das ist die einzige
Quelle, die die **eigenen** Seiten misst statt den Markt zu schätzen, und sie
kostet nichts. Zugang über ein Dienstkonto, Schlüssel in
`/home/deploy/KITech/infra/secrets/google-search-console.json`, Pfad in `.env`.
⚠️ Zwei Fallen, beide melden sich als 403: Das Dienstkonto muss in der Search
Console **als Nutzer eingetragen** sein (es hängt nicht an Ayhams Konto), und
die Property heißt zeichengenau `https://kitech-software.de/` **mit**
Schrägstrich. Einrichtung und Fehlerbilder: `deploy/SUCHKONSOLEN.md`.
Es gibt bewusst **keinen** Befehl, der Indexierung erzwingt — die Indexing API
ist auf `JobPosting`/`BroadcastEvent` beschränkt.

**Bing Webmaster Tools API** (seit 01.09.2026): `npm run bing` — Index gegen
Sitemap, Crawl-Reihe, Abdeckung je Adresse, **Suchvolumen kostenlos**. Schlüssel
in `BING_WEBMASTER_API_KEY`, ein echtes Geheimnis (er darf einreichen und
Sitemaps löschen) — anders als `BING_SITE_VERIFICATION`, das im HTML steht.
⚠️ Vier Fallen, alle als **HTTP 400** oder HTML, keine als 403: `country` muss
**klein** sein (`de`); Datum als `JJJJ-MM-TT`, nicht `/Date(…)/`; **Lesen ist
GET, Schreiben ist POST**; und Bing schreibt „nie" als Jahr 1 bzw. 1601 statt
`null` — wer nur auf ein gefülltes Feld prüft, zählt jede unbekannte Seite als
geholt. Alles in `deploy/SUCHKONSOLEN.md`, die Datumsfalle unter Test.

⚠️ **Bing ist nicht Google.** Volumen und Positionen von dort in Google-Fragen
einzusetzen führt in die Irre. Der Nutzen liegt woanders: Bings Index speist
Copilot und ChatGPTs Websuche, und Bing nimmt als einziger Einreichungen an
(10.000/Tag) — was aber **keine Indexierung erzwingt** und `blog:indexnow`
nicht ersetzt, sondern nur nachholt, was IndexNow nie gesehen hat.

⚠️ **Tests, die Quelltext lesen, müssen Kommentare herausschneiden**
(`src/lib/__tests__/quelltext.ts`) — sonst verbietet der Test genau die
Dokumentation, wegen der er existiert. Betrifft `rechtstexte.test.ts` und
`breadcrumb-dubletten.test.ts`.

**Rechtsnormen veralten.** Impressum, Datenschutz und AGB stehen unter
`rechtstexte.test.ts`: **§ 5 DDG** (nicht TMG, abgelöst 14.05.2024) und
**TDDDG** (nicht TTDSG). Eine aufgehobene Vorschrift ausgerechnet auf der Seite,
die Sorgfalt belegen soll, ist ein sichtbarer Mangel.

**KI-Crawler:** `robots.txt` gibt GPTBot, ChatGPT-User, PerplexityBot,
ClaudeBot, Claude-SearchBot und Claude-User frei.

**`FAQPage` nicht ausrollen.** Google hat das Rich Result zum 07.05.2026
abgeschaltet. Auf Startseite und zwei Glossarseiten läuft es weiter (kostet
nichts, andere Systeme lesen es); auf neuen Seiten bringt es nichts.

---

## Blog-Automatik `/gratis-wissen`

Kette unter `scripts/blog-engine/`. Regeln und Bedienung: Skill `blog-seo`.
Einrichtung: `deploy/BLOG-ENGINE.md`.

**Sie läuft: werktags 6:30 per cron, ein Artikel, bis zur ausgelieferten Seite**
(`deploy/blog-automatik.cron`). Ohne `--auto` endet sie beim Entwurf.

**Was auf dem Spiel steht:** Googles Spam-Richtlinie kennt „scaled content
abuse" — viele Seiten, deren Zweck Ranking statt Nutzen ist, *„no matter how
it's created"*. Die Gegenprobe ist *„the extent to which a human being actively
worked to create satisfying content"*. Bewertet wird auf **Website-Ebene** — ein
Urteil zöge `/leistungen` und `/referenzen` mit hinein.

**Auto-Modus (Ansage Ayham, 26.08.2026).** Die Prüfungen bleiben vollständig und
sind an einer Stelle härter als von Hand: **kein `--trotzdem`**, ein harter
Befund blockiert ausnahmslos; Tests und Build laufen zusätzlich **nach** dem
Statuswechsel; ohne `BLOG_ENGINE_FREIGABE_VON` passiert gar nichts. Was entfällt,
ist der Mensch, der die Prüfung auslöst — der Name in `freigabe` bedeutet dann
stehende redaktionelle Verantwortung, nicht „gelesen". Tragweite im Kopf von
`lib/veroeffentlichen.ts`, Tore unter Test. Abschalten: siehe Tabelle oben.

⚠️ Der Auto-Modus stellt nur eigene Dateien bereit (kein `git add -A`) und rebast
vor dem Schieben — aber **ein Deploy liefert alles aus, was in `main` liegt.**
Fremde Commits im Push werden protokolliert, nicht zurückgehalten.

**Das Substanz-Tor:** Jedes Thema in `content/seo/themen-pool.json` trägt
`substanz` — den nicht generierbaren Anteil (gemessene Zahl, echte
Konfiguration, Entscheidung mit Begründung, Fehler mit Kosten, gelesene
Primärquelle). **`substanz: null` ⇒ wird nie produziert.** Ist kein Thema mit
Eigenanteil da, erscheint an dem Tag nichts — vorgesehener Zustand, kein Ausfall.

**Aktuelle KI-Themen: nur mit Eigenanteil** (Entscheidung Ayham, 05.09.2026).
Der Blog soll die neuesten Modelle und Meldungen behandeln — aber das
Substanz-Tor bleibt unangetastet. Nicht „Modell X ist erschienen", sondern
„Modell X an unserem eigenen Blog-Prompt gemessen: was sich ändert"
(`substanz.art: eigene-messung`) oder „die Modellkarte gelesen"
(`primaerquelle`). Die Meldung ist der Anlass, der Eigenanteil ist der Artikel.

**Wie die Engine an aktuelle Fakten kommt** (gebaut am 05.09.2026). Ein Thema
kann `aktualitaet: { suche, fenster }` tragen. Dann holt Schritt 04 vor der
regulären Recherche frische Quellen — **unabhängig von DataForSEO**, dessen
Budget genau dann aufgebraucht ist, wenn man es braucht. Dazu kennt der
Schreibprompt jetzt `{{HEUTE}}`: Ohne das Datum hält ein Modell seinen
Trainingsstand für die Gegenwart und schreibt „seit kurzem" über etwas, das ein
Jahr alt ist.

⚠️ **Zwei Firecrawl-Fallen, beide antworten mit HTTP 200 und leerer Liste** —
kein Fehler, keine Meldung, nichts im Protokoll:

1. **Der Zeitfilter `tbs: "qdr:*"` liefert nichts.** Nachgestellt am 05.09.2026
   über zwei Suchanfragen, beide Fenster, mit und ohne Volltext: immer null.
   Dieselbe Anfrage ohne `tbs` liefert Treffer. Der Weg zu aktuellen Quellen ist
   **`quellen: ["news"]`** — die Quelle sortiert von sich aus nach Datum und
   füllt `Suchtreffer.datum`.
2. **`tbs` zusammen mit `mitVolltext: true`** ebenso. Deshalb zwei Schritte:
   suchen ohne Volltext, dann `seitenLesen` — was ohnehin besser ist, weil es
   Cookie-Wände und Abwehr erkennt.

Erster echter Lauf: `openai.com` (8 h alt), `blog.google` (2 Tage), `hpcwire.com`
(1 Tag) — 10 belegte Zahlen, 5 Credits. Die Herstellerseite als erster Treffer
ist genau die `primaerquelle`, die das Substanz-Tor sehen will.

`fenster` ist keine Zierde: `imFenster()` prüft die relative Datumsangabe und
warnt, wenn keine Quelle mehr hineinfällt (`04-aktualitaet.test.ts`).

⚠️ **Der Themen-Vorrat steht unter demselben Schema wie der fertige Artikel**
(`themen-pool.test.ts`). Am 07.09.2026 lief die Automatik technisch fehlerfrei
durch — vier frische Quellen, `openai.com` drei Minuten alt, sechs Seiten
ausgewertet, zehn Lücken, ein vollständiger Artikel — und verwarf ihn am Ende
am Datenmodell: `substanz.beschreibung` 439 Zeichen statt 400. Der Wert stand
seit zwei Tagen im Vorrat, das Modell hatte ihn korrekt übernommen. Geprüft
wurde bis dahin nur das Ergebnis, nie die Eingabe — also war der Fehler erst
nach 0,13 $ DataForSEO, acht Credits und 50.000 Token sichtbar, und der Tag
blieb ohne Artikel. Ein Eintrag im Vorrat ist zwei Minuten Arbeit; ihn vorher
zu prüfen kostet nichts.


**Sechs harte Tore** (jedes bricht Build oder Lauf ab): Substanz · ein Keyword,
ein Artikel · keine Fremdzahl ohne `quellen` mit URL und Abrufdatum ·
namentlicher Autor aus `autoren.json`, nie ein Modell · jeder interne Link mit
Ankertext wörtlich im zugewiesenen Absatz · `status: "veroeffentlicht"` verlangt
ein `freigabe`-Objekt.

**Zwei Wege:** `blog:brief` erzeugt ein Briefing aus dem, was im Repo liegt —
kostenlos, ohne Zugangsdaten, geschrieben wird von Hand. Der volle Lauf kostet
rund 44 Cent je Artikel plus DataForSEO und kann dafür die Ergebnisseite lesen.

**Bewusst nicht gebaut:** FAQPage-Schema, `keywords`/`wordCount`/`speakable` im
JSON-LD, Google Indexing API (nur für JobPosting/BroadcastEvent zulässig), ein
Vorschaubild je Artikel (Buildzeit), automatischer Linkaufbau (Richtlinie
verbietet es wörtlich), eine zweite Domain für mehr Volumen.

| Was | Wo |
|---|---|
| Datenmodell (Zod), Qualitätstor | `src/lib/wissen/schema.ts` |
| Laden mit Prüfung — bricht den Build ab | `src/lib/wissen/laden.ts` |
| JSON-LD, interne Verlinkung | `src/lib/wissen/schema-org.ts`, `verlinken.tsx` |
| Hausstil, 81 Regeln | `scripts/blog-engine/lib/qualitaet.ts` |

⚠️ **`generateStaticParams` rendert alle Artikel vor.** Ab etwa 500 Artikeln auf
die neuesten 200 plus `dynamicParams: true` umstellen — Anleitung im Kopf von
`src/app/gratis-wissen/[slug]/page.tsx`.

**Zugangsdaten** in `.env`, nie ins Repo. Geladen von `lib/umgebung.ts`, das in
jedem Einstiegspunkt der **erste** Import sein muss
(`blog-engine-umgebung.test.ts`) — und den Pfad über `process.cwd()` bildet,
weshalb jeder Cron-Aufruf ein `cd` braucht.

**Geschrieben wird über OpenAI** (`lib/openai.ts`, `gpt-5.5`); Anthropic hätte
Vorrang, aber `ANTHROPIC_API_KEY` fehlt. ⚠️ OpenAIs `max_completion_tokens` zählt
die Denk-Token mit, Anthropics `max_tokens` nicht — der Adapter rechnet Spielraum
auf, sonst bricht der Text mit `finish_reason: "length"` ab.

⚠️ **DataForSEO-Guthaben knapp**, `DATAFORSEO_TAGESLIMIT_USD` steht deshalb auf
**0,15** — die Bremse muss **unter dem Guthaben und über den Kosten eines Laufs**
liegen. Sie stand bis zum 05.09.2026 auf **0,10**, und der günstigste real
gemessene Lauf kostet **0,11592 $** (`content/seo/laeufe/`): Die Bremse lag unter
den Mindestkosten, also brach **jede** Abfrage ab, bevor ein einziges
Suchergebnis kam. Schritt 03 reicht dann ein leeres Bild weiter, Schritt 04 hat
keine Adresse zu lesen — und der Artikel entsteht aus reinem Modellwissen, ohne
dass irgendwo ein Fehler steht. Nur zwei Zeilen im Protokoll verraten es:
`firecrawlCredits: 0`.

⚠️ **Eine zu niedrige Bremse sieht aus wie Sparsamkeit und ist ein Totalausfall.**
Wer sie senkt, rechnet vorher gegen den günstigsten Lauf in
`content/seo/laeufe/`.

---

## Sonderseiten mit eigenen Regeln

### Selbstcheck (`/selbstcheck_eu_ai_act`, Alias `/selbstcheck`)

Läuft **markenfrei und außerhalb der Website** (Ansage 11.08.2026): eigener
Rahmen `CheckShell` ohne Logo, ohne Hauptnavigation, ohne Ankündigungsbalken;
eigenes Vorschaubild ohne Logo; `buildMetadata({ ogImage: null, siteName: null })`;
`noindex, nofollow`; in keiner Navigation und keiner Sitemap; kein JSON-LD; null
Nennungen von „KITech". Ausnahmen mit Grund: Rechtstexte klein in der Fußzeile
(§ 5 DDG), CTA auf `/lass-uns-reden`, Domain bleibt `kitech-software.de`.

⚠️ Wer hier Logo oder die normale Fußzeile einbaut, nimmt der Seite genau die
Eigenschaft, für die sie gebaut wurde. Ebenso: Die alte Adresse
`/eu-ai-act-selbstcheck` liefert auf Ansage **404, keine Weiterleitung** — eine
308 wäre genau die Spur in `next.config.ts`, die es nicht mehr geben soll. Der
Unterstrich im Pfad weicht bewusst von kebab-case ab (Vorgabe Ayham); Google
liest `_` nicht als Worttrenner.

### Kampagnenseiten `/funnel` und `/fokus`

Eigene Domains, per `src/proxy.ts` als **Rewrite** (Adresszeile bleibt stehen).
Rahmen ist `FunnelShell` — **keine Kopfleiste**: volle Navigation gäbe kaltem
Traffic ein Dutzend Ausgänge vor dem einen Knopf. `noindex`, keine Sitemap.

**Funnel-Grundsatz (Ansage 19.08.2026):** Lead-Magnet ist bevorzugt ein
**Video**, in dem ein echtes Problem sichtbar gelöst wird — keine PDFs, keine
Checklisten, keine „3 Tipps". Der Wert liegt im Funnel selbst, nicht hinter dem
Call. Verschenkt wird **das Wissen, nicht die Ausführung**. Keine Kundendaten
ohne schriftliche Freigabe. Ausformuliert in
`.claude/skills/funnel-narrativ/reference/substanz.md`.

⚠️ Der aktuelle `/funnel` erfüllt den Grundsatz noch nicht — er bewirbt einen
Workshop, der Einblick entsteht also erst nach der Anmeldung. Offene Punkte im
Kopfkommentar von `src/data/funnel.ts`. `/fokus` ist auf Ansage leer.

### Stellenportal `/karriere`

Die vier Stellen sind Platzhalter (`isPlaceholder: true`). Solange das gilt:
beide Routen `noindex`, nicht in der Sitemap, und **kein `JobPosting`-JSON-LD**
— sonst landen erfundene Stellen in Google for Jobs. Beides hängt am
Datenzustand, nicht an einem Schalter. Bewerbungen per `mailto:` an
`info@kitech-software.de`.

### Kundenkarten und Bewertungen

`src/data/client-results.ts`. **Die Karte führt mit dem Ergebnis** — Kennzahl
groß, dann Label, ein Satz, Belege, Live-Link. Wer sie entkernt, nimmt der
Startseite ihren einzigen harten Beweis.

- `liveUrl` = das gebaute Produkt („Live im Einsatz"), `companyUrl` = die
  Website des Kunden. Nur mit geprüfter Adresse füllen.
- `klickZiel: "live"` schickt die ganze Karte auf `liveUrl` statt auf die
  Detailseite (so bei klargehalt.de).
- `label`/`summary` dürfen `duration`, `before`/`after` und `review` **nicht**
  wiederholen — die rendert die Karte bereits als eigene Zeilen.
- ⚠️ **Bewertungen und Sterne nur mit Beleg.** `review` nur füllen, wo der Satz
  wörtlich so abgegeben wurde. Erfundene Bewertungen sind nach **Anhang zu § 3
  Abs. 3 Nr. 23c UWG** abmahnbar (Schwarze Liste, ohne Interessenabwägung).
  Aktuell schriftlich belegt: Dennis Mikyas, Eugen Kretschmann.

### Popup auf der Startseite

`CallPopup.tsx`, Zeiten in `src/data/call-popup.ts`. Nur auf `/`. Öffnet
frühestens nach **25 s** und dann erst bei **6 s Ruhe**, spätestens nach 75 s;
bei Erstbesuchern erst nach entschiedenem Cookie-Banner.

⚠️ **Je kürzer die Mindestdauer, desto größer das Ranking-Risiko.** Google
wertet Overlays, die auf dem Handy kurz nach dem Laden den Inhalt verdecken, als
„intrusive interstitial" — und die Startseite ist die Seite, die ranken soll.

---

## Sicherheit und DSGVO

**Security-Header** stehen in `next.config.ts` (`headers()`), nicht in einer
nginx-Datei: CSP, HSTS, X-Frame-Options, X-Content-Type-Options,
Referrer-Policy, Permissions-Policy, COOP; `X-Powered-By` aus.

⚠️ **Die CSP kennt nur die eigene Domain, Plausible und Calendly.** Wer eine
neue externe Verbindung einbaut, trägt sie dort ein — sonst blockiert der
Browser sie stillschweigend.

**Consent:** `CookieConsent.tsx` + `lib/consent.ts` (localStorage-Key
`cookie-consent-v1`), eine Kategorie „Analytics". Plausible **und** das
Calendly-Embed laden erst nach Zustimmung — Calendly setzt echte
Third-Party-Cookies und gilt hier nicht als technisch notwendig.
Einstellungen jederzeit über den Fußzeilen-Link
(`window.dispatchEvent(new Event("cookie-consent:open"))`).

**Nie ins Repo:** Zugangsdaten, Schlüssel, Secrets. `.env` lokal, in Coolify
Environment-Variablen.

---

## Benachrichtigungen

| Weg | Wofür |
|---|---|
| `src/app/api/ereignis/route.ts` + `lib/ereignis.ts` | Sofortmeldung an `EREIGNIS_WEBHOOK_URL` (Besuch, Termin geöffnet, Popup/Telefon/E-Mail geklickt, Selbstcheck fertig) |
| `src/app/api/tagesbericht/route.ts` | Zahlen des Vortags aus der Plausible-Query-API, geschützt mit `TAGESBERICHT_SECRET` |
| `scripts/tagesbericht/sende_tagesbericht.py` | Der tatsächlich laufende Weg: Cron 8:00 Europe/Berlin, Microsoft Graph. Fragt Plausible **direkt** ab, damit Erweiterungen keinen Deploy kosten |
| `src/app/api/funnel-besuch/route.ts` | Dasselbe für `/funnel` und `/fokus` (älter; gehört mittelfristig zusammengelegt) |

`meldeEreignis()` klingelt, `trackEvent()` (Plausible) zählt — nicht verwechseln.

**Ohne Einwilligung** läuft nur das Ereignis selbst (Seite, Referrer, Kampagne):
kein Cookie, keine IP im Webhook, § 25 TDDDG greift nicht. **Mit Einwilligung**
zusätzlich die Firmenerkennung über ipinfo.io — serverseitig, nur wenn
`IPINFO_TOKEN` gesetzt ist. Cookie-Banner und `/datenschutz` benennen sie beide.

**n8n entscheidet, was klingelt** (`deploy/n8n-benachrichtigung.json`, drei
Knoten): Ein *Besuch* nur, wenn ipinfo eine **echte Firma** liefert — bei einem
Privatanschluss steht dort der Provider, nicht der Besucher. *Kontaktsignale*
(Telefon, E-Mail, Popup, Termin, Selbstcheck) gehen immer raus.

⚠️ **Der Meldeweg fällt lautlos aus.** Die Route antwortet **immer** 204 — auch
ohne `EREIGNIS_WEBHOOK_URL` und auch, wenn n8n wegbricht. Der Webhook meldet
„Workflow was started", bevor etwas passiert ist, und ein Code-Node mit
`return []` endet mit `success`. **Der Statuscode beweist nichts.** Ob eine
Meldung ankam, steht nur in n8n (Workflow `mE5M1CqXse3jETgU`, Zugang in `.env`)
oder im Postfach. Kostete zweimal Tage: erst leere Mails, dann keine.

⚠️ **Der Tagesbericht untererfasst** — wer den Banner ablehnt, taucht in keiner
Zahl auf; unter jeder Mail steht deshalb ein Satz dazu. Und **„wer war das"
beantwortet Plausible nicht**: keine Profile, keine Wiedererkennung. Ohne
`PLAUSIBLE_API_KEY` antwortet der Bericht mit 404.

**Analytics:** Plausible self-hosted auf `stats.kitech-software.de`, hardcoded in
`lib/plausible.ts` und `CookieConsent.tsx` (die `VITE_PLAUSIBLE_*` in
`.env.example` sind tot). Events: `CTA_Klick`, `Kontaktformular_gesendet`,
`Calendly_Klick`, `Scroll_90`, `Angebot_Seite`, `Lead_Qualifier_abgeschlossen`,
`Telefon_Klick`, `Email_Klick`.

---

## Hosting und Deploy

Selbstgehostet über **Coolify** (VPS), Application „KITech Website",
UUID `j9vencbq8b2nugo86eimxnku`, Dashboard `http://localhost:8000`, Token in
`/home/deploy/KITech/infra/secrets/coolify-api-token.env`.
Build Pack **`dockerfile`**, Port **3000**, Node **22**, Branch **`main`**.

**Es gibt keinen funktionierenden GitHub-Webhook.** Deploys laufen manuell über
die API — **nach explizitem Go**, nicht nach jedem Push:

```bash
curl -X GET "http://localhost:8000/api/v1/deploy?uuid=j9vencbq8b2nugo86eimxnku" \
  -H "Authorization: Bearer $COOLIFY_API_TOKEN"
```

**Vor jedem Deploy** gegen den Container prüfen — Coolify nutzt dasselbe
Dockerfile, was hier bricht, bricht auch dort:

```bash
npm run lint && npm test && npm run build
bash scripts/pruefe-container.sh      # baut, ruft 25 Routen ab, prüft JSON-LD, räumt auf
```

`npm start` taugt wegen `output: "standalone"` nur eingeschränkt — für eine
echte Prüfung immer den Container nehmen.

⚠️ **Mehrere Sessions teilen sich diesen Arbeitsbaum.** Vor Commit und Deploy
`git status --short` und `git log --oneline -3` lesen: ein Deploy liefert alles
aus, was gerade in `main` liegt. Welcher Commit läuft, verrät der Image-Tag:
`docker ps | grep j9vencbq`.

**Env in Coolify:** gesetzt ist nur `NIXPACKS_NODE_VERSION` (Altlast, ohne
Wirkung). Offen: `LOGTO_*` (eingeloggter Bereich, noch nicht freigeschaltet).
Runtime-Variablen brauchen nur einen Neustart, `NEXT_PUBLIC_*` einen Rebuild.

**Domains:** `kitech-software.de` (+ `www` per 308 auf Apex),
`funnel.` und `fokus.` per Rewrite, `app.` für den eingeloggten Bereich.

---

### Entfernt, aber wiederherstellbar

**Community und Mitgliederbereich**, am 05.08.2026 auf Ansage entfernt: die
Skool-Gruppe war nicht startklar, und ein angekündigter Mitgliederbereich ohne
Termin ist ein Versprechen, das niemand einlöst. `/community` und `/skool`
leiten per 308 auf die Startseite.

Code in Commit **`31a655b`** — ⚠️ **der Hash allein genügt nicht.** Dazu:
`navigation.ts` (Kopfzeile, Fußzeile, `siteRoutes`), `company.skoolUrl`,
`WAITLIST_WEBHOOK_URL` in `.env.example`, Redirect in `next.config.ts` zurück.

Nicht betroffen: der eingeloggte Bereich `src/app/app/` (LogTo) — weiterhin da,
nur nicht angekündigt.

---

## Firmendaten

**Eine Quelle: `src/config/company.ts`.** Ausgenommen sind die Rechtstexte,
wo die Angaben bewusst wörtlich im Text stehen.

| | |
|---|---|
| Sichtbar überall | **KITech Software** (`shortName`) |
| Impressum, Datenschutz „Verantwortliche Stelle", AGB § 1 | volle Firmierung — das ist die Rechtsperson, keine Marke |
| JSON-LD | `name` kurz, Firmierung in `legalName` |
| Telefon | **+49 151 64682544** — die eine, kanonische Nummer, identisch im Google Business Profile |
| E-Mail | info@kitech-software.de · aalkh@kitech-software.de (Ayham) |
| Adresse | Wedekindstraße 14, 30161 Hannover · Geo 52.3859/9.7529 |
| Register | HRB 230077 (Amtsgericht Hannover), gegründet 16.01.2026 · USt-IdNr. DE459778632 |
| LinkedIn | linkedin.com/in/ayham-alkhalil-66bb451b5 |

⚠️ **NAP-Konsistenz:** Name, Adresse und Telefon müssen über Website, Google
Business Profile und Verzeichnisse **identisch** sein — zwei Nummern heißen: keine
bestätigt die andere. `nap-konsistenz.test.ts` prüft Impressum, Datenschutz,
JSON-LD, StickyMobileCTA und llms.txt gegen `company.phone`.

`sameAs` enthält nur Profile, die KITech gehören: LinkedIn, Google
Business Profile (per CID, nicht per `share.google`-Link). Creditreform und
Companyhouse sind abgeschriebene Registerdaten und antworten Crawlern mit 403.

---

## Offen

Stand 07.09.2026.

| Was | Wer |
|---|---|
| ⚠️ **DataForSEO-Guthaben fast leer** — rund 0,32 $ nach dem Lauf vom 07.09. (0,13 $). Das reicht für zwei Läufe, danach schreibt die Automatik ohne Keyword-Daten weiter. `npm run bing -- keyword` liefert Volumen kostenlos, misst aber Bing statt Google — als Themenfindung brauchbar, als Ersatz nicht | Ayham |
| ⚠️ **Bing: 0 verweisende Seiten, `InIndex` fällt** (15 → 13 in vier Tagen). Bing holt die Seiten und behält sie nicht — die Ursache ist fehlende Verlinkung, nicht die Crawl-Rate. Kein Werkzeug löst das; es braucht echte Verweise von außen | Ayham |
| `openPoints` der sechs Referenzfälle — solange sie stehen, ist **keine** Detailseite indexiert | Kundenfreigaben |
| Themen-Cluster ohne Artikel — `content/seo/cluster.json` gegen `content/wissen/` (5 von 13) | Redaktion |
| KI-Partner-Verzeichnis der Wirtschaftsförderung Region Hannover: Aufnahme | Ayham |
| **Microsoft-Referenzen: einer statt keiner.** Seit `ad5ae1c` belegt ProOptima Power Automate — der erste echte Fall zur Positionierung. Power BI und Dynamics 365 stehen weiter ohne Fall da; `MicrosoftLoesungen` zeigt dafür die **Bauweise**, was keinen Fall mit Kunde und Zahl ersetzt | Ayham |
| **Microsoft-Solutions-Partner-Badge fehlt als Datei** — der Status ist da (Ansage 07.09.2026), die Darstellung steht, es fehlt nur der Download aus dem **Logo Builder im Partner Center**, je Designation eine Datei nach `public/images/siegel/`. Nachbauen ist keine Option, siehe README dort. ⚠️ Das ist zugleich der stärkste vorhandene Beleg für die Microsoft-Positionierung — stärker als jeder Text. **Einbindung macht Ayham selbst** (Ansage 07.09.2026) — die Aufnahme ist fertig und unter Test, hier ist nichts mehr zu bauen | Ayham |
| **ISO/IEC 27001 — Zertifizierung läuft**, bleibt bis zum Zertifikat draußen. Ein „in Vorbereitung" auf der Seite wirkt wie eine vorhandene Zertifizierung | Ayham |
| AWS und Google Cloud aus der Vorlage vom 07.09.2026 gehören einer anderen Firma und bleiben draußen | — |
| `llms.txt` kennt weder die Microsoft-Bauweise noch den Konformitätsblock — der Generator hat eine feste Quellenliste. KI-Systeme lesen damit eine Positionierung, die auf der Website schon weiter ist | technische Schuld |
| `/glossar/roi-garantie` und `/glossar/computer-vision` — beide Begriffe haben **null Deckung** in den Angebotsdateien, beide Seiten sind aber „Gesendet und indexiert" bei nur **11 indexierten Seiten** der ganzen Domain. Löschen kostet also Sichtbarkeit, Stehenlassen weckt eine Erwartung, die das Angebot nicht einlöst. Dritter Weg: Inhalt auf das umschreiben, was wir tun, Adresse behalten. `/glossar/mlops` war der klare Fall (Google unbekannt, 0 Verweise) und ist am 05.09. gefallen | Ayham |
| Sales Letter und `/funnel` tragen Platzhaltertext | Ayham |
| `/api/funnel-besuch` und `/api/ereignis` gehören zusammengelegt | technische Schuld |
