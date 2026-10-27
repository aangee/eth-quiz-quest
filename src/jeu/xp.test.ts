import { describe, it, expect } from 'vitest';
import { xpGagne, seuil, niveauDepuisXp } from './xp';

describe('xp', () => {
  it('10 × niveau, +50 % si réponse dans le premier tiers du temps', () => {
    expect(xpGagne(2, 10000, 20000)).toBe(20);
    expect(xpGagne(2, 5000, 20000)).toBe(30);
  });
  it('seuils de niveau', () => {
    expect(seuil(1)).toBe(0);
    expect(seuil(2)).toBe(100);
    expect(seuil(3)).toBe(300);
  });
  it('niveau depuis l’XP', () => {
    expect(niveauDepuisXp(0)).toBe(1);
    expect(niveauDepuisXp(99)).toBe(1);
    expect(niveauDepuisXp(100)).toBe(2);
    expect(niveauDepuisXp(300)).toBe(3);
  });
});
