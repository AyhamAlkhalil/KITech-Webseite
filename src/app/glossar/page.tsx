import { buildMetadata } from "@/lib/metadata";
import Glossar from "@/views/Glossar";

/**
 * Die Glossarinhalte lagen seit der Next.js-Migration ungenutzt im Repo — die
 * Route zeigte die Baustellenseite. Seit dem 05.08.2026 wieder angeschlossen und
 * damit auch wieder indexierbar: die sechs Artikel sind fertig geschrieben.
 */
export const metadata = buildMetadata({
  title: "Glossar – KI-Begriffe verständlich erklärt | KITech Software",
  description:
    "Fünf Definitionen ohne Buzzwords: KI-Audit, LLM-Integration, DSGVO-konforme KI, Computer Vision und ROI-Garantie.",
  path: "/glossar",
});

export default function Page() {
  return <Glossar />;
}
