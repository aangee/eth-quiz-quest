import { describe, it, expect } from 'vitest';
import { lireMessage } from './protocole';

describe('protocole', () => {
  it('lit les messages valides', () => {
    expect(lireMessage('{"t":"bonjour","prenom":"Léo","avatar":"🦊"}')).toEqual({ t: 'bonjour', prenom: 'Léo', avatar: '🦊' });
    expect(lireMessage('{"t":"debut"}')).toEqual({ t: 'debut' });
    expect(lireMessage('{"t":"reponse","manche":3,"points":125,"juste":true}')).toEqual({ t: 'reponse', manche: 3, points: 125, juste: true });
  });
  it('rejette ce qui n’est pas un message', () => {
    expect(lireMessage('pas du json')).toBeNull();
    expect(lireMessage('{"t":"pirate"}')).toBeNull();
    expect(lireMessage('{"t":"bonjour","prenom":3,"avatar":"x"}')).toBeNull();
  });
  it('rejette des points impossibles', () => {
    expect(lireMessage('{"t":"reponse","manche":0,"points":9999,"juste":true}')).toBeNull();
    expect(lireMessage('{"t":"reponse","manche":-1,"points":100,"juste":true}')).toBeNull();
  });
});
