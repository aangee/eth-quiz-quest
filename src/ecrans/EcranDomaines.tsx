import { useState } from 'preact/hooks';
import type { Profil } from '../types';
import { domaines } from '../packs';

export function EcranDomaines({ profil, onJouer, onRetour }: {
  profil: Profil; onJouer: (d: string[]) => void; onRetour: () => void;
}) {
  const [choisis, setChoisis] = useState<string[]>(domaines);
  const basculer = (d: string) => setChoisis((c) => (c.includes(d) ? c.filter((x) => x !== d) : [...c, d]));

  return (
    <main class="ecran">
      <h2>{profil.avatar} {profil.prenom}, choisis tes domaines</h2>
      <div class="liste">
        {domaines.map((d) => (
          <label key={d} class="carte">
            <input type="checkbox" checked={choisis.includes(d)} onChange={() => basculer(d)} /> {d}
            <small>{profil.xpDomaine[d] ?? 0} XP</small>
          </label>
        ))}
      </div>
      <button class="principal" disabled={!choisis.length} onClick={() => onJouer(choisis)}>Jouer ▶</button>
      <button onClick={onRetour}>← Retour</button>
    </main>
  );
}
