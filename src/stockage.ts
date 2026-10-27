import { get, set } from 'idb-keyval';
import type { Profil, QueteSemaine } from './types';
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
