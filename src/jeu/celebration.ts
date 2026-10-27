import type { Profil } from '../types';
import { niveauDepuisXp } from './xp';
import { etoilesGagnees } from './arbre';

/** Ce qui mérite des confettis : un niveau gagné ou des étoiles gagnées (rien d'autre). */
export interface Celebration { niveau: number | null; etoiles: number }

export function celebration(avant: Profil, apres: Profil): Celebration {
  const na = niveauDepuisXp(avant.xp);
  const np = niveauDepuisXp(apres.xp);
  return { niveau: np > na ? np : null, etoiles: Math.max(0, etoilesGagnees(apres) - etoilesGagnees(avant)) };
}

export function aCelebrer(c: Celebration): boolean {
  return c.niveau !== null || c.etoiles > 0;
}
