import { describe, it, expect } from 'vitest';
import { ajouterPackImporte, fusionnerPacks } from './fusion';
import type { Pack, Question, VraiFaux } from '../types';

const q = (id: string, question = 'Q'): Question => ({ id, type: 'vrai_faux', niveau: 1, age_min: 6, question, reponse: true, explication: '' });
const pack = (nom: string, version: number, ...qs: Question[]): Pack => ({ pack: nom, domaine: 'D', version, questions: qs });

describe('fusion des packs', () => {
  it('garde toutes les questions d’ids différents', () => {
    expect(fusionnerPacks([pack('a', 1, q('1')), pack('b', 1, q('2'))]).flatMap((p) => p.questions.map((x) => x.id))).toEqual(['1', '2']);
  });
  it('ignore un id déjà présent venant d’une version égale ou inférieure', () => {
    const r = fusionnerPacks([pack('a', 2, q('1', 'premier')), pack('b', 1, q('1', 'autre'))]);
    expect(r).toHaveLength(1);
    expect((r[0].questions[0] as VraiFaux).question).toBe('premier');
  });
  it('une version supérieure remplace la question', () => {
    const r = fusionnerPacks([pack('a', 1, q('1', 'v1'), q('2')), pack('b', 2, q('1', 'v2'))]);
    expect(r.find((p) => p.pack === 'a')!.questions.map((x) => x.id)).toEqual(['2']);
    expect((r.find((p) => p.pack === 'b')!.questions[0] as VraiFaux).question).toBe('v2');
  });
  it('réimporter un pack du même nom remplace l’ancien', () => {
    const l = ajouterPackImporte([pack('a', 1, q('1'))], pack('a', 2, q('1'), q('2')));
    expect(l).toHaveLength(1);
    expect(l[0].version).toBe(2);
  });
});
