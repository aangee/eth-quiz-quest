import type { NomIcone } from '../ui/icones';

export type IdOnglet = 'carte' | 'minijeux' | 'arbre' | 'classement' | 'profil';

/** Les onglets de la barre du bas ; l'id est le nom de l'écran ouvert. */
export const ONGLETS: { id: IdOnglet; nom: string; icone: NomIcone }[] = [
  { id: 'carte', nom: 'Carte', icone: 'carte' },
  { id: 'minijeux', nom: 'Jeux', icone: 'jeux' },
  { id: 'arbre', nom: 'Arbre', icone: 'arbre' },
  { id: 'classement', nom: 'Classement', icone: 'trophee' },
  { id: 'profil', nom: 'Profil', icone: 'profil' },
];

/** Onglet de l'écran, ou null si l'écran n'en est pas un (partie, résultats, profils, parent : pas de barre). */
export function ongletActif(nomEcran: string): IdOnglet | null {
  return ONGLETS.find((o) => o.id === nomEcran)?.id ?? null;
}
