/** Temps restant : rétrécit, passe à l'orange sous 30 %. */
export function BarreTemps({ reste, total }: { reste: number; total: number }) {
  const pct = Math.max(0, Math.min(100, (100 * reste) / total));
  return <div class={`barre-temps ${pct < 30 ? 'urgent' : ''}`} aria-hidden="true"><div style={{ width: `${pct}%` }} /></div>;
}
