import { describe, it, expect } from 'vitest';
import { explicationSansReponse } from './explication';

describe('explicationSansReponse', () => {
  it('retire la réponse répétée au début', () => {
    expect(explicationSansReponse('Le Portugal', "Le Portugal : c'est pour cela qu'on y parle portugais."))
      .toBe("C'est pour cela qu'on y parle portugais.");
    expect(explicationSansReponse('1912', '1912 : le Titanic a heurté un iceberg.')).toBe('Le Titanic a heurté un iceberg.');
  });
  it('ignore majuscules, accents et ponctuation', () => {
    expect(explicationSansReponse('Faux', 'faux : la Lune renvoie la lumière du Soleil.')).toBe('La Lune renvoie la lumière du Soleil.');
    expect(explicationSansReponse('Moyen Âge', 'Moyen Age : de 476 à 1492.')).toBe('De 476 à 1492.');
  });
  it('laisse le reste intact', () => {
    expect(explicationSansReponse('Jupiter', 'La plus grosse planète : Jupiter.')).toBe('La plus grosse planète : Jupiter.');
    expect(explicationSansReponse('Paris', 'Capitale depuis longtemps.')).toBe('Capitale depuis longtemps.');
    expect(explicationSansReponse('Vrai', '')).toBe('');
  });
});
