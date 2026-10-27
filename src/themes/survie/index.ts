import '@fontsource/black-ops-one/latin-400.css';
import '@fontsource/nunito/latin-600.css';
import '@fontsource/nunito/latin-800.css';
import './theme.css';
import type { Theme } from '../types';
import { DecorCarte } from './DecorCarte';

export const survie: Theme = {
  id: 'survie',
  nom: 'Aventure survie',
  description: 'Bois, feu de camp et carte au trésor sur une île à explorer.',
  clair: false,
  couleurs: {
    fond: '#2b2118', surface: '#3b2a1a', surfaceForte: '#5a3d24', bord: '#6b4a2b',
    texte: '#f3e7c9', texteDoux: '#d8c9a5',
    accent: '#f08a24', surAccent: '#2b2118',
    ok: '#6fbf4f', surOk: '#1a140e', ko: '#e5533d', surKo: '#1a140e',
    lien: '#f5c04a',
  },
  couleursDomaines: ['#8fd16a', '#f08a24', '#5fb3d9', '#e8c15a', '#e5735a', '#c79bd9'],
  polices: { titre: "'Black Ops One', sans-serif", texte: "'Nunito', system-ui, sans-serif" },
  forme: { rayon: 10, bord: 3, ombre: '0 4px 0 #1a140e' },
  textes: { titreCarte: "L'ÎLE DU SAVOIR", titreJoueur: 'Éclaireur', bravo: 'Bien vu, éclaireur !', suite: 'En avant', titreArbre: "L'ARBRE DE L'ÉCLAIREUR", reserve: 'étoiles dans ton sac' },
  DecorCarte,
};
