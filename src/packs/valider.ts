import type { Pack, Question } from '../types';

export interface ErreurQuestion { index: number; id: string; raison: string }
export interface Resultat { pack: Pack | null; erreurs: ErreurQuestion[]; erreurPack?: string }

const str = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';
const strs = (v: unknown, min: number): v is string[] =>
  Array.isArray(v) && v.length >= min && v.every(str);
const coord = (n: unknown) => typeof n === 'number' && n >= 0 && n <= 1;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function raison(q: any): string | null {
  if (typeof q !== 'object' || q === null) return 'pas un objet';
  if (!str(q.id)) return 'id manquant';
  if (!Number.isInteger(q.niveau) || q.niveau < 1 || q.niveau > 5) return 'niveau hors 1-5';
  if (!Number.isInteger(q.age_min) || q.age_min < 0) return 'age_min invalide';
  if (typeof q.explication !== 'string') return 'explication manquante';
  switch (q.type) {
    case 'qcm':
      if (!str(q.question)) return 'question vide';
      if (!strs(q.choix, 2)) return 'choix : au moins 2';
      if (!Number.isInteger(q.reponse) || q.reponse < 0 || q.reponse >= q.choix.length) return 'reponse hors choix';
      return null;
    case 'vrai_faux':
      if (!str(q.question)) return 'question vide';
      if (typeof q.reponse !== 'boolean') return 'reponse doit être true/false';
      return null;
    case 'ordre':
      if (!str(q.question)) return 'question vide';
      if (!strs(q.elements, 3)) return 'elements : au moins 3';
      return null;
    case 'mot':
      if (!str(q.indice)) return 'indice vide';
      if (!str(q.reponse)) return 'reponse vide';
      return null;
    case 'paires':
      if (!str(q.question)) return 'question vide';
      if (!Array.isArray(q.paires) || q.paires.length < 2 ||
          !q.paires.every((p: unknown) => strs(p, 2) && p.length === 2)) return 'paires : au moins 2 paires [a, b]';
      return null;
    case 'etiquettes':
      if (!str(q.question) || !str(q.image)) return 'question ou image vide';
      if (!Array.isArray(q.zones) || q.zones.length < 1 ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          !q.zones.every((z: any) => str(z?.label) && coord(z.x) && coord(z.y))) return 'zones invalides (x, y entre 0 et 1)';
      return null;
    case 'indices':
      if (!strs(q.indices, 2)) return 'indices : au moins 2';
      if (!str(q.reponse)) return 'reponse vide';
      return null;
    default:
      return `type inconnu : ${String(q.type)}`;
  }
}

export function validerPack(data: unknown): Resultat {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any;
  if (typeof d !== 'object' || d === null) return { pack: null, erreurs: [], erreurPack: 'pas un objet JSON' };
  if (!str(d.pack) || !str(d.domaine) || !Number.isInteger(d.version) || !Array.isArray(d.questions)) {
    return { pack: null, erreurs: [], erreurPack: 'en-tête invalide (pack, domaine, version, questions)' };
  }
  const erreurs: ErreurQuestion[] = [];
  const ok: Question[] = [];
  const vus = new Set<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  d.questions.forEach((q: any, index: number) => {
    let r = raison(q);
    if (!r && vus.has(q.id)) r = 'id en double';
    if (r) erreurs.push({ index, id: String(q?.id ?? '?'), raison: r });
    else { vus.add(q.id); ok.push(q as Question); }
  });
  return { pack: { pack: d.pack, domaine: d.domaine, version: d.version, questions: ok }, erreurs };
}
