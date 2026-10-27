import { describe, it, expect } from 'vitest';
import { variablesCss } from './appliquer';
import { neon } from './neon';

describe('variablesCss', () => {
  const v = variablesCss(neon);
  it('une variable par couleur, en kebab-case', () => {
    expect(v['--c-fond']).toBe('#0b0720');
    expect(v['--c-surface-forte']).toBe('#2a2056');
    expect(v['--c-texte-doux']).toBe('#c9c3ec');
  });
  it('couleurs de domaine numérotées', () => {
    expect(v['--c-domaine-0']).toBe('#22e4ff');
    expect(v['--c-domaine-5']).toBe('#b98cff');
  });
  it('polices et forme', () => {
    expect(v['--police-titre']).toContain('Orbitron');
    expect(v['--rayon']).toBe('14px');
    expect(v['--bord']).toBe('2px');
    expect(v['--ombre']).toBe(neon.forme.ombre);
  });
});
