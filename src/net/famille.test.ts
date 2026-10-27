import { describe, it, expect } from 'vitest';
import { decoderFamille, encoderFamille, genererFamille } from './famille';

const config = { projet: 'quiz-quest-famille', cle: 'AIzaSyD-exemple_cle_api_web_123456789', famille: 'Ab3dEf6hIj9kLm2nOp5qRs8t' };

describe('code famille', () => {
  it('secret de 24 caractères alphanumériques, différent à chaque fois', () => {
    const a = genererFamille();
    expect(a).toMatch(/^[A-Za-z0-9]{24}$/);
    expect(genererFamille()).not.toBe(a);
  });
  it('aller-retour pour le QR', () => {
    const code = encoderFamille(config);
    expect(code.startsWith('QQF1:')).toBe(true);
    expect(decoderFamille(` ${code}\n`)).toEqual(config);
  });
  it('rejette un code abîmé ou étranger', () => {
    expect(decoderFamille('Q2Oabc')).toBeNull();
    expect(decoderFamille('QQF1:projet.cle')).toBeNull();
    expect(decoderFamille('QQF1:Projet Majuscule.AIzaSyD-exemple_cle_api_web_123456789.Ab3dEf6hIj9kLm2nOp5qRs8t')).toBeNull();
  });
});
