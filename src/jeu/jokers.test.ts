import { describe, it, expect } from 'vitest';
import { ajouterCharge, utiliserJoker, jokerARecharger, jokerUtilisable, choixACacher, MAX_CHARGES } from './jokers';
import { normaliserProfil } from './profil';
import type { QCM, VraiFaux } from '../types';

const base = normaliserProfil({ id: 'a', prenom: 'L', avatar: 'x', age: 10 });
const qcm: QCM = { id: 'q', type: 'qcm', niveau: 1, age_min: 6, question: 'Q', choix: ['a', 'b', 'c', 'd'], reponse: 2, explication: '' };
const vf: VraiFaux = { id: 'v', type: 'vrai_faux', niveau: 1, age_min: 6, question: 'Q', reponse: true, explication: '' };

describe('jokers', () => {
  it('les charges plafonnent à 3', () => {
    let p = base;
    for (let i = 0; i < 5; i++) p = ajouterCharge(p, 'temps');
    expect(p.jokers.temps).toBe(MAX_CHARGES);
  });
  it('utiliser retire une charge, jamais en dessous de 0', () => {
    const p = utiliserJoker(ajouterCharge(base, 'temps'), 'temps');
    expect(p.jokers.temps).toBe(0);
    expect(utiliserJoker(p, 'temps')).toBe(p);
  });
  it('recharge le joker débloqué qui a le moins de charges', () => {
    const p = { ...base, debloques: ['mj:chrono', 'joker:temps', 'joker:indice'], jokers: { temps: 2, indice: 1 } };
    expect(jokerARecharger(p)).toBe('indice');
    expect(jokerARecharger({ ...p, jokers: { temps: 3, indice: 3 } })).toBeNull();
    expect(jokerARecharger(base)).toBeNull();
  });
  it('où chaque joker est utilisable', () => {
    expect(jokerUtilisable('temps', vf, 'Espace')).toBe(true);
    expect(jokerUtilisable('cinquante', qcm, 'Espace')).toBe(true);
    expect(jokerUtilisable('cinquante', vf, 'Espace')).toBe(false);
    expect(jokerUtilisable('expert:Espace', vf, 'Espace')).toBe(true);
    expect(jokerUtilisable('expert:Espace', qcm, 'Animaux')).toBe(false);
  });
  it('cache des mauvais choix, jamais la bonne réponse', () => {
    expect(choixACacher(qcm, 'cinquante')).toHaveLength(2);
    expect(choixACacher(qcm, 'indice')).toHaveLength(1);
    expect(choixACacher(qcm, 'expert:Espace')).toHaveLength(3);
    expect(choixACacher(qcm, 'expert:Espace')).not.toContain(2);
  });
});
