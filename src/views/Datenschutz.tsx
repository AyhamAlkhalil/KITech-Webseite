import { PageShell } from "@/components/layout/PageShell";
import { TEXT_CONTAINER } from "@/components/layout/site-container";
import { StructuredData, getWebPageSchema, getBreadcrumbSchema } from "@/components/seo/StructuredData";

export default function Datenschutz() {
  return (
    <PageShell backdropClassName="absolute inset-x-0 top-0 -z-10 h-[360px]">
      <StructuredData
        data={getWebPageSchema("Datenschutz", "Datenschutzerklärung von KITech Software", "https://kitech-software.de/datenschutz")}
      />
      <StructuredData
        data={getBreadcrumbSchema([
          { name: "Startseite", url: "https://kitech-software.de" },
          { name: "Datenschutz", url: "https://kitech-software.de/datenschutz" },
        ])}
      />
      <section className="py-20 lg:py-28">
        <div className={TEXT_CONTAINER}>
          {/* "Datenschutzerklärung" ist ein einziges Wort und passte bei 36 px
              auf kein Handydisplay: es ragte aus dem Fenster, und die ganze
              Seite ließ sich seitwärts schieben. Mobil deshalb 30 px, dazu
              Silbentrennung und als letzte Rückfallebene der harte Umbruch —
              die Trennung selbst setzt Wörterbücher voraus, die nicht auf jedem
              System vorhanden sind. */}
          <h1
            lang="de"
            className="kinetic-display mb-10 hyphens-auto break-words text-[30px] leading-[1.1] text-foreground sm:text-[44px]"
          >
            Datenschutzerklärung
          </h1>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-3">1. Datenschutz auf einen Blick</h2>
              <h3 className="text-lg font-medium mb-2">Allgemeine Hinweise</h3>
              <p className="text-muted-foreground">
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten
                passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie
                persönlich identifiziert werden können.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">2. Verantwortliche Stelle</h2>
              <p className="text-muted-foreground">
                Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
                <br />
                <br />
                KITech Software UG (haftungsbeschränkt)
                <br />
                Wedekindstraße 14
                <br />
                30161 Hannover
                <br />
                <br />
                Telefon: +49 151 64682544
                <br />
                E-Mail: info@kitech-software.de
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">3. Datenerfassung auf dieser Website</h2>
              <h3 className="text-lg font-medium mb-2">Kontaktformular</h3>
              <p className="text-muted-foreground">
                Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular
                inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall
                von Anschlussfragen bei uns gespeichert.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">4. Analyse & Besuchermessung</h2>

              <h3 className="text-lg font-medium mb-2">Plausible Analytics (self-hosted)</h3>
              <p className="text-muted-foreground mb-4">
                Mit Ihrer Einwilligung verwenden wir Plausible Analytics zur anonymen Reichweitenmessung.
                Plausible ist eine datenschutzfreundliche, cookiefreie Analysesoftware. Es werden keine
                personenbezogenen Profile erstellt und keine Daten an Dritte weitergegeben.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>Besonderheit:</strong> Unsere Plausible-Instanz wird ausschließlich auf unserem
                eigenen Server in Deutschland betrieben. Es findet kein Datentransfer an{" "}
                <em>plausible.io</em> oder andere externe Server statt.
              </p>
              <p className="text-muted-foreground mb-4">
                Erfasst werden: aufgerufene Seite, Herkunftsland, Gerätekategorie, Betriebssystem,
                Browser sowie die verweisende Website (Referrer). Die IP-Adresse wird nicht
                gespeichert. Die Daten sind nicht einer einzelnen Person zuordenbar.
              </p>
              <p className="text-muted-foreground mb-6">
                Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung). Sie können Ihre
                Einwilligung jederzeit über den Link „Cookie-Einstellungen" im Footer widerrufen.
              </p>

              <h3 className="text-lg font-medium mb-2">Besucheridentifikation (ipinfo.io)</h3>
              <p className="text-muted-foreground mb-4">
                Mit Ihrer Einwilligung zur Analyse ermitteln wir zusätzlich auf Basis Ihrer IP-Adresse
                die zugehörige Organisation bzw. den Internetdienstanbieter (ISP), Ihren ungefähren
                Standort (Stadt, Land) sowie ggf. den Hostnamen. Dies geschieht über den Dienst{" "}
                <strong>ipinfo.io</strong> (IPinfo, Inc., 16 Maiden Lane Suite 301, San Francisco,
                CA 94108, USA).
              </p>
              <p className="text-muted-foreground mb-4">
                Zweck ist die Auswertung, welche Unternehmen und Organisationen unsere Website besuchen
                (B2B-Reichweitenanalyse). Eine Identifikation einzelner Personen ist damit nicht möglich.
                Die gewonnenen Daten (Org-Name, Stadt, Land) werden intern gespeichert und nach 7 Tagen
                automatisch gelöscht. Ihre vollständige IP-Adresse wird von uns nicht dauerhaft
                gespeichert.
              </p>
              <p className="text-muted-foreground mb-4">
                IPinfo verarbeitet die IP-Adresse auf US-amerikanischen Servern. Die Datenübertragung
                erfolgt auf Grundlage der Standardvertragsklauseln gemäß Art. 46 Abs. 2 lit. c DSGVO.
                Weitere Informationen finden Sie in der Datenschutzerklärung von IPinfo:{" "}
                <a
                  href="https://ipinfo.io/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  ipinfo.io/privacy-policy
                </a>.
              </p>
              <p className="text-muted-foreground">
                Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung). Sie können Ihre
                Einwilligung jederzeit über „Cookie-Einstellungen" im Footer widerrufen.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">5. Terminbuchung (Calendly)</h2>
              <p className="text-muted-foreground mb-4">
                Auf der Seite „Lass uns reden" binden wir den Terminplaner{" "}
                <strong>Calendly</strong> (Calendly LLC, 271 17th St NW, Atlanta, GA 30363, USA)
                ein. Der Kalender wird <strong>erst nach Ihrer Einwilligung</strong> geladen —
                ohne Einwilligung sehen Sie stattdessen eine Schaltfläche „Kalender laden". Bis
                dahin wird keine Verbindung zu Calendly aufgebaut.
              </p>
              <p className="text-muted-foreground mb-4">
                Beim Laden übermittelt Ihr Browser IP-Adresse, Gerätedaten und Zeitzone an
                Calendly; Calendly setzt eigene Cookies. Buchen Sie einen Termin, verarbeitet
                Calendly zusätzlich die von Ihnen eingegebenen Angaben (Name, E-Mail-Adresse,
                Nachricht) und leitet sie an uns weiter. Die Übermittlung in die USA erfolgt auf
                Grundlage der Standardvertragsklauseln gemäß Art. 46 Abs. 2 lit. c DSGVO. Näheres:{" "}
                <a
                  href="https://calendly.com/de/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  calendly.com/de/privacy
                </a>
                .
              </p>
              <p className="text-muted-foreground">
                Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) für das Laden des
                Widgets, Art. 6 Abs. 1 lit. b DSGVO für die Durchführung des vereinbarten
                Termins.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">6. Selbstcheck zum EU AI Act</h2>
              <p className="text-muted-foreground mb-4">
                Auf der Seite „Selbstcheck EU AI Act" beantworten Sie acht Fragen zum Stand Ihrer
                KI-Pflichten. Senden Sie den Check ab, übermitteln wir Ihre Angaben
                (<strong>Name, Unternehmen, E-Mail-Adresse</strong>), Ihre acht Antworten sowie
                die Seite, von der Sie kamen, und eine etwaige Kampagnenkennung an uns. Ihre
                IP-Adresse steht weder in der Auswertung noch in der E-Mail; der Server hält
                sie für wenige Minuten im Arbeitsspeicher, um Missbrauch des Formulars
                abzuwehren, und verwirft sie danach.
              </p>
              <p className="text-muted-foreground mb-4">
                Aus den Antworten erstellen wir eine Auswertung als PDF und senden sie an ein
                internes Postfach. <strong>Das Ergebnis wird Ihnen auf der Seite nicht
                angezeigt</strong> — wir sehen es uns an und melden uns bei Ihnen unter der
                angegebenen E-Mail-Adresse. Bis zum Absenden bleiben Ihre Antworten in Ihrem
                Browser; ohne Absenden erfahren wir nichts davon.
              </p>
              <p className="text-muted-foreground mb-4">
                Versand und Postfach laufen über Microsoft 365 (Microsoft Ireland Operations
                Limited, One Microsoft Place, South County Business Park, Leopardstown, Dublin
                18, Irland) als Auftragsverarbeiter. Wir speichern Ihre Angaben, solange die
                Anfrage bearbeitet wird und gesetzliche Aufbewahrungsfristen es verlangen.
              </p>
              <p className="text-muted-foreground">
                Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung), die Sie im Formular
                erteilen. Sie können sie jederzeit für die Zukunft widerrufen — eine formlose
                Nachricht an die unter „Verantwortliche Stelle" genannte Adresse genügt.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">7. Ihre Rechte</h2>
              <p className="text-muted-foreground">
                Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer
                gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder
                Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt haben,
                können Sie diese Einwilligung jederzeit für die Zukunft widerrufen.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">8. SSL-Verschlüsselung</h2>
              <p className="text-muted-foreground">
                Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine
                SSL-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des
                Browsers von "http://" auf "https://" wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
