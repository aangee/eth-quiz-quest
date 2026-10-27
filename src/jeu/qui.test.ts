import { describe, it, expect } from 'vitest';
import { choixQui, pointsQui } from './qui';

describe('qui suis-je', () => {
  it('3, 2 puis 1 point selon les indices vus', () => {
    expect(pointsQui(1)).toBe(3);
    expect(pointsQui(2)).toBe(2);
    expect(pointsQui(3)).toBe(1);
    expect(pointsQui(5)).toBe(1);
  });
  it('4 choix distincts dont la réponse, leurres pris dans l’ordre du réservoir', () => {
    const c = choixQui('A', ['B', 'A', 'B', 'C', 'D', 'E']);
    expect(c).toHaveLength(4);
    expect([...c].sort()).toEqual(['A', 'B', 'C', 'D']);
    expect(choixQui('A', ['B'])).toHaveLength(2);
  });
});
