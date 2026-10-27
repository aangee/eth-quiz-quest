import { melanger } from './melange';

export interface Carte { id: number; texte: string; paire: number }

export function creerCartes(paires: [string, string][], alea: () => number = Math.random): Carte[] {
  return melanger(
    paires.flatMap(([a, b], i) => [{ id: 2 * i, texte: a, paire: i }, { id: 2 * i + 1, texte: b, paire: i }]),
    alea,
  );
}

export function estPaire(a: Carte, b: Carte): boolean {
  return a.paire === b.paire && a.id !== b.id;
}
