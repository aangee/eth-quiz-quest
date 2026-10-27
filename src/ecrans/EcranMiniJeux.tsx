import type { Profil } from '../types';
import { MINI_JEUX, type MiniJeu } from '../jeu/arbre';
import { JEUX_DISPONIBLES, cleRecord } from '../jeu/minijeux';
import { Icone } from '../ui/Icone';

/** Défis débloqués : nœuds « defi:<jeu>:<domaine> ». */
function defisDebloques(p: Profil): { jeu: MiniJeu; domaine: string }[] {
  return p.debloques
    .filter((id) => id.startsWith('defi:'))
    .map((id) => {
      const [, jeu, ...reste] = id.split(':');
      return { jeu: jeu as MiniJeu, domaine: reste.join(':') };
    })
    .filter((d) => JEUX_DISPONIBLES.includes(d.jeu));
}

export function EcranMiniJeux({ profil, onJouer, onDefi, onDuel }: {
  profil: Profil; onJouer: (jeu: MiniJeu) => void; onDefi: (jeu: MiniJeu, domaine: string) => void; onDuel: () => void;
}) {
  const jeux = Object.keys(MINI_JEUX) as MiniJeu[];
  const defis = defisDebloques(profil);
  return (
    <main class="ecran">
      <h2><Icone nom="jeux" /> Jeux</h2>
      <button class="principal" onClick={onDuel}><Icone nom="duel" /> Duel</button>
      <div class="liste">
        {jeux.map((j) => {
          const debloque = profil.debloques.includes(`mj:${j}`);
          const dispo = JEUX_DISPONIBLES.includes(j);
          const record = profil.records[cleRecord(j)];
          return (
            <div key={j} class={`noeud ${debloque && dispo ? 'debloque' : 'verrouille'}`}>
              <span>{MINI_JEUX[j].nom}</span>
              {record !== undefined && <small><Icone nom="trophee" /> {record}</small>}
              {!debloque ? <small><Icone nom="cadenas" /> à débloquer dans l'arbre</small>
                : !dispo ? <small>bientôt</small>
                : <button onClick={() => onJouer(j)}>Jouer <Icone nom="suivant" /></button>}
            </div>
          );
        })}
      </div>
      {defis.length > 0 && (
        <>
          <h2><Icone nom="quete" /> Défis</h2>
          <p class="domaine">Un seul domaine, plus long, XP ×2.</p>
          <div class="liste">
            {defis.map((d) => {
              const record = profil.records[cleRecord(d.jeu, d.domaine)];
              return (
                <div key={`${d.jeu}:${d.domaine}`} class="noeud debloque">
                  <span>{MINI_JEUX[d.jeu].nom} · {d.domaine}</span>
                  {record !== undefined && <small><Icone nom="trophee" /> {record}</small>}
                  <button onClick={() => onDefi(d.jeu, d.domaine)}>Défi <Icone nom="suivant" /></button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
