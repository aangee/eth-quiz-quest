export const ERREURS_MAX = 7;

/** Majuscules sans accents : « Éléphant » → « ELEPHANT ». */
export function normaliser(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
}

const estLettre = (c: string) => /[A-Z]/.test(c);

/** Le mot avec « _ » pour chaque lettre pas encore trouvée (tirets et espaces visibles). */
export function affichage(mot: string, essayees: Set<string>): string {
  return [...normaliser(mot)].map((c) => (!estLettre(c) || essayees.has(c) ? c : '_')).join('');
}

export function erreurs(mot: string, essayees: Set<string>): number {
  const m = normaliser(mot);
  return [...essayees].filter((l) => !m.includes(l)).length;
}

export function estTrouve(mot: string, essayees: Set<string>): boolean {
  return !affichage(mot, essayees).includes('_');
}
