import type { Profil } from '../types';
import { niveauDepuisXp } from './xp';

/** Ce qu'un profil publie au classement (jamais de vrai nom ni d'âge). */
export interface EntreeClassement {
  id: string;
  pseudo: string;
  avatar: string;
  appareil: string;
  niveau: number;
  xp: number;
  xpSemaine: number;
  semaine: string;
  records: Record<string, number>;
  duels: number;
  maj: string;
}

/** Note l'XP de départ si une nouvelle semaine commence. */
export function debutSemaine(p: Profil, semaine: string): Profil {
  return p.semaineXp.semaine === semaine ? p : { ...p, semaineXp: { semaine, depart: p.xp } };
}

export function xpDeLaSemaine(p: Profil, semaine: string): number {
  return p.semaineXp.semaine === semaine ? Math.max(0, p.xp - p.semaineXp.depart) : 0;
}

export function entreeDe(p: Profil, appareil: string, semaine: string, maj: Date = new Date()): EntreeClassement {
  return {
    id: p.id,
    pseudo: p.prenom.slice(0, 30),
    avatar: p.avatar,
    appareil: appareil.slice(0, 30),
    niveau: niveauDepuisXp(p.xp),
    xp: p.xp,
    xpSemaine: xpDeLaSemaine(p, semaine),
    semaine,
    records: p.records,
    duels: p.duels,
    maj: maj.toISOString(),
  };
}

export type Critere = 'xp' | 'semaine' | 'duels' | `record:${string}`;

// Au Memory, le record est un nombre de coups : plus petit = mieux
const CROISSANT = ['record:memory'];

export function trier(entrees: EntreeClassement[], critere: Critere, semaineCourante: string): { entree: EntreeClassement; valeur: number }[] {
  const valeur = (e: EntreeClassement): number | undefined => {
    if (critere === 'xp') return e.xp;
    if (critere === 'semaine') return e.semaine === semaineCourante ? e.xpSemaine : 0;
    if (critere === 'duels') return e.duels;
    const jeu = critere.slice('record:'.length);
    // Records de mini-jeu simple (pas les défis « jeu:domaine »)
    return e.records[jeu];
  };
  const sens = CROISSANT.some((c) => critere.startsWith(c)) ? 1 : -1;
  return entrees
    .flatMap((entree) => { const v = valeur(entree); return v === undefined ? [] : [{ entree, valeur: v }]; })
    .sort((a, b) => sens * (a.valeur - b.valeur));
}
