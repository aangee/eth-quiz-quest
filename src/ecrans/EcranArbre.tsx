import type { Profil } from '../types';
import { debloquer, etatNoeud, etoilesDispo, type Noeud } from '../jeu/arbre';
import { JEUX_DISPONIBLES } from '../jeu/minijeux';

export function EcranArbre({ profil, arbre, onMaj, onRetour }: {
  profil: Profil; arbre: Noeud[]; onMaj: (p: Profil) => void; onRetour: () => void;
}) {
  const dispo = etoilesDispo(profil, arbre);
  const branches = [...new Set(arbre.map((n) => n.branche))];
  const nom = (id: string) => arbre.find((n) => n.id === id)?.nom ?? id;
  return (
    <main class="ecran">
      <h2>🌳 Arbre · ⭐ {dispo}</h2>
      {branches.map((b) => (
        <section key={b}>
          <h3>{b}</h3>
          <div class="liste">
            {arbre.filter((n) => n.branche === b).map((n) => {
              const etat = etatNoeud(profil, n, dispo);
              return (
                <div key={n.id} class={`noeud ${etat}`}>
                  <span>{etat === 'debloque' ? '✅' : etat === 'verrouille' ? '🔒' : '⭐'.repeat(n.cout)} {n.nom}</span>
                  {etat === 'debloque' && n.recompense.type !== 'joker' && !JEUX_DISPONIBLES.includes(n.recompense.jeu) && <small>bientôt jouable</small>}
                  {etat === 'verrouille' && (
                    <small>après : {n.prerequis.filter((id) => !profil.debloques.includes(id)).map(nom).join(', ')}</small>
                  )}
                  {(etat === 'disponible' || etat === 'trop_cher') && (
                    <button disabled={etat === 'trop_cher'} onClick={() => onMaj(debloquer(profil, n, arbre))}>
                      Débloquer ({n.cout} ⭐)
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
      <button onClick={onRetour}>← Retour</button>
    </main>
  );
}
