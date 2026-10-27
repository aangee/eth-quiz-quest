import { describe, it, expect } from 'vitest';
import { dateDuJour, semaineDe, genererQuetes, libelleQuete, majJour, avancerQuetes, majSemaine, avancerSemaine } from './quetes';
import { normaliserProfil } from './profil';

const base = normaliserProfil({ id: 'a', prenom: 'L', avatar: 'x', age: 10 });

describe('quêtes', () => {
  it('dates et semaines', () => {
    expect(dateDuJour(new Date(2026, 9, 5))).toBe('2026-10-05');
    expect(semaineDe(new Date(2026, 9, 26))).toBe('2026-S44');
    expect(semaineDe(new Date(2027, 0, 1))).toBe('2026-S53');
  });
  it('3 quêtes du jour, les mêmes pour une même date', () => {
    const q = genererQuetes('2026-10-27', ['Animaux', 'Espace']);
    expect(q).toHaveLength(3);
    expect(genererQuetes('2026-10-27', ['Animaux', 'Espace'])).toEqual(q);
    expect(libelleQuete(q[1])).toBe('Finir un quiz');
  });
  it('nouvelles quêtes seulement quand le jour change', () => {
    const p = majJour(base, '2026-10-27', ['Espace']);
    expect(p.quetes.date).toBe('2026-10-27');
    expect(majJour(p, '2026-10-27', ['Espace'])).toBe(p);
    expect(majJour(p, '2026-10-28', ['Espace']).quetes.date).toBe('2026-10-28');
  });
  it('une quête finie recharge un joker ; les 3 finies cochent le calendrier', () => {
    let p = majJour({ ...base, debloques: ['joker:temps'] }, '2026-10-27', ['Espace']);
    const rep = { type: 'reponse' as const, domaine: 'Espace', juste: true, rapide: true };
    for (let i = 0; i < 5; i++) p = avancerQuetes(p, rep);
    expect(p.quetes.liste.map((q) => q.progres)).toEqual([5, 0, 5]);
    expect(p.jokers.temps).toBe(2);
    expect(p.calendrier).toEqual([]);
    p = avancerQuetes(p, { type: 'fin_quiz' });
    expect(p.calendrier).toEqual(['2026-10-27']);
    expect(p.jokers.temps).toBe(3);
  });
  it('une mauvaise réponse ne fait pas avancer', () => {
    const p = majJour(base, '2026-10-27', ['Espace']);
    const p2 = avancerQuetes(p, { type: 'reponse', domaine: 'Espace', juste: false, rapide: false });
    expect(p2.quetes.liste.every((q) => q.progres === 0)).toBe(true);
  });
  it('quête de la semaine : remise à zéro et récompense une seule fois', () => {
    const s = majSemaine(undefined, '2026-S44');
    expect(s).toEqual({ semaine: '2026-S44', cible: 30, progres: 0, recompensee: false });
    const a = avancerSemaine(s, 20);
    expect(a.terminee).toBe(false);
    const b = avancerSemaine(a.semaine, 15);
    expect(b.semaine.progres).toBe(30);
    expect(b.terminee).toBe(true);
    expect(avancerSemaine(b.semaine, 5).terminee).toBe(false);
    expect(majSemaine(b.semaine, '2026-S45').progres).toBe(0);
  });
});
