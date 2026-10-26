import { get, set } from 'idb-keyval';
import type { Profil } from './types';

const CLE = 'profils';

export async function chargerProfils(): Promise<Profil[]> {
  return (await get<Profil[]>(CLE)) ?? [];
}

export async function sauverProfils(profils: Profil[]): Promise<void> {
  await set(CLE, profils);
}

export function nouveauProfil(prenom: string, avatar: string, age: number): Profil {
  return { id: crypto.randomUUID(), prenom, avatar, age, xp: 0, cotes: {}, xpDomaine: {} };
}
