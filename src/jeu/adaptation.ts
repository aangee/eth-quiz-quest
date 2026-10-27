import type { Question } from '../types';

export const COTE_MIN = 1;
// Au-dessus de 5 pour qu'un très bon joueur réussisse encore ~75 % des questions de niveau 5
export const COTE_MAX = 5.5;
export const K = 0.3;
// niveau - cote = -0,48  ⇒  probaReussite ≈ 0,75 (cible 70-80 %)
export const DECALAGE = 0.48;

export function coteDepart(age: number): number {
  return age <= 10 ? 1.5 : age <= 14 ? 2.5 : 3;
}

export function probaReussite(cote: number, niveau: number): number {
  return 1 / (1 + Math.pow(10, niveau - cote));
}

export function majCote(cote: number, niveau: number, juste: boolean): number {
  const c = cote + K * ((juste ? 1 : 0) - probaReussite(cote, niveau));
  return Math.min(COTE_MAX, Math.max(COTE_MIN, c));
}

export function choisirQuestion<T extends Question>(
  qs: T[], cote: number, age: number, dejaVues: Set<string>, alea: () => number = Math.random,
): T | null {
  const eligibles = qs.filter((q) => q.age_min <= age && !dejaVues.has(q.id));
  if (!eligibles.length) return null;
  const cible = cote - DECALAGE;
  const ecart = (q: T) => Math.abs(q.niveau - cible);
  const meilleur = Math.min(...eligibles.map(ecart));
  const top = eligibles.filter((q) => ecart(q) === meilleur);
  return top[Math.floor(alea() * top.length)];
}
