import { del, get, set } from 'idb-keyval';
import type { Pack, Profil, QueteSemaine } from './types';
import { validerPack } from './packs/valider';
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

export function nouveauProfil(prenom: string, avatar: string, age: number): Profil {
  return normaliserProfil({ id: crypto.randomUUID(), prenom, avatar, age });
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
