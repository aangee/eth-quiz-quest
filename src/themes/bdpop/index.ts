import '@fontsource/bangers/latin-400.css';
import '@fontsource/fredoka/latin-500.css';
import '@fontsource/fredoka/latin-600.css';
import '@fontsource/fredoka/latin-700.css';
import './theme.css';
import type { Theme } from '../types';
import { DecorCarte } from './DecorCarte';

export const bdpop: Theme = {
  id: 'bdpop',
  nom: 'BD Pop',
  description: 'Clair et coloré comme une bande dessinée, avec un grand parcours.',
  clair: true,
  couleurs: {
    fond: '#fff6d6', surface: '#ffffff', surfaceForte: '#ffe9a8', bord: '#1a1a2e',
    texte: '#1a1a2e', texteDoux: '#4a4a63',
    accent: '#ff4d4d', surAccent: '#1a1a2e',
    ok: '#2ec27e', surOk: '#1a1a2e', ko: '#ff6b6b', surKo: '#1a1a2e',
    lien: '#1f5fd1',
  },
  // Assez foncées pour rester visibles sur le crème
  couleursDomaines: ['#1f7ae0', '#1a9e5c', '#c77700', '#e0442f', '#c2378a', '#7b4fd6'],
  polices: { titre: "'Bangers', sans-serif", texte: "'Fredoka', system-ui, sans-serif" },
  forme: { rayon: 16, bord: 3, ombre: '4px 4px 0 #1a1a2e' },
  textes: { titreCarte: 'LE GRAND PARCOURS !', titreJoueur: 'Super-curieux', bravo: 'BOUM ! Bien joué !', suite: 'Suite !', titreArbre: 'MES POUVOIRS !', reserve: 'étoiles à dépenser' },
  DecorCarte,
};
