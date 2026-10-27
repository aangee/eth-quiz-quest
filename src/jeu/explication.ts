/** Mots comparés sans majuscules, accents ni ponctuation. */
const simplifier = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/**
 * Explication sans la bonne réponse répétée au début.
 * Les packs écrivent souvent « Le Portugal : c'est pour cela… » ; quand la réponse est déjà affichée juste avant,
 * on garde « c'est pour cela… » (première lettre en majuscule).
 */
export function explicationSansReponse(bonne: string, explication: string): string {
  const m = /^([^:]{1,80}?)\s*:\s*(.+)$/s.exec(explication);
  if (!m || simplifier(m[1]) !== simplifier(bonne)) return explication;
  return m[2].charAt(0).toUpperCase() + m[2].slice(1);
}
