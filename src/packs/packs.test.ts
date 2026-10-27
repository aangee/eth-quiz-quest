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
