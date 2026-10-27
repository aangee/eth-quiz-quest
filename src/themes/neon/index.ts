import '@fontsource/orbitron/latin-600.css';
import '@fontsource/orbitron/latin-800.css';
import '@fontsource/exo-2/latin-500.css';
import '@fontsource/exo-2/latin-700.css';
import './theme.css';
import type { Theme } from '../types';
import { DecorCarte } from './DecorCarte';

export const neon: Theme = {
  id: 'neon',
  nom: 'Néon arcade',
  description: 'Nuit violette, lueurs cyan et magenta, grille rétro.',
  clair: false,
  couleurs: {
    fond: '#0b0720', surface: '#160f33', surfaceForte: '#2a2056', bord: '#3a2d75',
    texte: '#f2f0ff', texteDoux: '#c9c3ec',
    accent: '#22e4ff', surAccent: '#0b0720',
    ok: '#3ee08f', surOk: '#0b0720', ko: '#ff5577', surKo: '#0b0720',
    lien: '#ffe14d',
  },
  couleursDomaines: ['#22e4ff', '#7dff6a', '#ffe14d', '#ff8a3d', '#ff3dbb', '#b98cff'],
  polices: { titre: "'Orbitron', sans-serif", texte: "'Exo 2', system-ui, sans-serif" },
  forme: { rayon: 14, bord: 2, ombre: '0 0 14px rgba(34, 228, 255, 0.35)' },
  textes: { titreCarte: 'NEON CITY', titreJoueur: 'Pilote néon', bravo: 'Bien joué !', suite: 'Suite', titreArbre: 'ARBRE', reserve: 'à dépenser' },
  DecorCarte,
};
