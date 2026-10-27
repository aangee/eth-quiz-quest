import { describe, it, expect } from 'vitest';
import { ICONES, ICONES_DOMAINE } from './icones';

describe('icônes', () => {
  it('chaque icône a au moins un tracé valide', () => {
    for (const [nom, traces] of Object.entries(ICONES)) {
      expect(traces.length, nom).toBeGreaterThan(0);
      traces.forEach((d) => expect(d, nom).toMatch(/^[MmLlHhVvCcSsQqTtAaZz0-9 .,-]+$/));
    }
  });
  it('les icônes de domaine existent', () => {
    ICONES_DOMAINE.forEach((n) => expect(ICONES[n]).toBeDefined());
  });
});
