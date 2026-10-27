import type { Profil, Question } from '../types';
import type { MiniJeu } from './arbre';
import { melanger } from './melange';

/** Mini-jeux jouables dans cette version (les autres restent « bientôt jouable »). */
export const JEUX_DISPONIBLES: MiniJeu[] = ['chrono', 'calcul', 'memory', 'mot', 'frise', 'qui', 'etiquettes'];

/** Une partie : sur quels domaines, et s'il s'agit d'un défi (un seul domaine). */
export interface Partie { domaines: string[]; defi: boolean }

/** Un raté à revoir en fin de partie (mot non trouvé, frise fausse…). */
export interface ARetenir { question: string; bonne: string; explication: string }

export interface ResultatJeu { score: number; xp: number; texte: string; aRetenir?: ARetenir[] }

export interface PropsJeu {
  profil: Profil;
  partie: Partie;
  onFin: (p: Profil, r: ResultatJeu) => void;
  onQuitter: () => void;
}

/** Un défi dure 1,5 fois plus longtemps (ou compte 1,5 fois plus de manches)… */
export function longueur(base: number, partie: Partie): number {
  return Math.round(base * (partie.defi ? 1.5 : 1));
}

/** … et rapporte deux fois plus d'XP. */
export function multXp(partie: Partie): number {
  return partie.defi ? 2 : 1;
}

export function cleRecord(jeu: MiniJeu, defiDomaine?: string): string {
  return defiDomaine ? `${jeu}:${defiDomaine}` : jeu;
}

/** Jeux où un score plus petit est meilleur (nombre de coups). */
const PLUS_PETIT_MIEUX: MiniJeu[] = ['memory'];

export function majRecord(p: Profil, jeu: MiniJeu, score: number, defiDomaine?: string): { profil: Profil; nouveau: boolean } {
  const petit = PLUS_PETIT_MIEUX.includes(jeu);
  if (!petit && score <= 0) return { profil: p, nouveau: false };
  const cle = cleRecord(jeu, defiDomaine);
  const ancien = p.records[cle];
  const mieux = ancien === undefined || (petit ? score < ancien : score > ancien);
  return mieux ? { profil: { ...p, records: { ...p.records, [cle]: score } }, nouveau: true } : { profil: p, nouveau: false };
}

/** XP d'un mini-jeu : au total et au domaine (donc aux étoiles) ; la cote ne bouge pas. */
export function crediter(p: Profil, domaine: string | null, xp: number): Profil {
  if (xp <= 0) return p;
  return {
    ...p,
    xp: p.xp + xp,
    xpDomaine: domaine ? { ...p.xpDomaine, [domaine]: (p.xpDomaine[domaine] ?? 0) + xp } : p.xpDomaine,
  };
}

export interface Contenu<T extends Question> { q: T; domaine: string }

/** Questions d'un type, jouables à cet âge, mélangées, avec leur domaine. */
export function contenu<T extends Question>(
  source: (domaine: string) => Question[], type: T['type'], domaines: string[], age: number, alea: () => number = Math.random,
): Contenu<T>[] {
  return melanger(
    domaines.flatMap((d) => source(d).filter((q): q is T => q.type === type && q.age_min <= age).map((q) => ({ q, domaine: d }))),
    alea,
  );
}
