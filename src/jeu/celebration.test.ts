import { describe, it, expect } from 'vitest';
import { aCelebrer, celebration } from './celebration';
import { normaliserProfil } from './profil';

const p = normaliserProfil({ id: 'a', prenom: 'L', avatar: 'x', age: 10, xp: 90, xpDomaine: { Espace: 90 } });

describe('célébration', () => {
  it('montée de niveau', () => {
    expect(celebration(p, { ...p, xp: 120 }).niveau).toBe(2);
  });
  it('étoile gagnée (niveau de domaine)', () => {
    expect(celebration(p, { ...p, xpDomaine: { Espace: 110 } }).etoiles).toBe(1);
  });
  it('rien à fêter sinon', () => {
    expect(aCelebrer(celebration(p, { ...p, xp: 95 }))).toBe(false);
  });
});
