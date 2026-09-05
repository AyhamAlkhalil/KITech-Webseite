import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import { BASE_URL } from "@/lib/metadata";
import { suchkonsolenBestaetigung } from "@/config/suchkonsolen";
import "@/index.css";

/**
 * Root-Layout. Die Schrift (Poppins) kommt per @fontsource-Import aus
 * `src/index.css` — lokal gebündelt, es geht also keine Anfrage an Google Fonts
 * raus (DSGVO).
 *
 * `suppressHydrationWarning` am <html> ist nötig, weil next-themes die
 * Theme-Klasse vor dem ersten Paint per Skript setzt.
 */
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "KITech Software – IT und KI für den Mittelstand, Hannover",
  description:
    "Software, Automatisierung und KI für den Mittelstand — gebaut in Hannover, betrieben in Deutschland.",
  icons: { icon: "/favicon.ico" },
  /* Bestaetigung fuer Search Console und Bing Webmaster Tools. Solange dort
     nichts eingetragen ist, rendert Next.js kein Tag. Siehe config/suchkonsolen.ts. */
  verification: suchkonsolenBestaetigung(),
};

/**
 * Färbt die Browserleiste auf Mobilgeräten. Dunkelblau wie der Ankündigungsbalken,
 * der ganz oben steht — sonst entsteht darüber ein fremdfarbiger Streifen.
 * `colorScheme: "light"` verhindert, dass Browser Formularelemente und
 * Scrollbalken dunkel rendern; die Seite hat keinen Dark Mode mehr.
 */
export const viewport: Viewport = {
  themeColor: "#1B47C4",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
