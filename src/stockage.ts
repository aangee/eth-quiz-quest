import { del, get, set } from 'idb-keyval';
import type { Pack, Profil, QueteSemaine } from './types';
import { validerPack } from './packs/valider';
import type { ConfigFamille } from './net/famille';
import type { EntreeClassement } from './jeu/classement';
import type { Dependances, Jeton } from './net/classementEnLigne';
import { normaliserProfil } from './jeu/profil';

const CLE = 'profils';
const CLE_SEMAINE = 'queteSemaine';

export async function chargerProfils(): Promise<Profil[]> {
  return ((await get<Profil[]>(CLE)) ?? []).map(normaliserProfil);
}

export async function sauverProfils(profils: Profil[]): Promise<void> {
  await set(CLE, profils);
}

export async function chargerSemaine(): Promise<QueteSemaine | undefined> {
  return get<QueteSemaine>(CLE_SEMAINE);
}

export async function sauverSemaine(q: QueteSemaine): Promise<void> {
  await set(CLE_SEMAINE, q);
}

export function nouveauProfil(prenom: string, avatar: string, age: number, theme?: string): Profil {
  return normaliserProfil({ id: crypto.randomUUID(), prenom, avatar, age, ...(theme ? { theme } : {}) });
}

const CLE_PACKS = 'packsImportes';
const CLE_PIN = 'pin';

export async function chargerPacksImportes(): Promise<Pack[]> {
  const liste = (await get<unknown[]>(CLE_PACKS)) ?? [];
  return liste.flatMap((d) => { const r = validerPack(d); return r.pack ? [r.pack] : []; });
}

export async function sauverPacksImportes(liste: Pack[]): Promise<void> {
  await set(CLE_PACKS, liste);
}

/** PIN haché de l'espace parent (undefined tant qu'il n'est pas choisi). */
export async function chargerPin(): Promise<string | undefined> {
  return get<string>(CLE_PIN);
}

export async function sauverPin(hache: string | null): Promise<void> {
  if (hache) await set(CLE_PIN, hache);
  else await del(CLE_PIN);
}

/** Famille du classement + nom de cet appareil (absent = pas de classement). */
export interface Famille { config: ConfigFamille; appareil: string }

export async function chargerFamille(): Promise<Famille | undefined> {
  return get<Famille>('famille');
}

export async function sauverFamille(f: Famille | null): Promise<void> {
  if (f) await set('famille', f);
  else { await del('famille'); await del('jetonFirebase'); await del('classementCache'); }
}

export async function chargerClassementCache(): Promise<{ date: number; entrees: EntreeClassement[] } | undefined> {
  return get('classementCache');
}

export async function sauverClassementCache(entrees: EntreeClassement[]): Promise<void> {
  await set('classementCache', { date: Date.now(), entrees });
}

/** Accès réseau réel pour le classement en ligne. */
export const dependancesFirebase: Dependances = {
  fetch: (...a) => fetch(...a),
  lireJeton: () => get<Jeton>('jetonFirebase'),
  ecrireJeton: (j) => set('jetonFirebase', j),
  maintenant: () => Date.now(),
};
