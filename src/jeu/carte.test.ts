import { describe, it, expect } from 'vitest';
import { cheminLisse, positionsCarte } from './carte';

describe('positionsCarte', () => {
  it('zigzag sur deux colonnes, pas régulier', () => {
    const { points, hauteur } = positionsCarte(3);
    expect(points).toEqual([{ x: 26, y: 70 }, { x: 74, y: 200 }, { x: 26, y: 330 }]);
    expect(hauteur).toBe(400);
  });
  it('aucun domaine', () => {
    expect(positionsCarte(0)).toEqual({ points: [], hauteur: 140 });
  });
});

describe('cheminLisse', () => {
  it('vide sans point, M seul avec un point', () => {
    expect(cheminLisse([])).toBe('');
    expect(cheminLisse([{ x: 26, y: 70 }])).toBe('M26 70');
  });
  it('une courbe par segment, contrôles à mi-hauteur', () => {
    expect(cheminLisse([{ x: 26, y: 70 }, { x: 74, y: 200 }])).toBe('M26 70 C26 135 74 135 74 200');
  });
});
