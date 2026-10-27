import { describe, it, expect } from 'vitest';
import { normaliserProfil } from './profil';

describe('normaliserProfil', () => {
  it('complète un profil du lot 1', () => {
    const p = normaliserProfil({ id: 'a', prenom: 'Léo', avatar: '🦊', age: 10, xp: 40, cotes: { Espace: 2 }, xpDomaine: { Espace: 40 } });
    expect(p.xp).toBe(40);
    expect(p.cotes).toEqual({ Espace: 2 });
    expect(p.debloques).toEqual([]);
    expect(p.jokers).toEqual({});
    expect(p.quetes).toEqual({ date: '', liste: [] });
    expect(p.calendrier).toEqual([]);
    expect(p.records).toEqual({});
  });
  it('garde les champs déjà présents', () => {
    const p = normaliserProfil({ id: 'a', prenom: 'L', avatar: 'x', age: 9, debloques: ['mj:chrono'] });
    expect(p.debloques).toEqual(['mj:chrono']);
    expect(p.xp).toBe(0);
  });
});
