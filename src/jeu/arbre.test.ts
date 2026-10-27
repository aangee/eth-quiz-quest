import { describe, it, expect } from 'vitest';
import { COMPETENCES, MINI_JEUX, brancheDomaine, construireArbre, descriptionRecompense, etoilesGagnees, etoilesDispo, etatNoeud, debloquer, vueArbre, type MiniJeu } from './arbre';
import { normaliserProfil } from './profil';
import type { Question } from '../types';

const vf = (i: number): Question => ({ id: `v${i}`, type: 'vrai_faux', niveau: 1, age_min: 6, question: 'Q', reponse: true, explication: '' });
const qcm = (i: number): Question => ({ id: `q${i}`, type: 'qcm', niveau: 1, age_min: 6, question: 'Q', choix: ['a', 'b'], reponse: 0, explication: '' });
const base = normaliserProfil({ id: 'a', prenom: 'L', avatar: 'x', age: 10 });

describe('arbre', () => {
  it('3 branches compétences, 10 nœuds, coûts 1 à 3', () => {
    expect(new Set(COMPETENCES.map((n) => n.branche)).size).toBe(3);
    expect(COMPETENCES).toHaveLength(10);
    expect(COMPETENCES.map((n) => n.cout)).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3, 3]);
  });
  it('branche domaine : un défi par type assez présent, puis le joker Expert', () => {
    const b = brancheDomaine('Espace', [...[1, 2, 3, 4, 5].map(vf), qcm(1)]);
    expect(b.map((n) => n.id)).toEqual(['defi:chrono:Espace', 'joker:expert:Espace']);
    expect(b[0].prerequis).toEqual(['mj:chrono']);
    expect(b[1].prerequis).toEqual(['defi:chrono:Espace']);
  });
  it('sans type assez présent : seulement le joker Expert, coût 1', () => {
    const b = brancheDomaine('Animaux', [vf(1), qcm(1)]);
    expect(b).toHaveLength(1);
    expect(b[0].cout).toBe(1);
    expect(b[0].prerequis).toEqual([]);
  });
  it('construireArbre ajoute une branche par domaine', () => {
    const a = construireArbre([{ pack: 'p', domaine: 'Espace', version: 1, questions: [vf(1)] }]);
    expect(a.some((n) => n.id === 'joker:expert:Espace')).toBe(true);
  });
  it('1 étoile par niveau gagné dans un domaine', () => {
    expect(etoilesGagnees({ ...base, xpDomaine: { Espace: 100, Animaux: 300 } })).toBe(3);
  });
  it('débloquer dépense les étoiles et respecte les prérequis', () => {
    const p = { ...base, xpDomaine: { Espace: 300 } }; // niveau 3 → 2 étoiles
    const chrono = COMPETENCES.find((n) => n.id === 'mj:chrono')!;
    const calcul = COMPETENCES.find((n) => n.id === 'mj:calcul')!;
    expect(etatNoeud(p, calcul, etoilesDispo(p, COMPETENCES))).toBe('verrouille');
    const p2 = debloquer(p, chrono, COMPETENCES);
    expect(p2.debloques).toEqual(['mj:chrono']);
    expect(etoilesDispo(p2, COMPETENCES)).toBe(1);
    expect(etatNoeud(p2, calcul, 1)).toBe('trop_cher');
    expect(debloquer(p2, calcul, COMPETENCES)).toBe(p2);
  });
  it('débloquer un joker donne 1 charge', () => {
    const p = { ...base, xpDomaine: { Espace: 2100 }, debloques: ['mj:chrono', 'mj:calcul'] }; // niveau 7 → 6 étoiles
    const p2 = debloquer(p, COMPETENCES.find((n) => n.id === 'joker:temps')!, COMPETENCES);
    expect(p2.jokers.temps).toBe(1);
  });
});

describe('vueArbre', () => {
  const arbre = [...COMPETENCES, ...brancheDomaine('Espace', [1, 2, 3, 4, 5].map(vf))];
  // niveau 3 en Espace → 2 étoiles ; chrono débloqué (1) → 1 étoile dispo
  const p = { ...base, xpDomaine: { Espace: 300 }, debloques: ['mj:chrono'] };
  const v = vueArbre(p, arbre);
  const noeud = (id: string) => v.branches.flatMap((b) => b.noeuds).find((x) => x.noeud.id === id)!;

  it('branches dans l\'ordre, sans emoji, domaine indiqué', () => {
    expect(v.branches.map((b) => b.nom)).toEqual(['Rapidité', 'Mémoire et mots', 'Savoir', 'Espace']);
    expect(v.branches[3].domaine).toBe('Espace');
    expect(v.branches[0].domaine).toBeUndefined();
    v.branches.forEach((b) => expect(b.nom).toMatch(/^[\p{L} ]+$/u));
  });
  it('états : fait, prochain, trop cher, fermé', () => {
    expect(v.dispo).toBe(1);
    expect(noeud('mj:chrono').etat).toBe('fait');
    expect(noeud('mj:memory').etat).toBe('prochain');
    expect(noeud('mj:calcul').etat).toBe('trop_cher');
    expect(noeud('mj:mot').etat).toBe('ferme');
  });
  it('prérequis manquants avec leur branche, et nœud suivant', () => {
    expect(noeud('mj:mot').manquants).toEqual([{ id: 'mj:memory', nom: 'Memory', branche: 'Mémoire et mots' }]);
    expect(noeud('joker:expert:Espace').manquants[0].branche).toBe('Espace');
    expect(noeud('mj:chrono').suivant?.id).toBe('mj:calcul');
    expect(noeud('joker:temps').suivant).toBeUndefined();
  });
  it('avancement par branche', () => {
    expect(v.branches[0]).toMatchObject({ faits: 1, total: 3 });
  });
});

describe('descriptionRecompense', () => {
  it('une phrase par mini-jeu et par joker', () => {
    COMPETENCES.forEach((n) => expect(descriptionRecompense(n).phrase.length).toBeGreaterThan(10));
    (Object.keys(MINI_JEUX) as MiniJeu[]).forEach((j) =>
      expect(descriptionRecompense({ id: 'x', nom: 'x', branche: 'b', cout: 1, prerequis: [], recompense: { type: 'minijeu', jeu: j } }).type).toBe('Nouveau mini-jeu'));
  });
  it('défi et Expert citent le domaine', () => {
    const b = brancheDomaine('Espace', [1, 2, 3, 4, 5].map(vf));
    expect(descriptionRecompense(b[0])).toMatchObject({ type: 'Défi' });
    expect(descriptionRecompense(b[0]).phrase).toContain('Espace');
    expect(descriptionRecompense(b[1]).phrase).toContain('Espace');
  });
});
