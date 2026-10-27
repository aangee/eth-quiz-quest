import { describe, it, expect } from 'vitest';
import { ordreDesTours, pointsDuel, vainqueur } from './duel';

describe('duel', () => {
  it('100 points par bonne réponse, + jusqu’à 50 selon la rapidité', () => {
    expect(pointsDuel(false, 1000, 20000)).toBe(0);
    expect(pointsDuel(true, 0, 20000)).toBe(150);
    expect(pointsDuel(true, 10000, 20000)).toBe(125);
    expect(pointsDuel(true, 20000, 20000)).toBe(100);
  });
  it('les joueurs jouent chacun leur tour', () => {
    expect(ordreDesTours(4)).toEqual([0, 1, 0, 1]);
  });
  it('vainqueur ou égalité', () => {
    expect(vainqueur([300, 200])).toBe(0);
    expect(vainqueur([100, 250])).toBe(1);
    expect(vainqueur([150, 150])).toBe('egalite');
  });
});
