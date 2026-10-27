export const NB_MANCHES = 10;
export const POINTS_BONNE = 100;
export const BONUS_MAX = 50;

/** 100 points par bonne réponse, plus un bonus qui baisse avec le temps (50 → 0). */
export function pointsDuel(juste: boolean, tempsMs: number, limiteMs: number): number {
  if (!juste) return 0;
  return POINTS_BONNE + Math.round(BONUS_MAX * Math.max(0, 1 - tempsMs / limiteMs));
}

/** Même appareil : joueur 0, joueur 1, joueur 0… */
export function ordreDesTours(manches: number): (0 | 1)[] {
  return Array.from({ length: manches }, (_, i) => (i % 2) as 0 | 1);
}

export function vainqueur(scores: [number, number]): 0 | 1 | 'egalite' {
  return scores[0] === scores[1] ? 'egalite' : scores[0] > scores[1] ? 0 : 1;
}
