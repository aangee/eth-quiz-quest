/** Cercle en tracé SVG (une seule forme de donnée : des chemins). */
const cercle = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
/** Rectangle arrondi en tracé SVG. */
const rect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}` +
  `h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`;

/** Icônes au trait, grille 24×24. Chaque icône = une liste de tracés. */
export const ICONES = {
  // navigation
  carte: ['M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z', 'M9 4v14M15 6v14'],
  jeux: [rect(2, 7, 20, 10, 5), 'M7 10v4M5 12h4', cercle(16, 11, 1), cercle(18, 13, 1)],
  arbre: ['M12 22v-8M12 14l-5-4M12 14l5-4', cercle(12, 6, 3), cercle(6, 9, 2), cercle(18, 9, 2)],
  trophee: ['M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z', 'M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3'],
  profil: [cercle(12, 8, 4), 'M4 21a8 8 0 0 1 16 0'],
  // actions et états
  etoile: ['M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z'],
  eclair: ['M13 2 4 14h7l-1 8 9-12h-7z'],
  chrono: [cercle(12, 13, 8), 'M12 9v4M10 2h4'],
  horloge: [cercle(12, 12, 9), 'M12 7v5l3 2'],
  cadenas: [rect(5, 11, 14, 10, 2), 'M8 11V7a4 4 0 0 1 8 0v4'],
  quitter: ['M6 6l12 12M18 6 6 18'],
  valider: ['M5 12l5 5 9-10'],
  suivant: ['M9 5l7 7-7 7'],
  retour: ['M15 5l-7 7 7 7'],
  plus: ['M12 5v14M5 12h14'],
  musique: ['M9 18V5l12-2v13', cercle(6, 18, 3), cercle(18, 16, 3)],
  muet: ['M11 5 6 9H2v6h4l5 4z', 'M22 9l-6 6M16 9l6 6'],
  duel: ['M14.5 17.5 3 6V3h3l11.5 11.5', 'M13 19l6-6M16 16l4 4M19 21l2-2', 'M9.5 6.5 6 3', 'M3 21l6-6'],
  parametres: [cercle(12, 12, 3), 'M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1'],
  calendrier: [rect(3, 5, 18, 16, 2), 'M3 10h18M8 3v4M16 3v4'],
  quete: ['M5 21V4h11l-2 4 2 4H5'],
  sauvegarde: ['M12 3v12M7 10l5 5 5-5', 'M5 21h14'],
  envoyer: ['M12 21V9M7 14l5-5 5 5', 'M5 3h14'],
  supprimer: ['M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3'],
  modifier: ['M4 20h4L19 9l-4-4L4 16z', 'M13 7l4 4'],
  reseau: [cercle(12, 19, 1), 'M8.5 15.5a5 5 0 0 1 7 0M5 12a10 10 0 0 1 14 0M2 8.5a15 15 0 0 1 20 0'],
  qr: [rect(3, 3, 7, 7, 1), rect(14, 3, 7, 7, 1), rect(3, 14, 7, 7, 1), 'M14 14h3v3h-3zM18 18h3v3h-3z'],
  telephone: [rect(7, 2, 10, 20, 2), 'M11 18h2'],
  ampoule: ['M9 18h6M10 21h4', 'M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z'],
  info: [cercle(12, 12, 9), 'M12 11v6M12 7.5v.5'],
  attention: ['M12 3 2 20h20z', 'M12 10v4M12 17v.5'],
  melanger: ['M3 7h4l10 10h4M3 17h4l3-3M14 10l3-3h4', 'M18 4l3 3-3 3M18 14l3 3-3 3'],
  // domaines
  espace: ['M12 2c3 2 5 6 5 10l-2 4H9l-2-4c0-4 2-8 5-10z', cercle(12, 10, 2), 'M9 16l-2 4M15 16l2 4'],
  animaux: [cercle(7, 9, 2), cercle(12, 6, 2), cercle(17, 9, 2), 'M12 12c-3 0-5 3-5 5s2 3 5 3 5-1 5-3-2-5-5-5z'],
  geographie: [cercle(12, 12, 9), 'M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18'],
  histoire: ['M4 21V8h3v3h3V8h4v3h3V8h3v13z', 'M10 21v-5h4v5'],
  sciences: ['M9 3h6M10 3v6l-5 10a1.5 1.5 0 0 0 1.3 2h11.4a1.5 1.5 0 0 0 1.3-2L14 9V3', 'M7.5 15h9'],
  livre: ['M4 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H4z', 'M20 4h-6M20 4v15h-6'],
} satisfies Record<string, string[]>;

export type NomIcone = keyof typeof ICONES;

/** Icônes proposées pour le champ `icone` des packs (lot 8b) ; `livre` = icône générique. */
export const ICONES_DOMAINE: NomIcone[] = ['espace', 'animaux', 'geographie', 'histoire', 'jeux', 'sciences', 'livre'];
