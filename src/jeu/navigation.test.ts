import { describe, it, expect } from 'vitest';
import { ONGLETS, ongletActif } from './navigation';

describe('navigation', () => {
  it('5 onglets dans l\'ordre de la barre', () => {
    expect(ONGLETS.map((o) => o.nom)).toEqual(['Carte', 'Jeux', 'Arbre', 'Classement', 'Profil']);
  });
  it('les écrans-onglets ont la barre', () => {
    expect(ongletActif('carte')).toBe('carte');
    expect(ongletActif('minijeux')).toBe('minijeux');
  });
  it('pas de barre en partie ni hors joueur', () => {
    for (const e of ['quiz', 'jeu', 'duel', 'resultats', 'finjeu', 'profils', 'parent']) expect(ongletActif(e)).toBeNull();
  });
});
