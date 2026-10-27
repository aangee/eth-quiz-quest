export const XP_BASE = 10;

export function xpGagne(niveau: number, tempsMs: number, limiteMs: number): number {
  const base = XP_BASE * niveau;
  return tempsMs <= limiteMs / 3 ? Math.round(base * 1.5) : base;
}

/** XP total nécessaire pour atteindre le niveau n (niveau 1 = 0 XP). */
export function seuil(n: number): number {
  return 50 * n * (n - 1);
}

export function niveauDepuisXp(xp: number): number {
  let n = 1;
  while (seuil(n + 1) <= xp) n++;
  return n;
}
