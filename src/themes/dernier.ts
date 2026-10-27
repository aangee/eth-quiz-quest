/** Dernier thème affiché sur cet appareil (pour l'écran de choix des profils). Confort seulement. */
export function lireDernierTheme(): string | undefined {
  try { return localStorage.getItem('theme') ?? undefined; } catch { return undefined; }
}

export function memoriserTheme(id: string): void {
  try { localStorage.setItem('theme', id); } catch { /* stockage indisponible : sans conséquence */ }
}
