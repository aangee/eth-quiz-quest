import type { Profil } from '../types';
import { debloquer, etatNoeud, etoilesDispo, type Noeud } from '../jeu/arbre';
import { JEUX_DISPONIBLES } from '../jeu/minijeux';
import { useState } from 'preact/hooks';
import { Icone } from '../ui/Icone';

export function EcranArbre({ profil, arbre, onMaj }: {
  profil: Profil; arbre: Noeud[]; onMaj: (p: Profil) => void;
}) {
  const [dernier, setDernier] = useState<string | null>(null);
  const dispo = etoilesDispo(profil, arbre);
  const branches = [...new Set(arbre.map((n) => n.branche))];
  const nom = (id: string) => arbre.find((n) => n.id === id)?.nom ?? id;
  return (
    <main class="ecran">
      <h2><Icone nom="arbre" /> Arbre · <Icone nom="etoile" pleine /> {dispo}</h2>
      {branches.map((b) => (
        <section key={b}>
          <h3>{b}</h3>
          <div class="liste">
            {arbre.filter((n) => n.branche === b).map((n) => {
              const etat = etatNoeud(profil, n, dispo);
              return (
                <div key={n.id} class={`noeud ${etat}${n.id === dernier ? ' nouveau' : ''}`}>
                  <span>{etat === 'debloque' ? <Icone nom="valider" /> : etat === 'verrouille' ? <Icone nom="cadenas" />
                    : Array.from({ length: n.cout }, (_, k) => <Icone key={k} nom="etoile" pleine />)} {n.nom}</span>
                  {etat === 'debloque' && n.recompense.type !== 'joker' && !JEUX_DISPONIBLES.includes(n.recompense.jeu) && <small>bientôt jouable</small>}
                  {etat === 'verrouille' && (
                    <small>après : {n.prerequis.filter((id) => !profil.debloques.includes(id)).map(nom).join(', ')}</small>
                  )}
                  {(etat === 'disponible' || etat === 'trop_cher') && (
                    <button disabled={etat === 'trop_cher'} onClick={() => { setDernier(n.id); onMaj(debloquer(profil, n, arbre)); }}>
                      Débloquer ({n.cout} <Icone nom="etoile" pleine />)
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}
