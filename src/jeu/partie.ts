import type { Profil, Question } from '../types';
import { coteDepart, majCote } from './adaptation';
import { xpGagne } from './xp';

export function appliquerReponse(
  p: Profil, domaine: string, q: Question, juste: boolean, tempsMs: number, limiteMs: number,
): { profil: Profil; xp: number } {
  const cote = p.cotes[domaine] ?? coteDepart(p.age);
  const xp = juste ? xpGagne(q.niveau, tempsMs, limiteMs) : 0;
  return {
    xp,
    profil: {
      ...p,
      xp: p.xp + xp,
      cotes: { ...p.cotes, [domaine]: majCote(cote, q.niveau, juste) },
      xpDomaine: { ...p.xpDomaine, [domaine]: (p.xpDomaine[domaine] ?? 0) + xp },
    },
  };
}
