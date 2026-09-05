/**
 * Firecrawl API v2 — der Zugang der Blog-Engine zu fremden Seiten.
 *
 * **Warum kein offizielles SDK.** Das Paket `firecrawl` zieht axios, zod und
 * zod-to-json-schema hinter sich her und verlangt Node ≥ 22. Wir brauchen
 * davon nichts: vier POST-Requests gegen eine JSON-API, die das eingebaute
 * `fetch` von Node 20 vollständig abdeckt. Eine Abhängigkeit, die bei jedem
 * Update in das Website-Repo durchschlägt, ist für vier Endpunkte der
 * schlechtere Handel — zumal `npm install firecrawl-js` (so steht es 16× in
 * Firecrawls eigener `llms-full.txt`) gar nicht existiert.
 *
 * **Der zweite Grund wiegt schwerer:** Das SDK wiederholt fehlgeschlagene
 * Requests ausschließlich bei HTTP 502. Die viel zitierte Funktion
 * `isRetryableError` benutzt der HTTP-Transport überhaupt nicht, sie hängt nur
 * in den Polling-Schleifen von Crawl und Batch. Ein 429 fliegt dem Aufrufer
 * also sofort um die Ohren. Wer Rate-Limits ernst nimmt, baut den Backoff
 * ohnehin selbst — dann kann der Rest auch gleich hier stehen.
 *
 * **Was dieses Modul bewusst nicht kann:** kein `/v2/crawl` (asynchron, und
 * die Guthabenprüfung vorab verlangt das volle `limit` an freien Credits —
 * ohne gesetztes Limit sind das 10 000, sonst 402), kein `/v2/extract`. Der
 * Extract-Endpunkt trägt in Firecrawls eigener Vergleichstabelle den Status
 * „Use `/agent` instead"; für eine bekannte Einzel-URL ist `/v2/scrape` mit
 * dem `json`-Format ohnehin der richtige Weg — synchron, kalkulierbar,
 * 5 Credits. Genau das macht {@link strukturiertLesen}.
 *
 * Umgebungsvariablen: `FIRECRAWL_API_KEY` (Pflicht),
 * `FIRECRAWL_TAGESLIMIT_CREDITS` (Default 300), `FIRECRAWL_API_URL` (Default
 * `https://api.firecrawl.dev`, nur für Self-Hosting nötig).
 *
 * Fehlerkatalog: https://docs.firecrawl.dev/api-reference/errors
 */

// ---------------------------------------------------------------------------
// Konfiguration
// ---------------------------------------------------------------------------

const STANDARD_BASIS_URL = "https://api.firecrawl.dev";

/**
 * Wie viele Credits ein Lauf höchstens verbrennen darf, wenn niemand etwas
 * anderes sagt.
 *
 * 300 ist kein technisches Limit, sondern eine Notbremse: Der Free-Plan hat
 * 1 000 Credits im Monat, und ein Blog-Lauf, der aus Versehen in eine Schleife
 * läuft, wäre ihn in Minuten los. Wer bewusst mehr braucht, setzt
 * `FIRECRAWL_TAGESLIMIT_CREDITS` — wer sie auf `0` setzt, hat die Schnittstelle
 * für diesen Lauf abgeschaltet. Das ist Absicht: ein leeres Budget muss
 * blockieren und nicht „unbegrenzt" bedeuten.
 */
const STANDARD_TAGESLIMIT = 300;

/**
 * Wie lange ein gecachter Abruf gelten darf (2 Tage, Firecrawls eigener Wert).
 *
 * ⚠️ **Der Cache spart Zeit, kein Geld.** Ein Treffer aus dem Cache kostet
 * denselben Credit wie ein frischer Abruf — laut Doku ist er nur bis zu 500 %
 * schneller. `maxAge` ist damit ein Geschwindigkeits-Regler, kein Sparknopf;
 * wer Credits sparen will, ruft weniger Seiten ab, nicht ältere.
 */
const STANDARD_CACHE_FENSTER_MS = 172_800_000;

/**
 * Obergrenze für einen einzelnen HTTP-Request an Firecrawl.
 *
 * Muss über dem `timeout`, das wir Firecrawl für den Scrape selbst mitgeben,
 * liegen: Firecrawl stellt Aufträge bei ausgelasteter Concurrency in eine
 * Warteschlange, und die Wartezeit zählt dort gegen das Scrape-Timeout. Wer
 * hier knapper deckelt als dort, bricht Aufträge ab, die bezahlt und fast
 * fertig sind.
 */
const HTTP_TIMEOUT_MS = 120_000;

/** Wie oft nach einem wiederholbaren Fehler ein neuer Versuch startet. */
const MAX_WIEDERHOLUNGEN = 3;

/** Erste Wartezeit des Backoffs; danach verdoppelt sie sich je Versuch. */
const BACKOFF_BASIS_MS = 1_000;

/**
 * Deckel für eine einzelne Wartezeit.
 *
 * Firecrawl schickt bei 429 gelegentlich ein `Retry-After` von mehreren
 * Minuten. Ein Blog-Lauf, der zehn Minuten schweigend steht, sieht aus wie ein
 * Absturz — lieber sauber scheitern und der Aufrufer entscheidet.
 */
const BACKOFF_DECKEL_MS = 30_000;

// ---------------------------------------------------------------------------
// Fehlertypen
// ---------------------------------------------------------------------------

/** Basis aller Fehler dieses Moduls — erlaubt ein `catch` für alles Firecrawl. */
export class FirecrawlFehler extends Error {
  /** HTTP-Status, sofern eine Antwort kam. */
  readonly status?: number;
  /** Fachlicher Code aus dem Antwortkörper, z. B. `SCRAPE_TIMEOUT`. */
  readonly code?: string;
  /** Ob ein erneuter Versuch überhaupt Aussicht auf Erfolg hätte. */
  readonly retrybar: boolean;
  /** Die angefragte Ziel-URL, damit der Fehler ohne Stack lesbar bleibt. */
  readonly url?: string;

  constructor(
    nachricht: string,
    zusatz: { status?: number; code?: string; retrybar?: boolean; url?: string } = {},
  ) {
    super(nachricht);
    this.name = "FirecrawlFehler";
    this.status = zusatz.status;
    this.code = zusatz.code;
    this.retrybar = zusatz.retrybar ?? false;
    this.url = zusatz.url;
  }
}

/** Die Umgebung ist unvollständig — kein Request wurde abgeschickt. */
export class FirecrawlKonfigFehler extends FirecrawlFehler {
  constructor(nachricht: string) {
    super(nachricht);
    this.name = "FirecrawlKonfigFehler";
  }
}

/** Das Kreditbudget dieses Laufs ist aufgebraucht — kein Request wurde abgeschickt. */
export class FirecrawlBudgetFehler extends FirecrawlFehler {
  readonly verbraucht: number;
  readonly limit: number;

  constructor(nachricht: string, verbraucht: number, limit: number) {
    super(nachricht);
    this.name = "FirecrawlBudgetFehler";
    this.verbraucht = verbraucht;
    this.limit = limit;
  }
}

// ---------------------------------------------------------------------------
// Umgebung
// ---------------------------------------------------------------------------

/**
 * Holt den API-Schlüssel — oder erklärt, was fehlt.
 *
 * Der Schlüssel wird bei jedem Aufruf neu gelesen statt einmal beim Import:
 * Ein `throw` auf Modulebene macht die Datei unimportierbar, und dann kommt
 * auch niemand mehr an {@link getVerbrauch} oder die Typen. Geworfen wird
 * trotzdem sofort — vor dem ersten Byte Netzverkehr, damit ein fehlender
 * Schlüssel als klarer Satz auftaucht und nicht als 401 aus einer fremden API.
 * Wer wirklich beim Start scheitern will, ruft {@link pruefeUmgebung} auf.
 */
function schluessel(): string {
  const wert = process.env.FIRECRAWL_API_KEY?.trim();
  if (!wert) {
    throw new FirecrawlKonfigFehler(
      "FIRECRAWL_API_KEY ist nicht gesetzt. Ohne Schlüssel kann die Blog-Engine keine Seiten lesen. " +
        "Schlüssel unter https://firecrawl.dev/app/api-keys holen (beginnt mit „fc-“) und in die .env eintragen: " +
        "FIRECRAWL_API_KEY=fc-…",
    );
  }
  return wert;
}

/** Basis-URL der API; abweichend nur bei Self-Hosting. */
function basisUrl(): string {
  return (process.env.FIRECRAWL_API_URL?.trim() || STANDARD_BASIS_URL).replace(/\/+$/, "");
}

/**
 * Das Kreditbudget dieses Laufs.
 *
 * Wird bei jedem Zugriff neu gelesen, damit ein Skript die Grenze vor dem
 * ersten Aufruf noch setzen kann. Ein unlesbarer Wert fällt auf den Default
 * zurück, statt still auf `NaN` zu laufen — `NaN` würde jeden Vergleich
 * `false` ergeben und die Bremse damit lautlos ausbauen.
 */
function tageslimit(): number {
  const roh = process.env.FIRECRAWL_TAGESLIMIT_CREDITS?.trim();
  if (!roh) return STANDARD_TAGESLIMIT;
  const zahl = Number(roh);
  if (!Number.isFinite(zahl) || zahl < 0) return STANDARD_TAGESLIMIT;
  return Math.floor(zahl);
}

/**
 * Prüft die Umgebung, ohne einen Request zu schicken.
 *
 * Gedacht für den Start eines Skripts: lieber nach zwei Millisekunden mit
 * einer klaren Meldung abbrechen als nach zwanzig Minuten Recherchearbeit.
 */
export function pruefeUmgebung(): void {
  schluessel();
}

// ---------------------------------------------------------------------------
// Krediterfassung
// ---------------------------------------------------------------------------

/** Die Vorgänge, die dieses Modul auslöst — und getrennt abrechnet. */
export type Operation = "scrape" | "scrape-json" | "search" | "map";

export interface Verbrauchszeile {
  aufrufe: number;
  credits: number;
}

export interface Verbrauchsbericht {
  /** Summe aller bisher verbuchten Credits in diesem Prozess. */
  credits: number;
  /** Die geltende Obergrenze. */
  limit: number;
  /** Was davon noch übrig ist. */
  rest: number;
  /** Zahl der abgeschickten Requests. */
  aufrufe: number;
  /** Aufschlüsselung, damit sichtbar wird, wo das Geld hingeht. */
  nachOperation: Record<Operation, Verbrauchszeile>;
}

/**
 * Der Zähler lebt im Modul, nicht in einer Instanz.
 *
 * Damit teilen sich alle Aufrufer eines Laufs dasselbe Budget — sonst hätte
 * jeder Rechercheschritt sein eigenes und die Summe wäre unbegrenzt. Der Preis
 * dafür: der Zähler kennt nur diesen Prozess. „Tageslimit" heißt also
 * *Limit pro Lauf*, nicht pro Kalendertag; wer die Engine zehnmal am Tag
 * startet, hat zehnmal das Budget. Die echte Tagesabrechnung führt Firecrawl,
 * abrufbar über `/v2/team/credit-usage`.
 */
let verbrauchteCredits = 0;
let abgeschickteAufrufe = 0;
const nachOperation: Record<Operation, Verbrauchszeile> = {
  scrape: { aufrufe: 0, credits: 0 },
  "scrape-json": { aufrufe: 0, credits: 0 },
  search: { aufrufe: 0, credits: 0 },
  map: { aufrufe: 0, credits: 0 },
};

/** Der Kreditstand dieses Laufs, als Kopie — der Bericht ist Lesestoff, kein Griff an den Zähler. */
export function getVerbrauch(): Verbrauchsbericht {
  const limit = tageslimit();
  return {
    credits: verbrauchteCredits,
    limit,
    rest: Math.max(0, limit - verbrauchteCredits),
    aufrufe: abgeschickteAufrufe,
    nachOperation: {
      scrape: { ...nachOperation.scrape },
      "scrape-json": { ...nachOperation["scrape-json"] },
      search: { ...nachOperation.search },
      map: { ...nachOperation.map },
    },
  };
}

/**
 * Setzt die Erfassung zurück — für Tests und für Prozesse, die dauerhaft laufen.
 *
 * In einem normalen Skriptlauf hat das nichts zu suchen: Wer den Zähler mitten
 * im Lauf nullt, hebt genau die Bremse auf, für die er gebaut wurde.
 */
export function setzeVerbrauchZurueck(): void {
  verbrauchteCredits = 0;
  abgeschickteAufrufe = 0;
  for (const zeile of Object.values(nachOperation)) {
    zeile.aufrufe = 0;
    zeile.credits = 0;
  }
}

/**
 * Hält den Lauf an, *bevor* er das Budget reißt.
 *
 * Die Prüfung passiert vor dem Request, nicht danach — nach dem Request sind
 * die Credits weg, und ein Fehler hilft dann niemandem mehr. Gerechnet wird
 * mit dem teuersten plausiblen Ausgang: lieber einmal zu früh bremsen als
 * einmal zu spät.
 */
function budgetPruefen(geschaetzteCredits: number, was: string): void {
  const limit = tageslimit();
  if (verbrauchteCredits + geschaetzteCredits > limit) {
    throw new FirecrawlBudgetFehler(
      `Kreditlimit erreicht: ${was} würde etwa ${geschaetzteCredits} Credits kosten, verbraucht sind ${verbrauchteCredits} von ${limit}. ` +
        "Entweder weniger Seiten abrufen oder FIRECRAWL_TAGESLIMIT_CREDITS anheben.",
      verbrauchteCredits,
      limit,
    );
  }
}

/**
 * Bucht, was tatsächlich verbraucht wurde.
 *
 * Wo Firecrawl selbst ein `creditsUsed` mitschickt (Suche tut das), gilt diese
 * Zahl — die eigene Rechnung ist immer nur eine Nachbildung der Preisliste und
 * geht schief, sobald Firecrawl sie ändert. Nur wo nichts mitkommt, zählen wir
 * selbst: Scrape 1 Credit je Seite, `json`-Format 4 Credits Aufschlag, Map
 * 1 Credit je Aufruf, Suche 2 Credits je angefangenen 10 Ergebnissen.
 */
function verbrauchBuchen(operation: Operation, credits: number): void {
  verbrauchteCredits += credits;
  abgeschickteAufrufe += 1;
  nachOperation[operation].aufrufe += 1;
  nachOperation[operation].credits += credits;
}

// ---------------------------------------------------------------------------
// HTTP-Schicht mit Backoff
// ---------------------------------------------------------------------------

interface AntwortHuelle<T> {
  success?: boolean;
  data?: T;
  error?: string;
  code?: string;
  details?: unknown;
  creditsUsed?: number;
  warning?: string | null;
}

/**
 * Ob ein Fehlschlag es noch einmal wert ist.
 *
 * ⚠️ Die verbreitete Faustregel „4xx nie wiederholen" stammt aus dem SDK und
 * ist hier falsch. Firecrawls Fehlerkatalog führt eine eigene Retry-Spalte und
 * sagt dazu ausdrücklich: „Treat the Retryable column as authoritative; do not
 * infer from the HTTP status alone." Danach sind **408** (Zeitüberschreitung)
 * und **429** (Rate- oder Concurrency-Limit) sehr wohl wiederholbar, obwohl
 * beide 4xx sind.
 *
 * Nicht wiederholt wird 422: Der Katalog sagt dort „sometimes", aber der
 * typische Auslöser ist ein ungültiges JSON-Schema — dasselbe Schema ein
 * zweites Mal zu schicken kostet Zeit und ändert nichts.
 */
function istWiederholbar(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

/** Was ein Status bedeutet, in einem Satz, den man ohne Doku versteht. */
function statusErklaerung(status: number): string {
  switch (status) {
    case 400:
      return "Firecrawl hat die Anfrage abgelehnt (ungültige Parameter).";
    case 401:
      return "Der API-Schlüssel ist ungültig oder abgelaufen.";
    case 402:
      return "Das Firecrawl-Guthaben ist aufgebraucht.";
    case 403:
      return "Der API-Schlüssel darf diesen Endpunkt nicht benutzen (fehlender Scope).";
    case 404:
      return "Endpunkt oder Auftrag existiert nicht.";
    case 408:
      return "Firecrawl hat die Zielseite nicht rechtzeitig geladen.";
    case 409:
      return "Konflikt — der Auftrag steht in einem Zustand, der diesen Aufruf nicht zulässt.";
    case 413:
      return "Die Anfrage ist zu groß (meist ein zu umfangreiches Schema oder zu viele URLs).";
    case 422:
      return "Firecrawl konnte die Eingabe nicht verarbeiten (häufig ein ungültiges JSON-Schema).";
    case 429:
      return "Rate- oder Concurrency-Limit erreicht.";
    case 500:
      return "Interner Fehler bei Firecrawl.";
    case 502:
      return "Firecrawl ist über das Gateway nicht erreichbar.";
    case 503:
      return "Firecrawl ist vorübergehend nicht verfügbar.";
    case 504:
      return "Zeitüberschreitung im Firecrawl-Gateway.";
    default:
      return `Unerwartete Antwort (HTTP ${status}).`;
  }
}

/**
 * Wie lange bis zum nächsten Versuch.
 *
 * `Retry-After` schlägt jede eigene Rechnung: Der Server weiß, wann sein
 * Fenster aufgeht, wir raten nur. Der Header kommt in zwei Formen vor —
 * Sekunden oder HTTP-Datum —, beide werden gelesen. Zum Exponentialschritt
 * kommt ein Zufallsanteil, damit parallele Abrufe nach einem 429 nicht
 * geschlossen im selben Moment wieder anklopfen und dasselbe Limit erneut
 * reißen.
 */
function wartezeitMs(versuch: number, retryAfter: string | null): number {
  if (retryAfter) {
    const sekunden = Number(retryAfter);
    if (Number.isFinite(sekunden) && sekunden >= 0) {
      return Math.min(sekunden * 1000, BACKOFF_DECKEL_MS);
    }
    const zeitpunkt = Date.parse(retryAfter);
    if (Number.isFinite(zeitpunkt)) {
      return Math.min(Math.max(0, zeitpunkt - Date.now()), BACKOFF_DECKEL_MS);
    }
  }
  const exponentiell = BACKOFF_BASIS_MS * 2 ** versuch;
  const streuung = Math.random() * BACKOFF_BASIS_MS;
  return Math.min(exponentiell + streuung, BACKOFF_DECKEL_MS);
}

const schlafen = (ms: number): Promise<void> => new Promise((fertig) => setTimeout(fertig, ms));

/**
 * Ein POST an Firecrawl, mit Backoff und einem Timeout, das der Aufrufer
 * abbrechen kann.
 *
 * Netzfehler ohne Antwort (DNS, abgerissene Verbindung) und unser eigenes
 * Timeout werden wie 5xx behandelt: Es gibt keinen Grund anzunehmen, dass der
 * Server den Auftrag überhaupt gesehen hat. Bricht dagegen der Aufrufer über
 * sein `signal` ab, ist das eine Entscheidung und kein Fehler — dann wird
 * nicht wiederholt.
 */
async function anfrage<T>(
  pfad: string,
  koerper: Record<string, unknown>,
  fremdesSignal?: AbortSignal,
): Promise<AntwortHuelle<T>> {
  const key = schluessel();
  const ziel = `${basisUrl()}${pfad}`;
  let letzterFehler: unknown;

  for (let versuch = 0; versuch <= MAX_WIEDERHOLUNGEN; versuch += 1) {
    const steuerung = new AbortController();
    let zeitAbgelaufen = false;
    const uhr = setTimeout(() => {
      zeitAbgelaufen = true;
      steuerung.abort();
    }, HTTP_TIMEOUT_MS);
    const weiterreichen = () => steuerung.abort();
    fremdesSignal?.addEventListener("abort", weiterreichen, { once: true });

    try {
      if (fremdesSignal?.aborted) throw new FirecrawlFehler("Abgebrochen.", { url: ziel });

      const antwort = await fetch(ziel, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(koerper),
        signal: steuerung.signal,
      });

      const text = await antwort.text();
      let huelle: AntwortHuelle<T> = {};
      try {
        huelle = text ? (JSON.parse(text) as AntwortHuelle<T>) : {};
      } catch {
        // Ein nicht-JSON-Körper kommt praktisch nur von Proxys und Fehlerseiten
        // vor der API. Der Rohtext ist dann die einzige Spur, also wandert er
        // gekürzt in die Meldung statt in einen Parser-Fehler.
        if (antwort.ok) {
          throw new FirecrawlFehler(
            `Firecrawl hat kein JSON geliefert: ${text.slice(0, 200)}`,
            { status: antwort.status, url: ziel },
          );
        }
      }

      if (!antwort.ok) {
        const retrybar = istWiederholbar(antwort.status);
        const fehler = new FirecrawlFehler(
          `${statusErklaerung(antwort.status)} ${huelle.error ?? ""}`.trim(),
          { status: antwort.status, code: huelle.code, retrybar, url: ziel },
        );
        if (retrybar && versuch < MAX_WIEDERHOLUNGEN) {
          letzterFehler = fehler;
          await schlafen(wartezeitMs(versuch, antwort.headers.get("retry-after")));
          continue;
        }
        throw fehler;
      }

      if (huelle.success === false) {
        throw new FirecrawlFehler(
          `Firecrawl meldet einen Fehlschlag: ${huelle.error ?? "ohne Begründung"}`,
          { status: antwort.status, code: huelle.code, url: ziel },
        );
      }

      return huelle;
    } catch (fehler) {
      const abgebrochen = fehler instanceof Error && fehler.name === "AbortError";

      if (abgebrochen && !zeitAbgelaufen) {
        throw new FirecrawlFehler("Abgebrochen (Signal des Aufrufers).", { url: ziel });
      }
      if (fehler instanceof FirecrawlFehler && !fehler.retrybar) throw fehler;

      const letzterVersuch = versuch >= MAX_WIEDERHOLUNGEN;
      if (letzterVersuch) {
        if (fehler instanceof FirecrawlFehler) throw fehler;
        throw new FirecrawlFehler(
          `Firecrawl war nicht erreichbar: ${fehler instanceof Error ? fehler.message : String(fehler)}`,
          { retrybar: true, url: ziel },
        );
      }

      letzterFehler = fehler;
      await schlafen(wartezeitMs(versuch, null));
    } finally {
      clearTimeout(uhr);
      fremdesSignal?.removeEventListener("abort", weiterreichen);
    }
  }

  throw letzterFehler instanceof FirecrawlFehler
    ? letzterFehler
    : new FirecrawlFehler(`Firecrawl antwortete nach ${MAX_WIEDERHOLUNGEN + 1} Versuchen nicht.`, {
        retrybar: true,
        url: ziel,
      });
}

// ---------------------------------------------------------------------------
// Gemeinsame Typen
// ---------------------------------------------------------------------------

/** Ein JSON-Schema, wie Firecrawl es für das `json`-Format erwartet. */
export type JsonSchema = Record<string, unknown>;

/** Grundeinstellungen, die jeder Abruf einer Seite teilt. */
export interface SeiteLesenOptionen {
  /**
   * Cache-Fenster in Millisekunden. `0` erzwingt einen frischen Abruf.
   * Kostet in jedem Fall denselben Credit — siehe {@link STANDARD_CACHE_FENSTER_MS}.
   */
  maxAge?: number;
  /** Navigation, Kopf- und Fußzeile ausblenden. Standard an; für Rechtstexte gelegentlich hinderlich. */
  onlyMainContent?: boolean;
  /** Zusätzliche Wartezeit in ms, bevor gelesen wird — für Seiten, die ihren Inhalt nachladen. */
  waitFor?: number;
  /** Zeitbudget für den Scrape selbst in ms (Firecrawl-Default 60 000, Spanne 1 000–300 000). */
  timeout?: number;
  /** CSS-Selektoren, die als einzige gelesen werden. Greifen auf dem Original-DOM. */
  includeTags?: string[];
  /** CSS-Selektoren, die vorher entfernt werden — Banner, Werbung, Cookie-Schichten. */
  excludeTags?: string[];
  /** Mobile Ansicht abrufen. */
  mobil?: boolean;
  /** Land des Proxys, ISO-2. Standard `DE`. */
  land?: string;
  /** `Accept-Language` der Anfrage. Standard `de-DE`. */
  sprachen?: string[];
  /** Abbruch von außen, z. B. beim Herunterfahren des Skripts. */
  signal?: AbortSignal;
}

/** Eine gelesene Seite, auf das reduziert, was die Blog-Engine braucht. */
export interface GelesenSeite {
  /** Die URL, unter der Firecrawl den Inhalt tatsächlich gefunden hat (nach Weiterleitungen). */
  url: string;
  markdown: string;
  links: string[];
  titel: string;
  beschreibung: string;
  /** Der Status der **Zielseite**, nicht der von Firecrawl. Siehe {@link GelesenSeite.blockiert}. */
  statusCode: number;
  wortzahl: number;
  /**
   * Die Zielseite hat abgewehrt (403), war weg (404) oder war selbst kaputt.
   *
   * ⚠️ Firecrawl liefert in diesem Fall trotzdem HTTP 200 — und rechnet den
   * Credit ab. Ein zweiter Versuch kostet also erneut und ändert nichts, solange
   * die Gegenseite blockt. Solche URLs gehören aussortiert, nicht wiederholt.
   */
  blockiert: boolean;
}

/**
 * Der Textkörper wird gezählt, weil kurze Ergebnisse fast immer Fehlschläge sind:
 * Cookie-Wand, Login-Schranke oder eine leere Single-Page-App. Wer die Zahl
 * prüft, merkt es, bevor sie in einen Blogartikel wandert.
 */
function zaehleWoerter(text: string): number {
  const sauber = text.trim();
  if (!sauber) return 0;
  return sauber.split(/\s+/).length;
}

/** Baut den `location`-Block; deutsche Ergebnisse braucht diese Website immer. */
function ort(optionen: Pick<SeiteLesenOptionen, "land" | "sprachen">) {
  return {
    country: optionen.land ?? "DE",
    languages: optionen.sprachen ?? ["de-DE"],
  };
}

/**
 * Die Scrape-Optionen, die Firecrawl direkt versteht.
 *
 * Der `proxy`-Parameter fehlt hier bewusst: Firecrawl hat ihn für deprecated
 * erklärt und empfiehlt den Default `auto`, der bei Fehlschlag selbst auf den
 * stärkeren Modus umschaltet. Ihn aktiv zu setzen wäre auch fachlich falsch —
 * `enhanced` gibt es nur für US und NL, deutsche Proxys laufen ausschließlich
 * über `basic`.
 */
function scrapeRumpf(optionen: SeiteLesenOptionen): Record<string, unknown> {
  const rumpf: Record<string, unknown> = {
    onlyMainContent: optionen.onlyMainContent ?? true,
    maxAge: optionen.maxAge ?? STANDARD_CACHE_FENSTER_MS,
    location: ort(optionen),
  };
  if (optionen.waitFor !== undefined) rumpf.waitFor = optionen.waitFor;
  if (optionen.timeout !== undefined) rumpf.timeout = optionen.timeout;
  if (optionen.includeTags?.length) rumpf.includeTags = optionen.includeTags;
  if (optionen.excludeTags?.length) rumpf.excludeTags = optionen.excludeTags;
  if (optionen.mobil !== undefined) rumpf.mobile = optionen.mobil;
  return rumpf;
}

interface ScrapeAntwort {
  markdown?: string;
  links?: string[];
  json?: unknown;
  metadata?: {
    title?: string;
    description?: string;
    sourceURL?: string;
    url?: string;
    statusCode?: number;
  };
  warning?: string | null;
}

// ---------------------------------------------------------------------------
// Öffentliche Funktionen
// ---------------------------------------------------------------------------

/**
 * Liest eine einzelne Seite als Markdown, samt ausgehenden Links.
 *
 * `markdown` und `links` in einem Aufruf, weil beide zusammen einen Credit
 * kosten und getrennt zwei. Die Links sind für die Blog-Engine der halbe Wert
 * des Abrufs — aus ihnen entsteht die nächste Rechercherunde.
 *
 * Wirft **nicht**, wenn die Zielseite blockt: Ein 403 der Gegenseite liefert
 * gelegentlich noch brauchbaren Anrisstext, und ein Fehler an dieser Stelle
 * lädt den Aufrufer geradezu ein, es gleich noch einmal zu versuchen — was
 * einen weiteren Credit kostet und dasselbe Ergebnis bringt. Stattdessen steht
 * es in {@link GelesenSeite.blockiert}.
 *
 * Kosten: 1 Credit.
 *
 * @param url Vollständige Adresse inklusive Schema.
 * @param optionen Feineinstellungen; ohne Angabe deutsche Lokalisierung und Zwei-Tage-Cache.
 */
export async function seiteLesen(
  url: string,
  optionen: SeiteLesenOptionen = {},
): Promise<GelesenSeite> {
  schluessel();
  budgetPruefen(1, `Seite lesen (${url})`);

  const huelle = await anfrage<ScrapeAntwort>(
    "/v2/scrape",
    { url, formats: ["markdown", "links"], ...scrapeRumpf(optionen) },
    optionen.signal,
  );

  verbrauchBuchen("scrape", huelle.creditsUsed ?? 1);

  const daten = huelle.data ?? {};
  const meta = daten.metadata ?? {};
  const markdown = daten.markdown ?? "";
  const statusCode = meta.statusCode ?? 200;

  return {
    url: meta.sourceURL ?? meta.url ?? url,
    markdown,
    links: daten.links ?? [],
    titel: meta.title ?? "",
    beschreibung: meta.description ?? "",
    statusCode,
    wortzahl: zaehleWoerter(markdown),
    blockiert: statusCode >= 400,
  };
}

/** Ein Ergebnis aus {@link seitenLesen} — entweder Inhalt oder Begründung, nie beides. */
export type SeitenErgebnis =
  | { url: string; ok: true; seite: GelesenSeite }
  | { url: string; ok: false; fehler: string; status?: number; retrybar: boolean };

export interface SeitenLesenOptionen extends SeiteLesenOptionen {
  /**
   * Wie viele Seiten gleichzeitig laufen dürfen. Standard 3.
   *
   * Der Free-Plan erlaubt zwei parallele Browser, Hobby fünf — wer darüber
   * geht, holt sich statt Geschwindigkeit nur 429er ab, die der Backoff dann
   * wieder abwartet. Drei ist der Kompromiss, der auf beiden Plänen läuft.
   */
  parallel?: number;
}

/**
 * Liest mehrere Seiten mit begrenzter Nebenläufigkeit.
 *
 * **Ein Fehlschlag beendet nicht den Lauf.** Bei zwanzig Recherche-URLs ist
 * immer eine dabei, die blockt, umgezogen ist oder in ein Timeout läuft — wenn
 * die neunzehn anderen deshalb wegfallen, sind ihre Credits verbrannt und die
 * Arbeit ist weg. Jede URL bekommt deshalb ihr eigenes Ergebnis, und der
 * Aufrufer entscheidet, ob ihm die Ausbeute reicht.
 *
 * Die Reihenfolge der Rückgabe entspricht der Reihenfolge der Eingabe, damit
 * sich Ergebnisse ohne Suchen wieder zuordnen lassen.
 *
 * Kosten: 1 Credit je Seite. Reißt das Budget mittendrin, brechen die
 * restlichen URLs als Fehlerergebnis ab — abgerufene Seiten bleiben erhalten.
 *
 * @param urls Die Adressen, in gewünschter Reihenfolge.
 * @param optionen Wie {@link seiteLesen}, zusätzlich `parallel`.
 */
export async function seitenLesen(
  urls: string[],
  optionen: SeitenLesenOptionen = {},
): Promise<SeitenErgebnis[]> {
  schluessel();

  const grenze = Math.max(1, optionen.parallel ?? 3);
  const ergebnisse: SeitenErgebnis[] = new Array(urls.length);
  let naechster = 0;

  async function arbeiter(): Promise<void> {
    while (naechster < urls.length) {
      const index = naechster;
      naechster += 1;
      const url = urls[index];
      try {
        ergebnisse[index] = { url, ok: true, seite: await seiteLesen(url, optionen) };
      } catch (fehler) {
        const f = fehler instanceof FirecrawlFehler ? fehler : null;
        ergebnisse[index] = {
          url,
          ok: false,
          fehler: fehler instanceof Error ? fehler.message : String(fehler),
          status: f?.status,
          retrybar: f?.retrybar ?? false,
        };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(grenze, urls.length) }, arbeiter));
  return ergebnisse;
}

export interface WebsucheOptionen {
  /**
   * Zahl der Treffer, Standard 5.
   *
   * Firecrawl zählt das Limit **je Quelle**, nicht insgesamt — bei mehreren
   * `sources` vervielfacht sich also, was am Ende abgerechnet wird.
   */
  limit?: number;
  /**
   * Zeitfilter: `qdr:d` (24 h), `qdr:w`, `qdr:m`, `qdr:y`, `sbd:1` (nach Datum
   * sortiert), kombinierbar als `sbd:1,qdr:w`.
   *
   * Für einen Blog, der aktuell wirken soll, ist das der wichtigste Parameter
   * überhaupt: Ohne ihn liefert die Suche bevorzugt, was seit Jahren gut
   * rankt. Wirkt nur auf die Quelle `web`.
   *
   * ⚠️ **Nicht zusammen mit `mitVolltext: true` benutzen.** Die Kombination
   * liefert eine **leere Trefferliste** — kein Fehler, kein HTTP-Status, keine
   * Meldung, nur `[]`. Nachgestellt am 05.09.2026: vier Versuche über zwei
   * Suchanfragen und die Fenster `qdr:w` und `qdr:m`, mit Volltext immer null
   * Treffer, dieselbe Anfrage ohne Volltext mit Treffern.
   *
   * Wer beides braucht, macht zwei Schritte: hier ohne Volltext suchen, dann
   * die Adressen an {@link seitenLesen} geben. Kostet dasselbe und erkennt
   * zusätzlich Cookie-Wände und Abwehr. So macht es `schritte/04-recherche.ts`.
   */
  /**
   * Welche Firecrawl-Quellen abgefragt werden. Standard `["web"]`.
   *
   * ⚠️ **`["news"]` ist der einzige verlässliche Weg zu aktuellen Quellen.**
   * Der Zeitfilter {@link WebsucheOptionen.tbs} ist für `qdr:*` kaputt (siehe
   * dort); die News-Quelle ist es nicht, liefert von sich aus nach Datum
   * sortiert und füllt zusätzlich {@link Suchtreffer.datum}. Nachgemessen am
   * 05.09.2026: `sources: ["news"]` fand zu „reasoning model release" als
   * ersten Treffer die Herstellerseite selbst, acht Stunden alt — also genau
   * die Primärquelle, die das Substanz-Tor sehen will.
   *
   * Firecrawl zählt `limit` **je Quelle**: Zwei Quellen sind doppelte Kosten.
   */
  quellen?: Array<"web" | "news">;
  tbs?: string;
  /** Land der Suche, ISO-2. Standard `DE` — Firecrawls Default wäre `US`. */
  land?: string;
  /** Ort für lokale Ergebnisse, z. B. `"Hannover,Germany"`. */
  ortsangabe?: string;
  /** Nur diese Domains. Schließt `excludeDomains` aus. */
  includeDomains?: string[];
  /** Diese Domains nicht. Schließt `includeDomains` aus. */
  excludeDomains?: string[];
  /**
   * Volltext statt Snippet, Standard an.
   *
   * Firecrawl erledigt Suche und Abruf in einem Aufruf; getrennt wären es ein
   * Suchrequest plus n Scrape-Requests bei gleichem Preis, aber n-fachem
   * Rate-Limit-Risiko.
   */
  mitVolltext?: boolean;
  /** Zeitbudget in ms (Firecrawl-Default 60 000). */
  timeout?: number;
  signal?: AbortSignal;
}

export interface Suchtreffer {
  url: string;
  titel: string;
  beschreibung: string;
  /** Rang in der Trefferliste — nützlich, um Quellen zu gewichten. */
  position: number;
  /** Leer, wenn `mitVolltext: false` gesetzt war oder die Seite blockte. */
  markdown: string;
  wortzahl: number;
  /**
   * Wann die Meldung erschien — nur bei `quellen: ["news"]` gefüllt.
   *
   * Firecrawl liefert das relativ („8 hours ago", „2 days ago") und nicht
   * normalisiert. Für den Zweck reicht das: Es beantwortet die Frage, ob eine
   * Quelle frisch genug ist, ohne dass irgendwo ein Datum geparst werden muss.
   */
  datum: string;
}

interface SuchTrefferRoh {
  url?: string;
  title?: string;
  description?: string;
  position?: number;
  markdown?: string;
  /** Nur bei `sources: ["news"]`. Firecrawl liefert relativ („8 hours ago") oder als Datum. */
  date?: string;
}

interface SuchAntwort {
  web?: SuchTrefferRoh[];
  news?: SuchTrefferRoh[];
}

/**
 * Websuche mit Volltext der Treffer in einem einzigen Aufruf.
 *
 * Kosten: 2 Credits je angefangene 10 Ergebnisse (11 Treffer kosten also
 * bereits 4) plus 1 Credit je Seite, die für den Volltext gelesen wird. Zehn
 * Treffer mit Volltext sind damit 12 Credits — bei einem Budget von 300 der
 * mit Abstand teuerste Aufruf dieses Moduls. Wer breit recherchiert, sollte
 * `limit` klein halten und lieber gezielt nachlesen.
 *
 * Nur `sources: ["web"]`: News- und Bildtreffer bringen der Blog-Engine
 * nichts, würden aber gegen dasselbe Limit zählen und dasselbe kosten.
 *
 * @param query Suchbegriff, höchstens 500 Zeichen. Operatoren wie `site:`,
 *   `-wort`, `"exakt"` und `filetype:` funktionieren.
 * @param optionen Filter und Lokalisierung.
 */
export async function websucheMitInhalt(
  query: string,
  optionen: WebsucheOptionen = {},
): Promise<Suchtreffer[]> {
  schluessel();

  const limit = Math.max(1, Math.min(100, optionen.limit ?? 5));
  const mitVolltext = optionen.mitVolltext ?? true;
  const geschaetzt = Math.ceil(limit / 10) * 2 + (mitVolltext ? limit : 0);
  budgetPruefen(geschaetzt, `Websuche „${query}“`);

  const rumpf: Record<string, unknown> = {
    query,
    limit,
    sources: optionen.quellen ?? ["web"],
    country: optionen.land ?? "DE",
  };
  if (optionen.tbs) rumpf.tbs = optionen.tbs;
  if (optionen.ortsangabe) rumpf.location = optionen.ortsangabe;
  if (optionen.timeout !== undefined) rumpf.timeout = optionen.timeout;
  // Firecrawl weist beide Listen gemeinsam ab; die Einschränkung gewinnt, weil
  // sie die engere Absicht ist.
  if (optionen.includeDomains?.length) rumpf.includeDomains = optionen.includeDomains;
  else if (optionen.excludeDomains?.length) rumpf.excludeDomains = optionen.excludeDomains;
  if (mitVolltext) {
    rumpf.scrapeOptions = {
      formats: ["markdown"],
      onlyMainContent: true,
      maxAge: STANDARD_CACHE_FENSTER_MS,
    };
  }

  const huelle = await anfrage<SuchAntwort | SuchAntwort["web"]>("/v2/search", rumpf, optionen.signal);

  // Ältere Fassungen der API geben `data` direkt als Liste zurück, neuere als
  // Objekt mit einer Liste je Quelle. Beide Formen zu lesen kostet drei Zeilen
  // und erspart einen Ausfall beim nächsten API-Update.
  // Beide Listen zusammenführen: Wer `quellen: ["web", "news"]` fragt, will
  // beides, und der Aufrufer soll nicht zwei Formen unterscheiden müssen.
  const daten = huelle.data as SuchAntwort | SuchTrefferRoh[] | undefined;
  const roh: SuchTrefferRoh[] = Array.isArray(daten)
    ? daten
    : [...(daten?.news ?? []), ...(daten?.web ?? [])];

  verbrauchBuchen(
    "search",
    huelle.creditsUsed ?? Math.ceil(roh.length / 10) * 2 + (mitVolltext ? roh.length : 0),
  );

  return roh.map((treffer, index) => {
    const markdown = treffer.markdown ?? "";
    return {
      url: treffer.url ?? "",
      titel: treffer.title ?? "",
      beschreibung: treffer.description ?? "",
      position: treffer.position ?? index + 1,
      markdown,
      wortzahl: zaehleWoerter(markdown),
      datum: treffer.date ?? "",
    };
  });
}

export interface StrukturErgebnis<T> {
  /** Was das Modell aus der Seite gelesen hat, geformt nach dem übergebenen Schema. */
  daten: T;
  /** Die tatsächlich gelesene Adresse. */
  url: string;
  statusCode: number;
  /** Siehe {@link GelesenSeite.blockiert} — bei `true` sind die Daten wertlos, aber bezahlt. */
  blockiert: boolean;
}

/**
 * Liest eine bekannte Seite in eine vorgegebene Struktur — der Ersatz für `/v2/extract`.
 *
 * **Warum nicht `/v2/extract`:** Firecrawl führt den Endpunkt in der eigenen
 * Vergleichstabelle mit dem Status „Use `/agent` instead". Für eine einzelne,
 * bekannte URL wäre er ohnehin der falsche Griff: `/extract` arbeitet
 * asynchron (Auftrag anlegen, pollen, Ergebnis abholen) und rechnet
 * tokenbasiert ab, während `/v2/scrape` mit dem `json`-Format dieselbe Arbeit
 * synchron und zum festen Preis erledigt. `/extract` lohnt erst bei vielen
 * oder unbekannten URLs — und dafür ist heute `/agent` zuständig.
 *
 * Kosten: 5 Credits (1 für die Seite, 4 Aufschlag für die LLM-Extraktion).
 * Das ist das Fünffache eines normalen Abrufs — wer nur Text braucht, nimmt
 * {@link seiteLesen}.
 *
 * @param url Die Seite, die gelesen werden soll.
 * @param jsonSchema JSON-Schema der gewünschten Struktur. `required` großzügig
 *   zu setzen ist ein Eigentor: Was auf der Seite fehlt, erfindet das Modell
 *   dann eher, als das Feld leer zu lassen.
 * @param prompt Was extrahiert werden soll, in einem Satz. Schema und Prompt
 *   ergänzen sich — das Schema gibt die Form, der Prompt die Absicht.
 * @param optionen Wie bei {@link seiteLesen}.
 */
export async function strukturiertLesen<T = Record<string, unknown>>(
  url: string,
  jsonSchema: JsonSchema,
  prompt: string,
  optionen: SeiteLesenOptionen = {},
): Promise<StrukturErgebnis<T>> {
  schluessel();
  budgetPruefen(5, `Strukturierte Extraktion (${url})`);

  const huelle = await anfrage<ScrapeAntwort>(
    "/v2/scrape",
    {
      url,
      formats: [{ type: "json", schema: jsonSchema, prompt }],
      ...scrapeRumpf(optionen),
    },
    optionen.signal,
  );

  verbrauchBuchen("scrape-json", huelle.creditsUsed ?? 5);

  const daten = huelle.data ?? {};
  const meta = daten.metadata ?? {};
  const statusCode = meta.statusCode ?? 200;

  return {
    daten: (daten.json ?? {}) as T,
    url: meta.sourceURL ?? meta.url ?? url,
    statusCode,
    blockiert: statusCode >= 400,
  };
}

export interface SeitenkarteOptionen {
  /**
   * Sortiert die Treffer nach Relevanz zu diesem Begriff.
   *
   * Bei einer Site mit tausenden URLs ist das der Unterschied zwischen einer
   * Liste und einer Antwort — ohne Suchbegriff kommt zurück, was die Sitemap
   * zufällig zuerst nennt.
   */
  suche?: string;
  /**
   * Obergrenze der URLs, Standard 200.
   *
   * Firecrawls eigener Default liegt bei 5 000. Das kostet zwar nicht mehr
   * (Map ist ein Pauschalpreis), aber niemand verarbeitet 5 000 URLs sinnvoll
   * weiter — und der Request dauert entsprechend.
   */
  limit?: number;
  /** `include` (Standard), `skip` für Sites mit veralteter Sitemap, `only` für reines Sitemap-Lesen. */
  sitemap?: "include" | "skip" | "only";
  /** Subdomains mitnehmen. Firecrawl-Default ist `true`. */
  unterdomains?: boolean;
  /** Query-Parameter ignorieren, damit `?utm_source=…` nicht als eigene Seite zählt. Default `true`. */
  ohneQueryParameter?: boolean;
  /** Umgeht den siebentägigen Sitemap-Cache. */
  cacheUebergehen?: boolean;
  /** Zeitbudget in ms. */
  timeout?: number;
  signal?: AbortSignal;
}

export interface Kartenlink {
  url: string;
  titel: string;
  beschreibung: string;
}

interface KartenAntwort {
  links?: Array<{ url?: string; title?: string; description?: string }>;
}

/**
 * Listet die URLs einer Website, ohne sie zu lesen.
 *
 * Der günstigste Weg, sich vor einer Recherche einen Überblick zu verschaffen:
 * **1 Credit pauschal**, egal ob zehn oder zehntausend URLs zurückkommen.
 * Erst danach entscheidet man, welche zwei oder drei Seiten den Abruf wert
 * sind — jede weitere kostet dann einzeln.
 *
 * Antwort kommt an `links` statt an `data`, weshalb dieser Aufruf die Hülle
 * anders auspackt als die übrigen.
 *
 * @param url Startadresse; die Domain reicht.
 * @param optionen Filter und Umfang.
 */
export async function seitenkarte(
  url: string,
  optionen: SeitenkarteOptionen = {},
): Promise<Kartenlink[]> {
  schluessel();
  budgetPruefen(1, `Seitenkarte (${url})`);

  const rumpf: Record<string, unknown> = {
    url,
    limit: optionen.limit ?? 200,
    ignoreQueryParameters: optionen.ohneQueryParameter ?? true,
  };
  if (optionen.suche) rumpf.search = optionen.suche;
  if (optionen.sitemap) rumpf.sitemap = optionen.sitemap;
  if (optionen.unterdomains !== undefined) rumpf.includeSubdomains = optionen.unterdomains;
  if (optionen.cacheUebergehen !== undefined) rumpf.ignoreCache = optionen.cacheUebergehen;
  if (optionen.timeout !== undefined) rumpf.timeout = optionen.timeout;

  const huelle = (await anfrage<never>("/v2/map", rumpf, optionen.signal)) as unknown as
    AntwortHuelle<never> & KartenAntwort;

  verbrauchBuchen("map", huelle.creditsUsed ?? 1);

  return (huelle.links ?? []).map((eintrag) => ({
    url: eintrag.url ?? "",
    titel: eintrag.title ?? "",
    beschreibung: eintrag.description ?? "",
  }));
}
