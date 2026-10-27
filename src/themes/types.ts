/** Jetons de couleur sémantiques. Chaque clé devient la variable CSS --c-<clé> (en kebab-case). */
export interface CouleursTheme {
  fond: string; surface: string; surfaceForte: string; bord: string;
  texte: string; texteDoux: string;
  accent: string; surAccent: string;
  ok: string; surOk: string; ko: string; surKo: string;
  lien: string;
}

/** Un thème visuel. Ajouter un thème = un dossier src/themes/<id>/ + une ligne dans registre.ts. */
export interface Theme {
  id: string;
  nom: string;
  description: string;
  clair: boolean;
  couleurs: CouleursTheme;
  /** ≥ 6 couleurs, attribuées aux domaines dans l'ordre (et aux confettis). */
  couleursDomaines: string[];
  /** Familles CSS (la police doit être importée par le thème). */
  polices: { titre: string; texte: string };
  /** rayon et bord en px ; ombre = valeur CSS box-shadow des cartes et boutons principaux. */
  forme: { rayon: number; bord: number; ombre: string };
}
