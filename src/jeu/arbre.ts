import type { Pack, Profil, Question, TypeQuestion } from '../types';
import { niveauDepuisXp } from './xp';
import { ajouterCharge } from './jokers';

export type MiniJeu = 'chrono' | 'calcul' | 'memory' | 'mot' | 'frise' | 'qui' | 'etiquettes';

/** Nom affiché et type de question lu par chaque mini-jeu (null = contenu généré). */
export const MINI_JEUX: Record<MiniJeu, { nom: string; type: TypeQuestion | null }> = {
  chrono: { nom: 'Chrono-éclair', type: 'vrai_faux' },
  calcul: { nom: 'Calcul éclair', type: null },
  memory: { nom: 'Memory', type: 'paires' },
  mot: { nom: 'Mot mystère', type: 'mot' },
  frise: { nom: 'Frise', type: 'ordre' },
  qui: { nom: 'Qui suis-je ?', type: 'indices' },
  etiquettes: { nom: 'Étiquettes', type: 'etiquettes' },
};

const NOMS_JOKERS: Record<string, string> = { cinquante: '50/50', temps: '+10 s', indice: 'Indice' };

export function nomJoker(id: string): string {
  return id.startsWith('expert:') ? `Expert ${id.slice('expert:'.length)}` : NOMS_JOKERS[id] ?? id;
}

export type Recompense =
  | { type: 'minijeu'; jeu: MiniJeu }
  | { type: 'joker'; joker: string }
  | { type: 'defi'; jeu: MiniJeu; domaine: string };

export interface Noeud {
  id: string;
  nom: string;
  branche: string;
  cout: number;
  prerequis: string[];
  recompense: Recompense;
}

type Item = [id: string, nom: string, recompense: Recompense];

const mj = (jeu: MiniJeu): Item => [`mj:${jeu}`, MINI_JEUX[jeu].nom, { type: 'minijeu', jeu }];
const jk = (joker: string): Item => [`joker:${joker}`, `Joker ${nomJoker(joker)}`, { type: 'joker', joker }];

/** Enchaîne des nœuds : chacun exige le précédent ; coût = 1, 2, puis 3. */
function chaine(branche: string, items: Item[], prerequisEnPlus: (r: Recompense) => string[] = () => []): Noeud[] {
  return items.map(([id, nom, recompense], i) => ({
    id,
    nom,
    branche,
    cout: Math.min(3, i + 1),
    prerequis: [...(i ? [items[i - 1][0]] : []), ...prerequisEnPlus(recompense)],
    recompense,
  }));
}

export const COMPETENCES: Noeud[] = [
  ...chaine('⚡ Rapidité', [mj('chrono'), mj('calcul'), jk('temps')]),
  ...chaine('🧠 Mémoire et mots', [mj('memory'), mj('mot'), jk('indice')]),
  ...chaine('🔭 Savoir', [mj('frise'), mj('qui'), mj('etiquettes'), jk('cinquante')]),
];

export const MIN_QUESTIONS_DEFI = 5;

/** Branche générée depuis le contenu du domaine : défis (3 max) puis joker Expert. */
export function brancheDomaine(domaine: string, questions: Question[]): Noeud[] {
  const compte = new Map<TypeQuestion, number>();
  questions.forEach((q) => compte.set(q.type, (compte.get(q.type) ?? 0) + 1));
  const nb = (j: MiniJeu) => { const t = MINI_JEUX[j].type; return t ? compte.get(t) ?? 0 : 0; };
  const jeux = (Object.keys(MINI_JEUX) as MiniJeu[])
    .filter((j) => nb(j) >= MIN_QUESTIONS_DEFI)
    .sort((a, b) => nb(b) - nb(a))
    .slice(0, 3);
  const defis = jeux.map((jeu): Item => [`defi:${jeu}:${domaine}`, `Défi ${MINI_JEUX[jeu].nom} ${domaine}`, { type: 'defi', jeu, domaine }]);
  return chaine(`🌍 ${domaine}`, [...defis, jk(`expert:${domaine}`)], (r) => (r.type === 'defi' ? [`mj:${r.jeu}`] : []));
}

export function construireArbre(packs: Pack[]): Noeud[] {
  const parDomaine = new Map<string, Question[]>();
  packs.forEach((p) => parDomaine.set(p.domaine, [...(parDomaine.get(p.domaine) ?? []), ...p.questions]));
  const doms = [...parDomaine.keys()].sort((a, b) => a.localeCompare(b, 'fr'));
  return [...COMPETENCES, ...doms.flatMap((d) => brancheDomaine(d, parDomaine.get(d)!))];
}

export function etoilesGagnees(p: Profil): number {
  return Object.values(p.xpDomaine).reduce((s, xp) => s + niveauDepuisXp(xp) - 1, 0);
}

export function etoilesDispo(p: Profil, arbre: Noeud[]): number {
  const cout = new Map(arbre.map((n) => [n.id, n.cout]));
  return etoilesGagnees(p) - p.debloques.reduce((s, id) => s + (cout.get(id) ?? 0), 0);
}

export type EtatNoeud = 'debloque' | 'disponible' | 'trop_cher' | 'verrouille';

export function etatNoeud(p: Profil, n: Noeud, dispo: number): EtatNoeud {
  if (p.debloques.includes(n.id)) return 'debloque';
  if (!n.prerequis.every((id) => p.debloques.includes(id))) return 'verrouille';
  return dispo >= n.cout ? 'disponible' : 'trop_cher';
}

export function debloquer(p: Profil, n: Noeud, arbre: Noeud[]): Profil {
  if (etatNoeud(p, n, etoilesDispo(p, arbre)) !== 'disponible') return p;
  const q = { ...p, debloques: [...p.debloques, n.id] };
  return n.recompense.type === 'joker' ? ajouterCharge(q, n.recompense.joker) : q;
}
