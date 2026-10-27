import { describe, it, expect } from 'vitest';
import { debutSemaine, entreeDe, trier, xpDeLaSemaine, type EntreeClassement } from './classement';
import { normaliserProfil } from './profil';

const p = normaliserProfil({ id: 'a', prenom: 'Loulou', avatar: '🦊', age: 10, xp: 500, records: { chrono: 12 }, duels: 3 });

describe('classement', () => {
  it('XP de la semaine : compte depuis le début de la semaine, 0 la semaine suivante', () => {
    const debut = debutSemaine(p, '2026-S44');
    expect(debutSemaine(debut, '2026-S44')).toBe(debut);
    const plus = { ...debut, xp: 650 };
    expect(xpDeLaSemaine(plus, '2026-S44')).toBe(150);
    expect(xpDeLaSemaine(plus, '2026-S45')).toBe(0);
  });
  it('entrée envoyée : pseudo, avatar, appareil, niveau, scores — ni âge ni rien d’autre', () => {
    const e = entreeDe(debutSemaine(p, '2026-S44'), 'tél. de Loulou', '2026-S44', new Date('2026-10-27T10:00:00Z'));
    expect(e).toEqual({
      id: 'a', pseudo: 'Loulou', avatar: '🦊', appareil: 'tél. de Loulou', niveau: 3, xp: 500, xpSemaine: 0,
      semaine: '2026-S44', records: { chrono: 12 }, duels: 3, maj: '2026-10-27T10:00:00.000Z',
    });
    expect(Object.keys(e)).not.toContain('age');
  });
  it('tri par XP, par semaine (semaine courante seulement) et par duels', () => {
    const e = (id: string, xp: number, xpSemaine: number, semaine: string, duels: number): EntreeClassement =>
      ({ id, pseudo: id, avatar: 'x', appareil: '', niveau: 1, xp, xpSemaine, semaine, records: {}, duels, maj: '' });
    const l = [e('a', 100, 50, '2026-S44', 1), e('b', 300, 90, '2026-S43', 0), e('c', 200, 70, '2026-S44', 5)];
    expect(trier(l, 'xp', '2026-S44').map((x) => x.entree.id)).toEqual(['b', 'c', 'a']);
    expect(trier(l, 'semaine', '2026-S44').map((x) => [x.entree.id, x.valeur])).toEqual([['c', 70], ['a', 50], ['b', 0]]);
    expect(trier(l, 'duels', '2026-S44')[0].entree.id).toBe('c');
  });
  it('records : seulement ceux qui ont joué, Memory du plus petit au plus grand', () => {
    const e = (id: string, records: Record<string, number>): EntreeClassement =>
      ({ id, pseudo: id, avatar: 'x', appareil: '', niveau: 1, xp: 0, xpSemaine: 0, semaine: '', records, duels: 0, maj: '' });
    const l = [e('a', { chrono: 10, memory: 20 }), e('b', { memory: 14 }), e('c', { chrono: 15 })];
    expect(trier(l, 'record:chrono', '').map((x) => x.entree.id)).toEqual(['c', 'a']);
    expect(trier(l, 'record:memory', '').map((x) => x.entree.id)).toEqual(['b', 'a']);
  });
});
