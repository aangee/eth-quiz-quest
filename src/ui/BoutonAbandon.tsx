import { useState } from 'preact/hooks';
import { Fiche } from './Fiche';
import { Icone } from './Icone';

/** En haut à gauche pendant une partie (loin des boutons de réponse) ; demande confirmation. Rien n'est gardé. */
export function BoutonAbandon({ onAbandon }: { onAbandon: () => void }) {
  const [confirmer, setConfirmer] = useState(false);
  return (
    <>
      <button class="bouton-abandon" onClick={() => setConfirmer(true)}><Icone nom="quitter" /> Abandonner</button>
      {confirmer && (
        <Fiche titre="Abandonner la partie ?" onFermer={() => setConfirmer(false)}>
          <p>Ce que tu as gagné pendant cette partie ne sera pas gardé.</p>
          <button class="principal" onClick={() => setConfirmer(false)}>Continuer la partie</button>
          <button onClick={onAbandon}><Icone nom="quitter" /> Abandonner</button>
        </Fiche>
      )}
    </>
  );
}
