import type { Profil } from '../types';
import { MINI_JEUX, type MiniJeu } from '../jeu/arbre';
import { JEUX_DISPONIBLES, cleRecord } from '../jeu/minijeux';

export function EcranMiniJeux({ profil, onJouer, onRetour }: {
  profil: Profil; onJouer: (jeu: MiniJeu) => void; onRetour: () => void;
}) {
  const jeux = Object.keys(MINI_JEUX) as MiniJeu[];
  return (
    <main class="ecran">
      <h2>🕹️ Mini-jeux</h2>
      <div class="liste">
        {jeux.map((j) => {
          const debloque = profil.debloques.includes(`mj:${j}`);
          const dispo = JEUX_DISPONIBLES.includes(j);
          const record = profil.records[cleRecord(j)];
          return (
            <div key={j} class={`noeud ${debloque && dispo ? 'debloque' : 'verrouille'}`}>
              <span>{MINI_JEUX[j].nom}</span>
              {record !== undefined && <small>🏆 {record}</small>}
              {!debloque ? <small>🔒 à débloquer dans l'arbre</small>
                : !dispo ? <small>bientôt</small>
                : <button onClick={() => onJouer(j)}>Jouer ▶</button>}
            </div>
          );
        })}
      </div>
      <button onClick={onRetour}>← Retour</button>
    </main>
  );
}
