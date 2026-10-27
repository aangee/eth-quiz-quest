import { describe, it, expect } from 'vitest';
import { coteDepart, probaReussite, majCote, choisirQuestion } from './adaptation';
import type { Question } from '../types';

const q = (id: string, niveau: number, age_min = 6): Question =>
  ({ id, type: 'vrai_faux', niveau, age_min, question: 'Q', reponse: true, explication: '' });

describe('adaptation', () => {
  it('cote de départ selon l’âge', () => {
    expect(coteDepart(10)).toBe(1.5);
    expect(coteDepart(13)).toBe(2.5);
    expect(coteDepart(37)).toBe(3);
  });
  it('vise ~75 % de réussite', () => {
    expect(probaReussite(3, 3 - 0.48)).toBeCloseTo(0.75, 2);
  });
  it('bonne réponse fait monter, erreur fait baisser', () => {
    expect(majCote(2, 2, true)).toBeGreaterThan(2);
    expect(majCote(2, 2, false)).toBeLessThan(2);
  });
  it('reste entre 1 et 5', () => {
    expect(majCote(5, 1, true)).toBeLessThanOrEqual(5);
    expect(majCote(1, 5, false)).toBeGreaterThanOrEqual(1);
  });
  it('choisit le niveau le plus proche de cote - 0,48', () => {
    expect(choisirQuestion([q('a', 1), q('b', 3), q('c', 5)], 3.5, 10, new Set())?.id).toBe('b');
  });
  it('filtre l’âge et les questions déjà vues', () => {
    expect(choisirQuestion([q('a', 3, 12), q('b', 3), q('c', 1)], 3.5, 10, new Set(['b']))?.id).toBe('c');
  });
  it('renvoie null quand il ne reste rien', () => {
    expect(choisirQuestion([q('a', 3)], 3, 10, new Set(['a']))).toBeNull();
  });
});
