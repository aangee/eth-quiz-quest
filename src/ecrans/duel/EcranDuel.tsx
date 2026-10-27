import { useState } from 'preact/hooks';
import type { Profil } from '../../types';
import { DuelLocal } from './DuelLocal';
import { DuelReseau } from './DuelReseau';
import { Icone } from '../../ui/Icone';

export function EcranDuel({ joueur, profils, onFin, onQuitter }: {
  joueur: Profil; profils: Profil[]; onFin: (majs: Profil[], justes: number) => void; onQuitter: () => void;
}) {
  const [mode, setMode] = useState<'choix' | 'local' | 'reseau'>('choix');
  if (mode === 'local') return <DuelLocal joueur={joueur} profils={profils} onFin={onFin} onQuitter={onQuitter} />;
  if (mode === 'reseau') return <DuelReseau joueur={joueur} onFin={onFin} onQuitter={onQuitter} />;
  return (
    <main class="ecran">
      <h2><Icone nom="duel" /> Duel</h2>
      <p class="domaine">Chacun reçoit des questions à son niveau : tout le monde peut gagner.</p>
      <button class="principal" onClick={() => setMode('local')}><Icone nom="telephone" /> Sur cet appareil</button>
      <button onClick={() => setMode('reseau')}><Icone nom="reseau" /> En réseau (2 appareils)</button>
      <button onClick={onQuitter}><Icone nom="retour" /> Retour</button>
    </main>
  );
}
