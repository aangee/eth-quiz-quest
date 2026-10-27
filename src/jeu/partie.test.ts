import { describe, it, expect } from 'vitest';
import { appliquerReponse, bonneReponse } from './partie';
import { normaliserProfil } from './profil';
import type { Question } from '../types';

const profil = normaliserProfil({ id: 'p', prenom: 'Léo', avatar: '🦊', age: 10 });
const q: Question = { id: 'q', type: 'vrai_faux', niveau: 2, age_min: 6, question: 'Q', reponse: true, explication: '' };

describe('appliquerReponse', () => {
  it('bonne réponse : XP + cote qui monte', () => {
    const r = appliquerReponse(profil, 'Espace', q, true, 10000, 20000);
    expect(r.xp).toBe(20);
    expect(r.profil.xp).toBe(20);
    expect(r.profil.xpDomaine.Espace).toBe(20);
    expect(r.profil.cotes.Espace).toBeGreaterThan(1.5);
  });
  it('mauvaise réponse : pas d’XP, cote qui baisse', () => {
    const r = appliquerReponse(profil, 'Espace', q, false, 10000, 20000);
    expect(r.xp).toBe(0);
    expect(r.profil.cotes.Espace).toBeLessThan(1.5);
  });
  it('ne modifie pas le profil d’origine', () => {
    appliquerReponse(profil, 'Espace', q, true, 10000, 20000);
    expect(profil.xp).toBe(0);
    expect(profil.cotes).toEqual({});
  });
  it('bonneReponse donne le texte de la bonne réponse', () => {
    expect(bonneReponse({ id: 'v', type: 'vrai_faux', niveau: 1, age_min: 6, question: 'Q', reponse: false, explication: '' })).toBe('Faux');
    expect(bonneReponse({ id: 'c', type: 'qcm', niveau: 1, age_min: 6, question: 'Q', choix: ['a', 'b'], reponse: 1, explication: '' })).toBe('b');
  });
});
