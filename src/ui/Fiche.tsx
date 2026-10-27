import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { Icone } from './Icone';

/** Fiche qui monte du bas de l'écran (fenêtre modale) : voile, croix et Échap ferment ; le focus revient au déclencheur. */
export function Fiche({ titre, onFermer, children }: { titre: string; onFermer: () => void; children: ComponentChildren }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const avant = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const touche = (e: KeyboardEvent) => { if (e.key === 'Escape') onFermer(); };
    window.addEventListener('keydown', touche);
    return () => { window.removeEventListener('keydown', touche); avant?.focus?.(); };
  }, []);
  return (
    <>
      <div class="voile" onClick={onFermer} />
      <div class="fiche" role="dialog" aria-modal="true" aria-labelledby="fiche-titre" tabIndex={-1} ref={ref}>
        <button class="fermer-fiche" aria-label="Fermer" onClick={onFermer}><Icone nom="quitter" /></button>
        <h2 id="fiche-titre">{titre}</h2>
        {children}
      </div>
    </>
  );
}
