import { ONGLETS, type IdOnglet } from '../jeu/navigation';
import { Icone } from './Icone';

/** Barre de navigation du bas (onglets seulement, jamais pendant une partie). */
export function BarreNav({ actif, onAller }: { actif: IdOnglet; onAller: (o: IdOnglet) => void }) {
  return (
    <nav class="barre-nav" aria-label="Navigation">
      {ONGLETS.map((o) => (
        <button key={o.id} class={o.id === actif ? 'onglet actif' : 'onglet'} aria-current={o.id === actif ? 'page' : undefined}
          onClick={() => onAller(o.id)}>
          <Icone nom={o.icone} taille={26} />
          <span>{o.nom}</span>
        </button>
      ))}
    </nav>
  );
}
