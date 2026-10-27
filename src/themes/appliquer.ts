import type { Theme } from './types';

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());

/** Variables CSS d'un thème (pure, testée). */
export function variablesCss(t: Theme): Record<string, string> {
  const v: Record<string, string> = {};
  for (const [cle, val] of Object.entries(t.couleurs)) v[`--c-${kebab(cle)}`] = val;
  t.couleursDomaines.forEach((c, i) => { v[`--c-domaine-${i}`] = c; });
  v['--police-titre'] = t.polices.titre;
  v['--police-texte'] = t.polices.texte;
  v['--rayon'] = `${t.forme.rayon}px`;
  v['--bord'] = `${t.forme.bord}px`;
  v['--ombre'] = t.forme.ombre;
  return v;
}

/** Pose le thème sur <html> : data-theme, variables, couleur de la barre du navigateur. */
export function appliquerTheme(t: Theme, racine: HTMLElement = document.documentElement): void {
  racine.dataset.theme = t.id;
  racine.style.colorScheme = t.clair ? 'light' : 'dark';
  for (const [nom, val] of Object.entries(variablesCss(t))) racine.style.setProperty(nom, val);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.couleurs.fond);
}
