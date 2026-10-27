import { describe, it, expect } from 'vitest';
import { defiOubli, hacherPin, pinValide, verifierPin } from './pin';

describe('code PIN', () => {
  it('4 chiffres exactement', () => {
    expect(pinValide('1234')).toBe(true);
    expect(pinValide('123')).toBe(false);
    expect(pinValide('12a4')).toBe(false);
  });
  it('haché, jamais en clair, et vérifiable', async () => {
    const h = await hacherPin('2468');
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(h).not.toContain('2468');
    expect(await verifierPin('2468', h)).toBe(true);
    expect(await verifierPin('1357', h)).toBe(false);
  });
  it('défi « PIN oublié » : une multiplication à 2 chiffres', () => {
    for (let i = 0; i < 50; i++) {
      const d = defiOubli();
      const [a, b] = d.texte.split(' × ').map(Number);
      expect(a).toBeGreaterThanOrEqual(12);
      expect(b).toBeLessThanOrEqual(98);
      expect(d.reponse).toBe(a * b);
    }
  });
});
