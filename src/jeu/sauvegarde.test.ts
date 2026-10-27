import { describe, it, expect } from 'vitest';
import { creerSauvegarde, lireSauvegarde, nomFichierSauvegarde } from './sauvegarde';
import { normaliserProfil } from './profil';
import type { Pack } from '../types';

const p = normaliserProfil({ id: 'a', prenom: 'Léo', avatar: '🦊', age: 10, xp: 120 });
const pack: Pack = { pack: 'x-v1', domaine: 'X', version: 1, questions: [{ id: 'x1', type: 'vrai_faux', niveau: 1, age_min: 6, question: 'Q', reponse: true, explication: '' }] };

describe('sauvegarde', () => {
  it('aller-retour complet', () => {
    const s = creerSauvegarde([p], null, [pack], new Date(2026, 9, 27));
    const r = lireSauvegarde(JSON.parse(JSON.stringify(s)));
    expect('sauvegarde' in r && r.sauvegarde.profils[0].xp).toBe(120);
    expect('sauvegarde' in r && r.sauvegarde.packs).toHaveLength(1);
    expect(nomFichierSauvegarde(new Date(2026, 9, 27))).toBe('quiz-quest-sauvegarde-2026-10-27.json');
  });
  it('refuse un autre fichier', () => {
    expect(lireSauvegarde({ pack: 'x' })).toEqual({ erreur: "Ce fichier n'est pas une sauvegarde Quiz Quest." });
  });
  it('écarte les profils et packs abîmés, complète les anciens profils', () => {
    const r = lireSauvegarde({
      app: 'quiz-quest', version: 1,
      profils: [{ id: 'b', prenom: 'Papa', avatar: '🦉', age: 37 }, { prenom: 'sans id' }],
      packs: [{ nimporte: 'quoi' }],
    });
    expect('sauvegarde' in r && r.sauvegarde.profils.map((x) => x.debloques)).toEqual([[]]);
    expect('sauvegarde' in r && r.sauvegarde.packs).toEqual([]);
  });
});
