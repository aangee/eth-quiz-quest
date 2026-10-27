/** Un point de la carte : x en % de la largeur, y en px depuis le haut. */
export interface Point { x: number; y: number }

const MARGE = 70;
const PAS = 130;
const COLONNES = [26, 74];

/** Positions des étapes (une par domaine), en zigzag sur deux colonnes, et hauteur de la carte. */
export function positionsCarte(n: number): { points: Point[]; hauteur: number } {
  const points = Array.from({ length: n }, (_, i) => ({ x: COLONNES[i % 2], y: MARGE + i * PAS }));
  return { points, hauteur: 2 * MARGE + Math.max(0, n - 1) * PAS };
}

/** Tracé SVG lisse passant par les points (courbes avec points de contrôle à mi-hauteur). */
export function cheminLisse(points: Point[]): string {
  if (!points.length) return '';
  let d = `M${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const my = (a.y + b.y) / 2;
    d += ` C${a.x} ${my} ${b.x} ${my} ${b.x} ${b.y}`;
  }
  return d;
}
