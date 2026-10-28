import type { Profil } from '../types';
import { THEME_PAR_DEFAUT } from '../themes/defaut';

type ProfilPartiel = Partial<Profil> & Pick<Profil, 'id' | 'prenom' | 'avatar' | 'age'>;

/**
 * Domaines renommés : la progression suit le nouveau nom.
 * 2026-10-28 : « Histoire » est devenu « Histoire du monde » (la France a son propre domaine, qui démarre à zéro).
 */
export const DOMAINES_RENOMMES: Record<string, string> = { Histoire: 'Histoire du monde' };

/** Renomme un domaine partout où un profil le cite (XP, cotes, déblocages, jokers, records, quêtes). Sans effet s'il n'y est pas. */
export function renommerDomaine(p: Profil, ancien: string, nouveau: string): Profil {
  const cle = <T>(o: Record<string, T>, f: (k: string) => string) =>
    Object.fromEntries(Object.entries(o).map(([k, v]) => [f(k), v])) as Record<string, T>;
  const suffixe = (s: string) => (s.endsWith(`:${ancien}`) ? s.slice(0, -ancien.length) + nouveau : s);
  const nom = (s: string) => (s === ancien ? nouveau : s);
  return {
    ...p,
    xpDomaine: cle(p.xpDomaine, nom),
    cotes: cle(p.cotes, nom),
    debloques: p.debloques.map(suffixe),
    jokers: cle(p.jokers, suffixe),
    records: cle(p.records, suffixe),
    quetes: { ...p.quetes, liste: p.quetes.liste.map((q) => (q.domaine === ancien ? { ...q, domaine: nouveau } : q)) },
  };
}

/** Complète un profil sauvegardé par une version plus ancienne de l'app. */
export function normaliserProfil(p: ProfilPartiel): Profil {
  let profil: Profil = {
    theme: THEME_PAR_DEFAUT,
    xp: 0,
    cotes: {},
    xpDomaine: {},
    debloques: [],
    jokers: {},
    quetes: { date: '', liste: [] },
    calendrier: [],
    records: {},
    duels: 0,
    semaineXp: { semaine: '', depart: 0 },
    ...p,
  };
  for (const [ancien, nouveau] of Object.entries(DOMAINES_RENOMMES)) profil = renommerDomaine(profil, ancien, nouveau);
  return profil;
}
