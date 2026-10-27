import { useState } from 'preact/hooks';
import type { Mot } from '../../types';
import { questionsDuDomaine } from '../../packs';
import { contenu, crediter, longueur, multXp, type ARetenir, type PropsJeu } from '../../jeu/minijeux';
import { ERREURS_MAX, affichage, erreurs, estTrouve, normaliser } from '../../jeu/mot';
import { PasDeContenu } from './PasDeContenu';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const NB_MOTS = 3;

export function MotMystere({ profil, partie, onFin, onQuitter }: PropsJeu) {
  const [liste] = useState(() => contenu<Mot>(questionsDuDomaine, 'mot', partie.domaines, profil.age).slice(0, longueur(NB_MOTS, partie)));
  const [i, setI] = useState(0);
  const [essayees, setEssayees] = useState<Set<string>>(() => new Set());
  const [p, setP] = useState(profil);
  const [score, setScore] = useState(0);
  const [rates, setRates] = useState<ARetenir[]>([]);

  if (!liste.length) return <PasDeContenu onQuitter={onQuitter} />;
  const { q, domaine } = liste[i];
  const nbErreurs = erreurs(q.reponse, essayees);
  const gagne = estTrouve(q.reponse, essayees);
  const perdu = !gagne && nbErreurs >= ERREURS_MAX;

  const jouer = (l: string) => {
    if (gagne || perdu || essayees.has(l)) return;
    const e = new Set(essayees).add(l);
    setEssayees(e);
    if (estTrouve(q.reponse, e)) {
      setScore((s) => s + 1);
      setP((x) => crediter(x, domaine, 10 * q.niveau * multXp(partie)));
    }
  };

  const suivant = () => {
    const r = perdu ? [...rates, { question: q.indice, bonne: q.reponse, explication: q.explication }] : rates;
    setRates(r);
    if (i + 1 >= liste.length) {
      onFin(p, { score, xp: p.xp - profil.xp, texte: `${score}/${liste.length} mot(s) trouvé(s)`, aRetenir: r });
      return;
    }
    setI(i + 1);
    setEssayees(new Set());
  };

  return (
    <main class="ecran">
      <div class="barre">
        <span>🔤 Mot {i + 1}/{liste.length}</span>
        <span>❤️ {ERREURS_MAX - nbErreurs}</span>
        <span>✅ {score}</span>
      </div>
      <p class="domaine">{domaine}</p>
      <h2>{q.indice}</h2>
      <p class="mot">{affichage(q.reponse, perdu ? new Set(ALPHABET) : essayees)}</p>
      {gagne || perdu ? (
        <div class={gagne ? 'verdict ok' : 'verdict ko'}>
          <p>{gagne ? '✅ Trouvé !' : `❌ C'était : ${q.reponse}`}</p>
          {q.explication && <p>{q.explication}</p>}
          <button class="principal" onClick={suivant}>Suivant ▶</button>
        </div>
      ) : (
        <div class="clavier">
          {ALPHABET.map((l) => (
            <button key={l} disabled={essayees.has(l)}
              class={essayees.has(l) ? (normaliser(q.reponse).includes(l) ? 'bon' : 'rate') : ''}
              onClick={() => jouer(l)}>
              {l}
            </button>
          ))}
        </div>
      )}
      <button onClick={onQuitter}>Abandonner</button>
    </main>
  );
}
