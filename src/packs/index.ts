import type { Pack, Question } from '../types';
import { validerPack } from './valider';

const fichiers = import.meta.glob('../../packs/*.json', { eager: true, import: 'default' });

export const packs: Pack[] = Object.entries(fichiers).flatMap(([chemin, data]) => {
  const r = validerPack(data);
  if (r.erreurPack) console.warn(`Pack ignoré (${chemin}) : ${r.erreurPack}`);
  r.erreurs.forEach((e) => console.warn(`${chemin} #${e.index} (${e.id}) : ${e.raison}`));
  return r.pack ? [r.pack] : [];
});

// Un id déjà vu dans un autre pack est ignoré (sinon il serait masqué sans prévenir).
const idsVus = new Set<string>();
for (const p of packs) {
  p.questions = p.questions.filter((q) => {
    if (idsVus.has(q.id)) { console.warn(`${p.pack} : id ${q.id} déjà utilisé par un autre pack, ignoré`); return false; }
    idsVus.add(q.id);
    return true;
  });
}

export const domaines: string[] = [...new Set(packs.map((p) => p.domaine))].sort((a, b) => a.localeCompare(b, 'fr'));

export function questionsDuDomaine(domaine: string): Question[] {
  return packs.filter((p) => p.domaine === domaine).flatMap((p) => p.questions);
}
