import type { Profil, QueteSemaine } from '../types';
import { libelleQuete } from '../jeu/quetes';
import { nomJoker } from '../jeu/arbre';
import { jokersDebloques } from '../jeu/jokers';
import { Calendrier } from './Calendrier';
import { Icone } from '../ui/Icone';

/** Onglet Profil : quêtes, calendrier, jokers, changer de joueur, espace parent. */
export function EcranProfil({ profil, semaine, onChanger, onParent }: {
  profil: Profil; semaine: QueteSemaine; onChanger: () => void; onParent: () => void;
}) {
  const jokers = jokersDebloques(profil);
  return (
    <main class="ecran avec-barre">
      <h1>{profil.avatar} {profil.prenom}</h1>

      <h2><Icone nom="quete" /> Quêtes du jour</h2>
      <ul class="quetes">
        {profil.quetes.liste.map((q) => (
          <li key={q.id} class={q.progres >= q.cible ? 'faite' : ''}>
            {q.progres >= q.cible ? <Icone nom="valider" /> : <span class="case" aria-hidden="true" />} {libelleQuete(q)} <small>{q.progres}/{q.cible}</small>
          </li>
        ))}
      </ul>
      <p>Ensemble cette semaine : {semaine.progres}/{semaine.cible} bonnes réponses {semaine.progres >= semaine.cible && <Icone nom="valider" />}</p>

      <h2><Icone nom="calendrier" /> Objectifs atteints</h2>
      <Calendrier jours={profil.calendrier} />

      {jokers.length > 0 && (
        <>
          <h2><Icone nom="joker" /> Jokers</h2>
          <p>{jokers.map((j) => `${nomJoker(j)} ×${profil.jokers[j] ?? 0}`).join(' · ')}</p>
        </>
      )}

      <button onClick={onChanger}><Icone nom="profil" /> Changer de joueur</button>
      <button onClick={onParent}><Icone nom="cadenas" /> Espace parent</button>
    </main>
  );
}
