// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import EuAiActSelbstcheck from "../../views/EuAiActSelbstcheck";

/**
 * Der Versand im Browser — der Teil, den die Quelltext-Tests nicht sehen.
 *
 * Er ist der empfindlichste der ganzen Seite, weil der Ausfüllende sein
 * Ergebnis nicht zu sehen bekommt: Was die Seite nach der achten Antwort
 * sagt, ist das Einzige, woran er erkennt, ob seine Antworten angekommen
 * sind. Zwei Fehler sind hier teuer, und beide sind schon einmal im Code
 * gewesen oder nah daran:
 *
 * - **Bestätigung ohne Versand** — die Antworten sind weg, niemand merkt es.
 * - **Fehlschlag nach Versand** — bis zum 18.09.2026 stand `trackEvent` im
 *   selben `try` wie der Versand. `window.plausible` ist ungeschützt; warf es,
 *   zeigte die Seite nach einer angekommenen Mail „nicht übermittelt", und
 *   „Noch einmal senden" schickte sie ein zweites Mal.
 */

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

/** Die Überschrift der Bestätigung, wörtlich nach Ansage. */
const BESTAETIGUNG = "Danke – die Ergebnisse liegen unserem Berater Jörg vor.";

type Antwortkoerper = { antworten: string[] };
let selbstcheckAufrufe: Antwortkoerper[] = [];

function fetchMit(status: number, rumpf: unknown) {
  return vi.fn(async (url: string, init?: RequestInit) => {
    if (String(url).endsWith("/api/selbstcheck")) {
      selbstcheckAufrufe.push(JSON.parse(String(init?.body)));
      return { ok: status >= 200 && status < 300, status, json: async () => rumpf } as Response;
    }
    /* /api/ereignis — die Sofortmeldung, hier ohne Bedeutung. */
    return { ok: true, status: 204, json: async () => null } as Response;
  });
}

async function allesMitJaBeantworten() {
  fireEvent.click(screen.getByRole("button", { name: /Check starten/ }));
  for (let n = 1; n <= 8; n++) {
    await screen.findByText(new RegExp(`Frage ${n} von 8`));
    const gruppe = screen.getByRole("group", { name: "Antwort auswählen" });
    const ja = [...gruppe.querySelectorAll("button")].find((b) => b.textContent?.startsWith("Ja"));
    fireEvent.click(ja!);
  }
}

beforeEach(() => {
  selbstcheckAufrufe = [];
  window.scrollTo = vi.fn();
  window.matchMedia = vi.fn().mockReturnValue({
    matches: true,
    media: "",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
  /* Mit Einwilligung, so wie `trackEvent` sie erkennt: `lib/plausible.ts`
     fragt nicht den Speicher, sondern ob das Plausible-Skript im Dokument
     hängt — live geschieht das erst nach der Zustimmung. Ohne das Tag steigt
     `trackEvent` vorher aus, und der Plausible-Test unten würde grün, ohne
     dass Plausible je gerufen wird. */
  const skript = document.createElement("script");
  skript.dataset.plausible = "true";
  document.head.appendChild(skript);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.head.querySelectorAll('script[data-plausible="true"]').forEach((e) => e.remove());
  delete (window as { plausible?: unknown }).plausible;
});

describe("Versand im Browser", () => {
  it("bestätigt erst nach angenommenem Versand und schickt die acht Antworten genau einmal", async () => {
    vi.stubGlobal("fetch", fetchMit(200, { ok: true }));
    render(<EuAiActSelbstcheck />);
    await allesMitJaBeantworten();

    await screen.findByText(BESTAETIGUNG);
    expect(selbstcheckAufrufe).toHaveLength(1);
    expect(selbstcheckAufrufe[0].antworten).toEqual(Array(8).fill("yes"));
    /* Keine Kontaktdaten im Versand. */
    expect(Object.keys(selbstcheckAufrufe[0]).sort()).toEqual(
      ["antworten", "referrer", "utmCampaign", "utmMedium", "utmSource"].sort()
    );
  });

  it("bleibt bei Erfolg, auch wenn Plausible wirft", async () => {
    vi.stubGlobal("fetch", fetchMit(200, { ok: true }));
    const plausible = vi.fn(() => {
      throw new Error("Plausible blockiert");
    });
    (window as { plausible?: unknown }).plausible = plausible;
    render(<EuAiActSelbstcheck />);
    await allesMitJaBeantworten();

    await screen.findByText(BESTAETIGUNG);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByRole("button", { name: /Noch einmal senden/ })).toBeNull();
    expect(selbstcheckAufrufe).toHaveLength(1);
    /* Die Gegenprobe: Plausible wurde nach dem Versand wirklich gerufen. */
    expect(plausible).toHaveBeenCalledWith("Lead_Qualifier_abgeschlossen", expect.anything());
  });

  it("zeigt einen abgelehnten Versand als Fehler, nie als Bestätigung", async () => {
    vi.stubGlobal(
      "fetch",
      fetchMit(503, { fehler: "Der Versand ist gerade nicht erreichbar. Bitte später noch einmal." })
    );
    render(<EuAiActSelbstcheck />);
    await allesMitJaBeantworten();

    const meldung = await screen.findByRole("alert");
    expect(meldung.textContent).toMatch(/nicht erreichbar/);
    expect(screen.queryByText(BESTAETIGUNG)).toBeNull();
    expect(screen.getByRole("button", { name: /Noch einmal senden/ })).toBeTruthy();
  });

  it("schickt beim erneuten Senden denselben Antwortstand", async () => {
    const abgelehnt = fetchMit(503, { fehler: "nicht erreichbar" });
    vi.stubGlobal("fetch", abgelehnt);
    render(<EuAiActSelbstcheck />);
    await allesMitJaBeantworten();
    await screen.findByRole("alert");

    vi.stubGlobal("fetch", fetchMit(200, { ok: true }));
    fireEvent.click(screen.getByRole("button", { name: /Noch einmal senden/ }));
    await screen.findByText(BESTAETIGUNG);

    expect(selbstcheckAufrufe).toHaveLength(2);
    expect(selbstcheckAufrufe[1].antworten).toEqual(selbstcheckAufrufe[0].antworten);
  });

  it("legt den Fokus auf die Überschrift des neuen Zustands", async () => {
    vi.stubGlobal("fetch", fetchMit(200, { ok: true }));
    render(<EuAiActSelbstcheck />);
    await allesMitJaBeantworten();

    const ueberschrift = await screen.findByText(BESTAETIGUNG);
    expect(document.activeElement).toBe(ueberschrift);
  });
});
