import { describe, it, expect } from 'vitest';
import { creerCartes, estPaire } from './memory';

describe('memory', () => {
  it('2 cartes par paire, mélangées', () => {
    const c = creerCartes([['Mars', 'Rouge'], ['Jupiter', 'Géante'], ['Saturne', 'Anneaux']]);
    expect(c).toHaveLength(6);
    expect(new Set(c.map((x) => x.id)).size).toBe(6);
    expect(c.filter((x) => x.paire === 1).map((x) => x.texte).sort()).toEqual(['Géante', 'Jupiter']);
  });
  it('estPaire : même paire, cartes différentes', () => {
    const [a, b] = creerCartes([['A', 'B']], () => 0.99);
    expect(estPaire(a, b)).toBe(true);
    expect(estPaire(a, a)).toBe(false);
  });
});
