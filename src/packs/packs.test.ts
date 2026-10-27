import { readdirSync, readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { validerPack } from './valider';

const dossier = new URL('../../packs/', import.meta.url);
const fichiers = readdirSync(dossier).filter((f) => f.endsWith('.json'));

describe('packs livrés', () => {
  it('au moins un pack', () => expect(fichiers.length).toBeGreaterThan(0));
  for (const f of fichiers) {
    it(f, () => {
      const r = validerPack(JSON.parse(readFileSync(new URL(f, dossier), 'utf8')));
      expect(r.erreurPack).toBeUndefined();
      expect(r.erreurs).toEqual([]);
    });
  }
});

describe('iconeDuDomaine', () => {
  const p = (domaine: string, icone?: string) => ({ pack: domaine, domaine, version: 1, questions: [], ...(icone ? { icone } : {}) });
  it('icône connue, inconnue, absente', async () => {
    const { iconeDuDomaine } = await import('./index');
    const liste = [p('A', 'espace'), p('B', 'licorne'), p('C')];
    expect(iconeDuDomaine('A', liste)).toBe('espace');
    expect(iconeDuDomaine('B', liste)).toBe('livre');
    expect(iconeDuDomaine('C', liste)).toBe('livre');
  });
  it('les packs livrés ont une icône connue', async () => {
    const { iconeDuDomaine, domaines } = await import('./index');
    domaines.forEach((d) => expect(iconeDuDomaine(d)).not.toBe('livre'));
  });
});
