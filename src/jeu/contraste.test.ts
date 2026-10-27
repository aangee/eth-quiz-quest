import { describe, it, expect } from 'vitest';
import { contraste, luminance } from './contraste';

describe('contraste (WCAG 2)', () => {
  it('noir sur blanc = 21', () => {
    expect(contraste('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });
  it('symétrique', () => {
    expect(contraste('#22e4ff', '#0b0720')).toBeCloseTo(contraste('#0b0720', '#22e4ff'), 5);
  });
  it('même couleur = 1', () => {
    expect(contraste('#3ee08f', '#3ee08f')).toBe(1);
  });
  it('accepte #rgb court', () => {
    expect(luminance('#fff')).toBeCloseTo(1, 5);
  });
  it('refuse une couleur invalide', () => {
    expect(() => luminance('rouge')).toThrow();
  });
});
