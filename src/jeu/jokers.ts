import type { Profil, QCM, VraiFaux } from '../types';
import { melanger } from './melange';

export const MAX_CHARGES = 3;

/** Jokers débloqués dans l'arbre (nœuds « joker:<id> »). */
export function jokersDebloques(p: Profil): string[] {
  return p.debloques.filter((id) => id.startsWith('joker:')).map((id) => id.slice('joker:'.length));
}

export function ajouterCharge(p: Profil, joker: string): Profil {
  return { ...p, jokers: { ...p.jokers, [joker]: Math.min(MAX_CHARGES, (p.jokers[joker] ?? 0) + 1) } };
}

export function utiliserJoker(p: Profil, joker: string): Profil {
  const n = p.jokers[joker] ?? 0;
  return n > 0 ? { ...p, jokers: { ...p.jokers, [joker]: n - 1 } } : p;
}

/** Le joker débloqué qui a le moins de charges (null si aucun ou tous pleins). */
export function jokerARecharger(p: Profil): string | null {
  const liste = jokersDebloques(p).filter((j) => (p.jokers[j] ?? 0) < MAX_CHARGES);
  if (!liste.length) return null;
  return liste.reduce((a, b) => ((p.jokers[b] ?? 0) < (p.jokers[a] ?? 0) ? b : a));
}

export function jokerUtilisable(joker: string, q: QCM | VraiFaux, domaine: string): boolean {
  if (joker === 'temps') return true;
  if (joker.startsWith('expert:')) return joker.slice('expert:'.length) === domaine;
  return q.type === 'qcm' && q.choix.length > 2;
}

/** Index des mauvais choix à cacher : 50/50 = la moitié, Indice = 1, Expert = tous. */
export function choixACacher(q: QCM, joker: string, alea: () => number = Math.random): number[] {
  const faux = melanger(q.choix.map((_, i) => i).filter((i) => i !== q.reponse), alea);
  const n = joker === 'cinquante' ? Math.floor(q.choix.length / 2) : joker === 'indice' ? 1 : faux.length;
  return faux.slice(0, n);
}
