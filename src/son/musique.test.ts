import { describe, it, expect } from 'vitest';
import { ACCORDS, frequence } from './musique';

describe('musique', () => {
  it('fréquence des notes (la 440 Hz)', () => {
    expect(frequence(69)).toBe(440);
    expect(frequence(81)).toBeCloseTo(880);
  });
  it('boucle de 4 accords de 4 notes, dans les graves et médiums doux', () => {
    expect(ACCORDS).toHaveLength(4);
    expect(ACCORDS.flat().every((n) => n >= 40 && n <= 72)).toBe(true);
  });
});
