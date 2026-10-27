import type { Pack } from '../types';

/**
 * Assemble les packs dans l'ordre donné (intégrés puis importés) : un id déjà vu n'est
 * remplacé que par un pack de version supérieure. Les packs vidés disparaissent.
 */
export function fusionnerPacks(liste: Pack[]): Pack[] {
  const proprietaire = new Map<string, number>();
  const resultat = liste.map((p) => ({ ...p, questions: [] as Pack['questions'] }));
  liste.forEach((p, i) => {
    for (const q of p.questions) {
      const j = proprietaire.get(q.id);
      if (j === undefined) {
        proprietaire.set(q.id, i);
        resultat[i].questions.push(q);
      } else if (p.version > liste[j].version) {
        resultat[j].questions = resultat[j].questions.filter((x) => x.id !== q.id);
        proprietaire.set(q.id, i);
        resultat[i].questions.push(q);
      }
    }
  });
  return resultat.filter((p) => p.questions.length > 0);
}

/** Ajoute un pack importé ; un pack du même nom est remplacé. */
export function ajouterPackImporte(importes: Pack[], nouveau: Pack): Pack[] {
  return [...importes.filter((p) => p.pack !== nouveau.pack), nouveau];
}
