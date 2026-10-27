import { useMemo, useState } from 'preact/hooks';
import type { Ordre } from '../../types';
import { questionsDuDomaine } from '../../packs';
import { contenu, crediter, longueur, multXp, type ARetenir, type PropsJeu } from '../../jeu/minijeux';
import { friseJuste, verifierOrdre } from '../../jeu/frise';
import { melanger } from '../../jeu/melange';
import { PasDeContenu } from './PasDeContenu';
import { Icone } from '../../ui/Icone';

export const NB_FRISES = 3;

export function Frise({ profil, partie, onFin, onQuitter }: PropsJeu) {
  const [liste] = useState(() => contenu<Ordre>(questionsDuDomaine, 'ordre', partie.domaines, profil.age).slice(0, longueur(NB_FRISES, partie)));
  const [i, setI] = useState(0);
  const [proposition, setProposition] = useState<string[]>([]);
  const [valide, setValide] = useState(false);
  const [p, setP] = useState(profil);
  const [score, setScore] = useState(0);
  const [rates, setRates] = useState<ARetenir[]>([]);
  const courant = liste[i];
  const melange = useMemo(() => (courant ? melanger(courant.q.elements) : []), [i]);

  if (!courant) return <PasDeContenu onQuitter={onQuitter} />;
  const { q, domaine } = courant;
  const restants = melange.filter((e) => !proposition.includes(e));
  const resultat = verifierOrdre(q.elements, proposition);
  const juste = friseJuste(q.elements, proposition);

  const valider = () => {
    setValide(true);
    if (juste) {
      setScore((s) => s + 1);
      setP((x) => crediter(x, domaine, 10 * q.niveau * multXp(partie)));
    } else {
      setRates((r) => [...r, { question: q.question, bonne: q.elements.join(' → '), explication: q.explication }]);
    }
  };
  const suivant = () => {
    if (i + 1 >= liste.length) {
      onFin(p, { score, xp: p.xp - profil.xp, texte: `${score}/${liste.length} frise(s) parfaite(s)`, aRetenir: rates });
      return;
    }
    setI(i + 1);
    setProposition([]);
    setValide(false);
  };

  return (
    <main class="ecran">
      <div class="barre">
        <span><Icone nom="horloge" /> Frise {i + 1}/{liste.length}</span>
        <span><Icone nom="valider" /> {score}</span>
      </div>
      <p class="domaine">{domaine}</p>
      <h2>{q.question}</h2>
      <ol class="frise">
        {proposition.map((e, k) => (
          <li key={e}>
            <button class={valide ? (resultat[k] ? 'bon' : 'rate') : ''} disabled={valide}
              onClick={() => setProposition(proposition.filter((x) => x !== e))}>
              {e}
            </button>
          </li>
        ))}
      </ol>
      {!valide && (
        <div class="choix">
          {restants.map((e) => <button key={e} onClick={() => setProposition([...proposition, e])}>{e}</button>)}
        </div>
      )}
      {!valide && restants.length === 0 && <button class="principal" onClick={valider}>Valider</button>}
      {valide && (
        <div class={juste ? 'verdict ok' : 'verdict ko'}>
          <p>{juste ? <><Icone nom="valider" /> Parfait !</> : <><Icone nom="quitter" /> Le bon ordre : {q.elements.join(' → ')}</>}</p>
          {q.explication && <p>{q.explication}</p>}
          <button class="principal" onClick={suivant}>Suivant <Icone nom="suivant" /></button>
        </div>
      )}
      <button onClick={onQuitter}>Abandonner</button>
    </main>
  );
}
