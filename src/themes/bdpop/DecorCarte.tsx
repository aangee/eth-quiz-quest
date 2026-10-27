import { cheminLisse } from '../../jeu/carte';
import type { DecorCarteProps } from '../types';

/** BD Pop : une route de jeu de plateau (contour encre, chaussée blanche, tirets jaunes). */
export function DecorCarte({ points, hauteur }: DecorCarteProps) {
  const d = cheminLisse(points);
  const trait = { fill: 'none', 'stroke-linecap': 'round', 'vector-effect': 'non-scaling-stroke' } as const;
  return (
    <svg class="decor-carte" viewBox={`0 0 100 ${hauteur}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={d} {...trait} stroke="#1a1a2e" stroke-width="30" />
      <path d={d} {...trait} stroke="#ffffff" stroke-width="22" />
      <path d={d} {...trait} stroke="#ffd23f" stroke-width="4" stroke-dasharray="10 12" />
    </svg>
  );
}
