import { describe, it, expect } from 'vitest';
import { cleRecord, majRecord, crediter, contenu, longueur, multXp } from './minijeux';
import { normaliserProfil } from './profil';
import type { Question } from '../types';

const base = normaliserProfil({ id: 'a', prenom: 'L', avatar: 'x', age: 10 });

describe('mini-jeux', () => {
  it('clé de record, longueur et XP d’un défi', () => {
    expect(cleRecord('chrono')).toBe('chrono');
    expect(cleRecord('chrono', 'Espace')).toBe('chrono:Espace');
    expect(longueur(60000, { domaines: [], defi: false })).toBe(60000);
    expect(longueur(3, { domaines: [], defi: true })).toBe(5);
    expect(multXp({ domaines: [], defi: true })).toBe(2);
  });
  it('record : plus grand = mieux, sauf au Memory', () => {
    const a = majRecord(base, 'chrono', 12);
    expect(a.nouveau).toBe(true);
    expect(a.profil.records.chrono).toBe(12);
    expect(majRecord(a.profil, 'chrono', 10).nouveau).toBe(false);
    const m = majRecord(base, 'memory', 14);
    expect(majRecord(m.profil, 'memory', 11).profil.records.memory).toBe(11);
    expect(majRecord(m.profil, 'memory', 20).nouveau).toBe(false);
  });
  it('un score nul ne fait pas de record', () => {
    expect(majRecord(base, 'chrono', 0).nouveau).toBe(false);
  });
  it('crédite l’XP au domaine et au total, sans toucher la cote', () => {
    const p = crediter({ ...base, cotes: { Espace: 2 } }, 'Espace', 30);
    expect(p.xp).toBe(30);
    expect(p.xpDomaine.Espace).toBe(30);
    expect(p.cotes.Espace).toBe(2);
    expect(crediter(base, null, 10).xpDomaine).toEqual({});
  });
  it('contenu : filtre le type et l’âge', () => {
    const qs: Question[] = [
      { id: 'a', type: 'mot', niveau: 1, age_min: 6, indice: 'i', reponse: 'A', explication: '' },
      { id: 'b', type: 'mot', niveau: 1, age_min: 14, indice: 'i', reponse: 'B', explication: '' },
      { id: 'c', type: 'vrai_faux', niveau: 1, age_min: 6, question: 'Q', reponse: true, explication: '' },
    ];
    const c = contenu(() => qs, 'mot', ['Espace'], 10);
    expect(c.map((x) => x.q.id)).toEqual(['a']);
    expect(c[0].domaine).toBe('Espace');
  });
});
