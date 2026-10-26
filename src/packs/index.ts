import type { Pack, Question } from '../types';
import { validerPack } from './valider';

const fichiers = import.meta.glob('../../packs/*.json', { eager: true, import: 'default' });

export const packs: Pack[] = Object.entries(fichiers).flatMap(([chemin, data]) => {
  const r = validerPack(data);
  if (r.erreurPack) console.warn(`Pack ignoré (${chemin}) : ${r.erreurPack}`);
  r.erreurs.forEach((e) => console.warn(`${chemin} #${e.index} (${e.id}) : ${e.raison}`));
  return r.pack ? [r.pack] : [];
});

export const domaines: string[] = [...new Set(packs.map((p) => p.domaine))].sort();

export function questionsDuDomaine(domaine: string): Question[] {
  return packs.filter((p) => p.domaine === domaine).flatMap((p) => p.questions);
}
