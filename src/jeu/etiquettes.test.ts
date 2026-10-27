import { describe, it, expect } from 'vitest';
import { etiquettesRestantes, scoreEtiquettes } from './etiquettes';

const zones = [{ label: 'Tête' }, { label: 'Thorax' }, { label: 'Aile' }];

describe('étiquettes', () => {
  it('compte les étiquettes bien placées', () => {
    expect(scoreEtiquettes(zones, { 0: 'Tête', 1: 'Aile', 2: 'Thorax' })).toBe(1);
    expect(scoreEtiquettes(zones, { 0: 'Tête', 1: 'Thorax', 2: 'Aile' })).toBe(3);
  });
  it('liste les étiquettes encore à poser', () => {
    expect(etiquettesRestantes(['Aile', 'Tête', 'Thorax'], { 0: 'Tête' })).toEqual(['Aile', 'Thorax']);
  });
});
