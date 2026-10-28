import type { ComponentChildren } from 'preact';
import { Icone } from './Icone';

/** En-tête collé en haut de l'écran : le bouton retour reste toujours à portée, même en bas d'une longue page. */
export function EnteteRetour({ libelle = 'Retour', onRetour, children }: { libelle?: string; onRetour: () => void; children: ComponentChildren }) {
  return (
    <header class="entete-retour">
      <button onClick={onRetour}><Icone nom="retour" /> {libelle}</button>
      <h2>{children}</h2>
    </header>
  );
}
