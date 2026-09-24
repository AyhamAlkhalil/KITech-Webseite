/**
 * Wer die Auswertung des Selbstchecks bekommt.
 *
 * **Zwei Adressen über zwei Wege** (Ansage 24.09.2026). Zwischen dem 18. und
 * 22.09.2026 nahm Microsoft Graph drei Auswertungen an — HTTP 202 — und
 * zugestellt wurde keine davon: nichts in `joerg.kratzat@`, keine
 * Unzustellbarkeitsmeldung beim Absender. Weil das PDF nirgends gespeichert
 * wird, waren die drei weg. `jk@sipenti.de` liegt außerhalb des Mandanten und
 * hängt damit nicht an derselben Störung.
 *
 * ⚠️ Die Annahme durch Graph beweist die Annahme, nicht die Zustellung. Wer
 * hier auf eine Adresse zurückgeht, nimmt der Meldung ihren zweiten Weg.
 */
export const STANDARD_EMPFAENGER = [
  "joerg.kratzat@kitech-software.de",
  "jk@sipenti.de",
] as const;

/**
 * Liest `SELBSTCHECK_MAIL_AN` (kommagetrennt) und fällt auf die beiden
 * Standardadressen zurück.
 *
 * ⚠️ Ein Wert aus Kommas oder Leerzeichen ergäbe sonst eine leere
 * Empfängerliste — ein Tippfehler in Coolify wäre damit ein stiller
 * Totalausfall, und der Ausfüllende sähe trotzdem „eingegangen".
 */
export function empfaengerAus(wert: string | undefined): string[] {
  const eingetragen = (wert ?? "")
    .split(",")
    .map((adresse) => adresse.trim())
    .filter((adresse) => adresse.includes("@"));
  return eingetragen.length > 0 ? eingetragen : [...STANDARD_EMPFAENGER];
}
