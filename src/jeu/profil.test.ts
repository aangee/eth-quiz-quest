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
    expect(p.duels).toBe(0);
  });
  it('garde les champs déjà présents', () => {
    const p = normaliserProfil({ id: 'a', prenom: 'L', avatar: 'x', age: 9, debloques: ['mj:chrono'] });
    expect(p.debloques).toEqual(['mj:chrono']);
    expect(p.xp).toBe(0);
  });
});

describe('thème du profil', () => {
  it('profil ancien sans thème → néon', () => {
    expect(normaliserProfil({ id: 'a', prenom: 'L', avatar: 'x', age: 10 }).theme).toBe('neon');
  });
  it('thème existant conservé (même inconnu : le repli se fait à l\'affichage)', () => {
    expect(normaliserProfil({ id: 'a', prenom: 'L', avatar: 'x', age: 10, theme: 'survie' }).theme).toBe('survie');
  });
});

describe('domaine renommé (Histoire → Histoire du monde)', () => {
  const ancien = normaliserProfil({
    id: 'a', prenom: 'L', avatar: 'x', age: 10,
    xpDomaine: { Histoire: 300, Espace: 100 }, cotes: { Histoire: 3 },
    debloques: ['mj:chrono', 'defi:chrono:Histoire', 'joker:expert:Histoire'],
    jokers: { 'expert:Histoire': 2, temps: 1 }, records: { chrono: 9, 'chrono:Histoire': 12 },
    quetes: { date: 'd', liste: [{ id: 'q', type: 'justes_domaine', domaine: 'Histoire', cible: 5, progres: 2 }] },
  });
  it('la progression suit le nouveau nom', () => {
    expect(ancien.xpDomaine).toEqual({ 'Histoire du monde': 300, Espace: 100 });
    expect(ancien.cotes).toEqual({ 'Histoire du monde': 3 });
    expect(ancien.debloques).toEqual(['mj:chrono', 'defi:chrono:Histoire du monde', 'joker:expert:Histoire du monde']);
    expect(ancien.jokers).toEqual({ 'expert:Histoire du monde': 2, temps: 1 });
    expect(ancien.records).toEqual({ chrono: 9, 'chrono:Histoire du monde': 12 });
    expect(ancien.quetes.liste[0].domaine).toBe('Histoire du monde');
  });
  it('Histoire de France démarre à zéro, et la migration ne se refait pas', () => {
    expect(ancien.xpDomaine['Histoire de France']).toBeUndefined();
    expect(normaliserProfil(ancien)).toEqual(ancien);
  });
});
