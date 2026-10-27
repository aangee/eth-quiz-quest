import type { Profil, QueteSemaine } from '../types';
import { niveauDepuisXp, seuil } from '../jeu/xp';
import { libelleQuete } from '../jeu/quetes';
import { etoilesDispo, nomJoker, type Noeud } from '../jeu/arbre';
import { jokersDebloques } from '../jeu/jokers';
import { domaines } from '../packs';
import { Calendrier } from './Calendrier';
import { Icone } from '../ui/Icone';

export function EcranJoueur({ profil, semaine, arbre, onJouer, onArbre, onMiniJeux, onDuel, onClassement, onChanger }: {
  profil: Profil; semaine: QueteSemaine; arbre: Noeud[];
  onJouer: () => void; onArbre: () => void; onMiniJeux: () => void; onDuel: () => void; onClassement: () => void; onChanger: () => void;
}) {
  const niv = niveauDepuisXp(profil.xp);
  const pct = Math.round((100 * (profil.xp - seuil(niv))) / (seuil(niv + 1) - seuil(niv)));
  const jokers = jokersDebloques(profil);
  return (
    <main class="ecran">
      <h1>{profil.avatar} {profil.prenom}</h1>
      <p>Niveau {niv} · <Icone nom="etoile" pleine /> {etoilesDispo(profil, arbre)} à dépenser</p>
      <div class="jauge"><div style={{ width: `${pct}%` }} /></div>

      <h2>Quêtes du jour</h2>
      <ul class="quetes">
        {profil.quetes.liste.map((q) => (
          <li key={q.id} class={q.progres >= q.cible ? 'faite' : ''}>
            {q.progres >= q.cible ? <Icone nom="valider" /> : <span class="case" aria-hidden="true" />} {libelleQuete(q)} <small>{q.progres}/{q.cible}</small>
          </li>
        ))}
      </ul>
      <p>Ensemble cette semaine : {semaine.progres}/{semaine.cible} bonnes réponses {semaine.progres >= semaine.cible && <Icone nom="valider" />}</p>

      <h2>Objectifs atteints</h2>
      <Calendrier jours={profil.calendrier} />

      <h2>Domaines</h2>
      <ul class="quetes">
        {domaines.map((d) => <li key={d}>{d} <small>niv. {niveauDepuisXp(profil.xpDomaine[d] ?? 0)}</small></li>)}
      </ul>
      {jokers.length > 0 && <p>🃏 {jokers.map((j) => `${nomJoker(j)} ×${profil.jokers[j] ?? 0}`).join(' · ')}</p>}

      <button class="principal" onClick={onJouer}>Jouer <Icone nom="suivant" /></button>
      <button onClick={onArbre}><Icone nom="arbre" /> Arbre de compétences</button>
      <button onClick={onMiniJeux}><Icone nom="jeux" /> Mini-jeux</button>
      <button onClick={onDuel}><Icone nom="duel" /> Duel</button>
      <button onClick={onClassement}><Icone nom="trophee" /> Classement</button>
      <button onClick={onChanger}>Changer de joueur</button>
    </main>
  );
}
