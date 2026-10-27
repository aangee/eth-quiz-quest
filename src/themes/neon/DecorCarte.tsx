import { cheminLisse } from '../../jeu/carte';
import type { DecorCarteProps } from '../types';

/** Néon : route en pointillés cyan lumineux entre les quartiers. */
export function DecorCarte({ points, hauteur }: DecorCarteProps) {
  const d = cheminLisse(points);
  return (
    <svg class="decor-carte" viewBox={`0 0 100 ${hauteur}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="none" stroke="#22e4ff" stroke-opacity="0.25" stroke-width="10" vector-effect="non-scaling-stroke" />
      <path d={d} fill="none" stroke="#22e4ff" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round"
        vector-effect="non-scaling-stroke" style={{ filter: 'drop-shadow(0 0 4px #22e4ff)' }} />
    </svg>
  );
}
