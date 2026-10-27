/**
 * Registre des thèmes. Un thème = un dossier src/themes/<id>/ :
 *  - index.ts  : l'objet Theme (couleurs, polices importées, formes) ;
 *  - theme.css : ses ornements, tous sous :root[data-theme="<id>"].
 * Pour l'ajouter : l'importer ici et le mettre dans THEMES. themes.test.ts le vérifie (champs, contrastes).
 */
import type { Theme } from './types';
import { neon } from './neon';
import { survie } from './survie';
import { bdpop } from './bdpop';
import { THEME_PAR_DEFAUT } from './defaut';

export { THEME_PAR_DEFAUT };

/** Tous les thèmes de l'app, dans l'ordre d'affichage. */
export const THEMES: Theme[] = [neon, survie, bdpop];

/** Thème demandé, ou le thème par défaut si l'id est absent ou inconnu (ex. sauvegarde plus récente). */
export function themeParId(id: string | undefined): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES.find((t) => t.id === THEME_PAR_DEFAUT)!;
}
