import { describe, it, expect } from 'vitest';
import { affichage, erreurs, estTrouve, normaliser } from './mot';

describe('mot mystère', () => {
  it('majuscules sans accents', () => {
    expect(normaliser('Éléphant')).toBe('ELEPHANT');
    expect(normaliser('TÊTARD')).toBe('TETARD');
  });
  it('affiche les lettres trouvées, les tirets et les espaces', () => {
    expect(affichage('ARC-EN-CIEL', new Set(['A', 'C']))).toBe('A_C-__-C___');
    expect(affichage('CHAUVE-SOURIS', new Set())).toBe('______-______');
  });
  it('compte les erreurs et détecte le mot trouvé', () => {
    expect(erreurs('LUNE', new Set(['L', 'X', 'Z']))).toBe(2);
    expect(estTrouve('Comète', new Set(['C', 'O', 'M', 'E', 'T']))).toBe(true);
    expect(estTrouve('LUNE', new Set(['L', 'U']))).toBe(false);
  });
});
