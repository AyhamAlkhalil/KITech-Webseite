/**
 * Datumsangaben, wie sie auf der Website stehen.
 *
 * Bewusst von Hand statt über `toLocaleDateString`: Die Ausgabe muss auf Server
 * und Client identisch sein, sonst wirft React einen Hydrations-Fehler — und die
 * Zeitzonen-/Locale-Einstellung eines Containers ist nichts, worauf man sich
 * dafür verlassen sollte.
 *
 * Stand bis zum 06.10.2026 als private Kopie in `views/wissen/ArtikelSeite.tsx`;
 * mit der Vergleichsseite wäre die zweite Kopie dazugekommen, und zwei Kopien
 * laufen irgendwann auseinander.
 */

const MONATE = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

/** `2026-08-19` → `19. August 2026`. */
export function datumLang(iso: string): string {
  const [jahr, monat, tag] = iso.split("-");
  return `${Number(tag)}. ${MONATE[Number(monat) - 1]} ${jahr}`;
}

/** `2026-08-19` → `19.08.2026`. */
export function datumKurz(iso: string): string {
  const [jahr, monat, tag] = iso.split("-");
  return `${tag}.${monat}.${jahr}`;
}
