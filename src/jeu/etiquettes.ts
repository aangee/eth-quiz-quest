export function scoreEtiquettes(zones: { label: string }[], placements: Record<number, string>): number {
  return zones.filter((z, i) => placements[i] === z.label).length;
}

export function etiquettesRestantes(labels: string[], placements: Record<number, string>): string[] {
  const posees = new Set(Object.values(placements));
  return labels.filter((l) => !posees.has(l));
}
