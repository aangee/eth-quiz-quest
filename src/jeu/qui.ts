import { melanger } from './melange';

const POINTS = [3, 2, 1];

/** 3 points avec 1 indice, 2 avec 2, 1 au-delà. */
export function pointsQui(indicesVus: number): number {
  return POINTS[Math.min(Math.max(indicesVus, 1), POINTS.length) - 1];
}

/** La réponse + jusqu'à 3 leurres distincts, pris dans l'ordre du réservoir, puis mélangés. */
export function choixQui(reponse: string, reservoir: string[], alea: () => number = Math.random): string[] {
  const leurres: string[] = [];
  for (const r of reservoir) {
    if (leurres.length === 3) break;
    if (r !== reponse && !leurres.includes(r)) leurres.push(r);
  }
  return melanger([reponse, ...leurres], alea);
}
