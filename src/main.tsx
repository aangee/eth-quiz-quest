import { render } from 'preact';
import { App } from './App';
import './style.css';
import { appliquerTheme } from './themes/appliquer';
import { themeParId } from './themes/registre';
import { lireDernierTheme } from './themes/dernier';

// Thème du dernier joueur avant le premier affichage (pas de flash de l'ancien style)
appliquerTheme(themeParId(lireDernierTheme()));
render(<App />, document.getElementById('app')!);
