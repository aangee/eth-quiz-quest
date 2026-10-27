import type { Profil } from '../types';
import { THEME_PAR_DEFAUT } from '../themes/defaut';

type ProfilPartiel = Partial<Profil> & Pick<Profil, 'id' | 'prenom' | 'avatar' | 'age'>;

/** Complète un profil sauvegardé par une version plus ancienne de l'app. */
export function normaliserProfil(p: ProfilPartiel): Profil {
  return {
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
}
