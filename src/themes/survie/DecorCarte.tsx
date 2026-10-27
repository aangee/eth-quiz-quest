import { cheminLisse } from '../../jeu/carte';
import type { DecorCarteProps } from '../types';

/** Survie : une île parchemin sur la mer, un sentier en tirets entre les camps. */
export function DecorCarte({ points, hauteur: h }: DecorCarteProps) {
  const ile = `M50 14 C80 8 97 ${h * 0.18} 92 ${h * 0.38} C99 ${h * 0.58} 97 ${h * 0.84} 72 ${h - 12}`
    + ` C46 ${h + 2} 14 ${h - 8} 7 ${h * 0.76} C0 ${h * 0.52} 9 ${h * 0.32} 4 ${h * 0.16} C6 10 30 16 50 14Z`;
  const herbe = `M50 34 C74 30 88 ${h * 0.22} 84 ${h * 0.4} C90 ${h * 0.6} 86 ${h * 0.8} 68 ${h - 34}`
    + ` C46 ${h - 22} 22 ${h - 30} 17 ${h * 0.74} C11 ${h * 0.52} 18 ${h * 0.34} 15 ${h * 0.2} C18 32 34 36 50 34Z`;
  return (
    <svg class="decor-carte" viewBox={`0 0 100 ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <rect x="0" y="0" width="100" height={h} fill="#4f7f8f" />
      <path d={ile} fill="#e9dcb8" stroke="#3b2a1a" stroke-width="4" vector-effect="non-scaling-stroke" />
      <path d={herbe} fill="#9cb86f" fill-opacity="0.5" />
      <path d={cheminLisse(points)} fill="none" stroke="#3b2a1a" stroke-width="3" stroke-dasharray="8 8" stroke-linecap="round"
        vector-effect="non-scaling-stroke" />
    </svg>
  );
}
