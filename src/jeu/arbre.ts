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
  /** Nom de la branche (sans emoji) : Rapidité, Mémoire et mots, Savoir, ou le domaine. */
  branche: string;
  /** Pour les branches de domaine seulement. */
  domaine?: string;
  cout: number;
  prerequis: string[];
  recompense: Recompense;
}

type Item = [id: string, nom: string, recompense: Recompense];

const mj = (jeu: MiniJeu): Item => [`mj:${jeu}`, MINI_JEUX[jeu].nom, { type: 'minijeu', jeu }];
const jk = (joker: string): Item => [`joker:${joker}`, `Joker ${nomJoker(joker)}`, { type: 'joker', joker }];

/** Enchaîne des nœuds : chacun exige le précédent ; coût = 1, 2, puis 3. */
function chaine(branche: string, items: Item[], prerequisEnPlus: (r: Recompense) => string[] = () => [], domaine?: string): Noeud[] {
  return items.map(([id, nom, recompense], i) => ({
    id,
    nom,
    branche,
    ...(domaine ? { domaine } : {}),
    cout: Math.min(3, i + 1),
    prerequis: [...(i ? [items[i - 1][0]] : []), ...prerequisEnPlus(recompense)],
    recompense,
  }));
}

export const COMPETENCES: Noeud[] = [
  ...chaine('Rapidité', [mj('chrono'), mj('calcul'), jk('temps')]),
  ...chaine('Mémoire et mots', [mj('memory'), mj('mot'), jk('indice')]),
  ...chaine('Savoir', [mj('frise'), mj('qui'), mj('etiquettes'), jk('cinquante')]),
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
  return chaine(domaine, [...defis, jk(`expert:${domaine}`)], (r) => (r.type === 'defi' ? [`mj:${r.jeu}`] : []), domaine);
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

// --- Vue de l'arbre (lot 9) : ce que l'écran affiche, calculé ici pour être testé ---

export type EtatVue = 'fait' | 'prochain' | 'trop_cher' | 'ferme';

export interface NoeudVue {
  noeud: Noeud;
  etat: EtatVue;
  /** Prérequis pas encore débloqués, avec leur branche (un défi peut demander un mini-jeu d'une autre branche). */
  manquants: { id: string; nom: string; branche: string }[];
  /** Nœud suivant dans la même branche. */
  suivant?: Noeud;
}

export interface BrancheVue { nom: string; domaine?: string; faits: number; total: number; noeuds: NoeudVue[] }

const ETAT_VUE: Record<EtatNoeud, EtatVue> = { debloque: 'fait', disponible: 'prochain', trop_cher: 'trop_cher', verrouille: 'ferme' };

/** Branches dans l'ordre de l'arbre (compétences puis domaines), avec l'état de chaque nœud. */
export function vueArbre(p: Profil, arbre: Noeud[]): { dispo: number; branches: BrancheVue[] } {
  const dispo = etoilesDispo(p, arbre);
  const parId = new Map(arbre.map((n) => [n.id, n]));
  const noms = [...new Set(arbre.map((n) => n.branche))];
  const branches = noms.map((nom): BrancheVue => {
    const ns = arbre.filter((n) => n.branche === nom);
    const noeuds = ns.map((n, i): NoeudVue => ({
      noeud: n,
      etat: ETAT_VUE[etatNoeud(p, n, dispo)],
      manquants: n.prerequis.filter((id) => !p.debloques.includes(id)).map((id) => {
        const m = parId.get(id);
        return { id, nom: m?.nom ?? id, branche: m?.branche ?? '' };
      }),
      ...(ns[i + 1] ? { suivant: ns[i + 1] } : {}),
    }));
    return {
      nom, ...(ns[0].domaine ? { domaine: ns[0].domaine } : {}),
      faits: noeuds.filter((v) => v.etat === 'fait').length, total: noeuds.length, noeuds,
    };
  });
  return { dispo, branches };
}

const PHRASES_JEUX: Record<MiniJeu, string> = {
  chrono: 'Vrai ou faux en rafale : un maximum de bonnes réponses avant la fin du chrono.',
  calcul: 'Des calculs de tête à enchaîner le plus vite possible.',
  memory: 'Retrouve les paires : une question et sa réponse cachées sous les cartes.',
  mot: 'Devine le mot lettre par lettre, avant de manquer d\'essais.',
  frise: 'Remets les événements dans le bon ordre.',
  qui: 'Des indices un par un : trouve de qui ou de quoi on parle, le plus tôt possible.',
  etiquettes: 'Place les étiquettes au bon endroit sur l\'image.',
};

const PHRASES_JOKERS: Record<string, string> = {
  temps: 'Ajoute 10 secondes à une question du quiz.',
  cinquante: 'Retire la moitié des mauvaises réponses d\'un QCM.',
  indice: 'Retire une mauvaise réponse d\'un QCM.',
};

/** Type de récompense et phrase qui dit ce qu'elle donne (fiche de l'arbre). */
export function descriptionRecompense(n: Noeud): { type: 'Nouveau mini-jeu' | 'Joker' | 'Défi'; phrase: string } {
  const r = n.recompense;
  if (r.type === 'minijeu') return { type: 'Nouveau mini-jeu', phrase: PHRASES_JEUX[r.jeu] };
  if (r.type === 'defi') {
    return { type: 'Défi', phrase: `${MINI_JEUX[r.jeu].nom} avec seulement des questions ${r.domaine} : plus long, XP ×2.` };
  }
  if (r.joker.startsWith('expert:')) {
    return { type: 'Joker', phrase: `Retire toutes les mauvaises réponses d'une question ${r.joker.slice('expert:'.length)}.` };
  }
  return { type: 'Joker', phrase: PHRASES_JOKERS[r.joker] ?? 'Une aide pour le quiz.' };
}
