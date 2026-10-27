import { describe, it, expect } from 'vitest';
import { THEMES, THEME_PAR_DEFAUT, themeParId } from './registre';
import { contraste } from '../jeu/contraste';

const PAIRES: [string, string][] = [
  ['texte', 'fond'], ['texte', 'surface'], ['texte', 'surfaceForte'], ['texteDoux', 'fond'], ['texteDoux', 'surface'],
  ['surAccent', 'accent'], ['surOk', 'ok'], ['surKo', 'ko'], ['lien', 'fond'],
];

describe('registre des thèmes', () => {
  it('ids uniques, en minuscules sans espace', () => {
    const ids = THEMES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(/^[a-z][a-z0-9-]*$/));
  });
  it('repli sur le thème par défaut si id inconnu', () => {
    expect(themeParId('inconnu').id).toBe(THEME_PAR_DEFAUT);
    expect(themeParId(undefined).id).toBe(THEME_PAR_DEFAUT);
  });
  it('le thème par défaut existe', () => {
    expect(THEMES.some((t) => t.id === THEME_PAR_DEFAUT)).toBe(true);
  });
});

describe.each(THEMES.map((t) => [t.id, t] as const))('thème %s', (_id, t) => {
  it('champs complets', () => {
    expect(t.nom.length).toBeGreaterThan(0);
    expect(t.description.length).toBeGreaterThan(0);
    expect(t.polices.titre.length).toBeGreaterThan(0);
    expect(t.polices.texte.length).toBeGreaterThan(0);
    expect(t.forme.rayon).toBeGreaterThanOrEqual(0);
    expect(t.forme.bord).toBeGreaterThanOrEqual(0);
  });
  it('au moins 6 couleurs de domaine', () => {
    expect(t.couleursDomaines.length).toBeGreaterThanOrEqual(6);
  });
  it.each(PAIRES)('contraste %s / %s ≥ 4,5', (a, b) => {
    const c = t.couleurs as unknown as Record<string, string>;
    expect(contraste(c[a], c[b])).toBeGreaterThanOrEqual(4.5);
  });
  it('couleurs de domaine visibles sur le fond (≥ 3)', () => {
    t.couleursDomaines.forEach((d) => expect(contraste(d, t.couleurs.fond)).toBeGreaterThanOrEqual(3));
  });
});
