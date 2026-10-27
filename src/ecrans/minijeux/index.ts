import type { ComponentType } from 'preact';
import type { MiniJeu } from '../../jeu/arbre';
import type { PropsJeu } from '../../jeu/minijeux';
import { ChronoEclair } from './ChronoEclair';
import { CalculEclair } from './CalculEclair';
import { Memory } from './Memory';
import { MotMystere } from './MotMystere';
import { Frise } from './Frise';
import { QuiSuisJe } from './QuiSuisJe';
import { Etiquettes } from './Etiquettes';

/** Composant de chaque mini-jeu jouable (doit suivre JEUX_DISPONIBLES). */
export const JEUX: Partial<Record<MiniJeu, ComponentType<PropsJeu>>> = {
  chrono: ChronoEclair,
  calcul: CalculEclair,
  memory: Memory,
  mot: MotMystere,
  frise: Frise,
  qui: QuiSuisJe,
  etiquettes: Etiquettes,
};
