import { describe, it, expect } from 'vitest';
import { validerPack } from './valider';

const base = { pack: 't', domaine: 'Test', version: 1 };
const qcm = { id: 'a', type: 'qcm', niveau: 2, age_min: 8, question: 'Q ?', choix: ['x', 'y'], reponse: 1, explication: '' };

describe('validerPack', () => {
  it('accepte un pack valide', () => {
    const r = validerPack({ ...base, questions: [qcm] });
    expect(r.erreurs).toEqual([]);
    expect(r.pack?.questions).toHaveLength(1);
  });
  it('garde une icône texte, ignore le reste', () => {
    expect(validerPack({ ...base, icone: 'espace', questions: [qcm] }).pack?.icone).toBe('espace');
    expect(validerPack({ ...base, icone: 3, questions: [qcm] }).pack?.icone).toBeUndefined();
  });
  it('rejette un en-tête invalide', () => {
    expect(validerPack({ questions: [] }).erreurPack).toBeDefined();
  });
  it('rejette une question invalide sans bloquer les autres', () => {
    const r = validerPack({ ...base, questions: [qcm, { ...qcm, id: 'b', reponse: 5 }] });
    expect(r.pack?.questions).toHaveLength(1);
    expect(r.erreurs).toEqual([{ index: 1, id: 'b', raison: 'reponse hors choix' }]);
  });
  it('rejette un id en double', () => {
    expect(validerPack({ ...base, questions: [qcm, qcm] }).erreurs[0].raison).toBe('id en double');
  });
  it('rejette un niveau hors 1-5', () => {
    expect(validerPack({ ...base, questions: [{ ...qcm, niveau: 6 }] }).erreurs[0].raison).toBe('niveau hors 1-5');
  });
  it('rejette plus de 4 choix', () => {
    expect(validerPack({ ...base, questions: [{ ...qcm, choix: ['a', 'b', 'c', 'd', 'e'] }] }).erreurs[0].raison).toBe('choix : 2 à 4');
  });
  it('rejette des choix en double', () => {
    expect(validerPack({ ...base, questions: [{ ...qcm, choix: ['a', 'a'] }] }).erreurs[0].raison).toBe('choix en double');
  });
  it('rejette un type inconnu', () => {
    expect(validerPack({ ...base, questions: [{ ...qcm, type: 'devinette' }] }).erreurs[0].raison).toBe('type inconnu : devinette');
  });
  it('valide les 7 types', () => {
    const c = { niveau: 1, age_min: 6, explication: '' };
    const qs = [
      qcm,
      { ...c, id: 'v', type: 'vrai_faux', question: 'Q', reponse: true },
      { ...c, id: 'o', type: 'ordre', question: 'Q', elements: ['a', 'b', 'c'] },
      { ...c, id: 'm', type: 'mot', indice: 'i', reponse: 'MOT' },
      { ...c, id: 'p', type: 'paires', question: 'Q', paires: [['a', '1'], ['b', '2']] },
      { ...c, id: 'e', type: 'etiquettes', question: 'Q', image: 'i.svg', zones: [{ label: 'L', x: 0.5, y: 0.5 }] },
      { ...c, id: 'i', type: 'indices', indices: ['a', 'b'], reponse: 'R' },
    ];
    expect(validerPack({ ...base, questions: qs }).erreurs).toEqual([]);
  });
});
