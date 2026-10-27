import type { Pack, Question } from '../types';
import { validerPack } from './valider';
import { fusionnerPacks } from './fusion';

const fichiers = import.meta.glob('../../packs/*.json', { eager: true, import: 'default' });

export const packsIntegres: Pack[] = Object.entries(fichiers).flatMap(([chemin, data]) => {
  const r = validerPack(data);
  if (r.erreurPack) console.warn(`Pack ignoré (${chemin}) : ${r.erreurPack}`);
  r.erreurs.forEach((e) => console.warn(`${chemin} #${e.index} (${e.id}) : ${e.raison}`));
  return r.pack ? [r.pack] : [];
});

const trierDomaines = (ps: Pack[]) => [...new Set(ps.map((p) => p.domaine))].sort((a, b) => a.localeCompare(b, 'fr'));

// Liaisons vivantes : recalculées par installerPacks, lues partout dans l'app
export let packs: Pack[] = fusionnerPacks(packsIntegres);
export let domaines: string[] = trierDomaines(packs);

/** Installe les packs importés (espace parent) par-dessus les packs intégrés. */
export function installerPacks(importes: Pack[]): void {
  packs = fusionnerPacks([...packsIntegres, ...importes]);
  domaines = trierDomaines(packs);
}

export function questionsDuDomaine(domaine: string): Question[] {
  return packs.filter((p) => p.domaine === domaine).flatMap((p) => p.questions);
}
