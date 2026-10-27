import { describe, it, expect } from 'vitest';
import { genererCalcul, niveauCalcul, niveauCalculDepart } from './calcul';

const evaluer = (texte: string): number =>
  Function(`return ${texte.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')}`)() as number;

describe('calcul éclair', () => {
  it('niveau de départ selon l’âge', () => {
    expect(niveauCalculDepart(8)).toBe(1);
    expect(niveauCalculDepart(10)).toBe(2);
    expect(niveauCalculDepart(37)).toBe(4);
  });
  it('plus dur toutes les 5 bonnes réponses, plafonné à 5', () => {
    expect(niveauCalcul(2, 4)).toBe(2);
    expect(niveauCalcul(2, 9)).toBe(3);
    expect(niveauCalcul(4, 30)).toBe(5);
  });
  it('chaque calcul généré est juste, entier et positif', () => {
    for (let niveau = 1; niveau <= 5; niveau++) {
      for (let i = 0; i < 200; i++) {
        const c = genererCalcul(niveau);
        expect(Number.isInteger(c.reponse)).toBe(true);
        expect(c.reponse).toBeGreaterThanOrEqual(0);
        expect(evaluer(c.texte)).toBe(c.reponse);
      }
    }
  });
});
