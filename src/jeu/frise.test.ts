import { describe, it, expect } from 'vitest';
import { friseJuste, verifierOrdre } from './frise';

describe('frise', () => {
  it('vérifie chaque position', () => {
    expect(verifierOrdre(['a', 'b', 'c'], ['a', 'c', 'b'])).toEqual([true, false, false]);
  });
  it('juste seulement si complète et dans l’ordre', () => {
    expect(friseJuste(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(true);
    expect(friseJuste(['a', 'b', 'c'], ['a', 'b'])).toBe(false);
    expect(friseJuste(['a', 'b', 'c'], ['b', 'a', 'c'])).toBe(false);
  });
});
