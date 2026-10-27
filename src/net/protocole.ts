import { BONUS_MAX, POINTS_BONNE } from '../jeu/duel';

export type Message =
  | { t: 'bonjour'; prenom: string; avatar: string }
  | { t: 'debut' }
  | { t: 'reponse'; manche: number; points: number; juste: boolean };

/** Message reçu de l'autre appareil, vérifié ; null si invalide. */
export function lireMessage(texte: string): Message | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let m: any;
  try { m = JSON.parse(texte); } catch { return null; }
  if (!m || typeof m !== 'object') return null;
  switch (m.t) {
    case 'bonjour':
      return typeof m.prenom === 'string' && typeof m.avatar === 'string'
        ? { t: 'bonjour', prenom: m.prenom.slice(0, 30), avatar: m.avatar.slice(0, 8) }
        : null;
    case 'debut':
      return { t: 'debut' };
    case 'reponse':
      return Number.isInteger(m.manche) && m.manche >= 0 && typeof m.juste === 'boolean'
        && typeof m.points === 'number' && m.points >= 0 && m.points <= POINTS_BONNE + BONUS_MAX
        ? { t: 'reponse', manche: m.manche, points: m.points, juste: m.juste }
        : null;
    default:
      return null;
  }
}
