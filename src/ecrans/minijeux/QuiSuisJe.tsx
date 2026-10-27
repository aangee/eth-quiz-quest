import { useMemo, useState } from 'preact/hooks';
import type { Indices } from '../../types';
import { questionsDuDomaine } from '../../packs';
import { contenu, crediter, longueur, multXp, type ARetenir, type PropsJeu } from '../../jeu/minijeux';
import { choixQui, pointsQui } from '../../jeu/qui';
import { melanger } from '../../jeu/melange';
import { PasDeContenu } from './PasDeContenu';
import { Icone } from '../../ui/Icone';

export const NB_PERSONNAGES = 4;

export function QuiSuisJe({ profil, partie, onFin, onQuitter }: PropsJeu) {
  const [liste] = useState(() => contenu<Indices>(questionsDuDomaine, 'indices', partie.domaines, profil.age));
  const tour = liste.slice(0, longueur(NB_PERSONNAGES, partie));
  const [i, setI] = useState(0);
  const [vus, setVus] = useState(1);
  const [choisi, setChoisi] = useState<string | null>(null);
  const [p, setP] = useState(profil);
  const [score, setScore] = useState(0);
  const [rates, setRates] = useState<ARetenir[]>([]);
  const courant = tour[i];
  // Leurres pris d'abord dans le même domaine
  const choix = useMemo(() => {
    if (!courant) return [];
    const memeDomaine = liste.filter((x) => x.domaine === courant.domaine).map((x) => x.q.reponse);
    return choixQui(courant.q.reponse, [...melanger(memeDomaine), ...melanger(liste.map((x) => x.q.reponse))]);
  }, [i]);

  if (!courant) return <PasDeContenu onQuitter={onQuitter} />;
  const { q, domaine } = courant;

  const repondre = (c: string) => {
    if (choisi) return;
    setChoisi(c);
    if (c === q.reponse) {
      const pts = pointsQui(vus);
      setScore((s) => s + pts);
      setP((x) => crediter(x, domaine, 5 * pts * q.niveau * multXp(partie)));
    } else {
      setRates((r) => [...r, { question: `Qui suis-je ? ${q.indices.join(' · ')}`, bonne: q.reponse, explication: q.explication }]);
    }
  };
  const suivant = () => {
    if (i + 1 >= tour.length) {
      onFin(p, { score, xp: p.xp - profil.xp, texte: `${score} point(s)`, aRetenir: rates });
      return;
    }
    setI(i + 1);
    setVus(1);
    setChoisi(null);
  };

  return (
    <main class="ecran">
      <div class="barre">
        <span><Icone nom="profil" /> Qui suis-je ? {i + 1}/{tour.length}</span>
        <span><Icone nom="etoile" pleine /> {score} pts</span>
      </div>
      <p class="domaine">{domaine} · {pointsQui(vus)} point(s) en jeu</p>
      <ul class="quetes">
        {q.indices.slice(0, choisi ? q.indices.length : vus).map((t) => <li key={t}>{t}</li>)}
      </ul>
      {!choisi && vus < q.indices.length && <button onClick={() => setVus(vus + 1)}>Indice suivant (−1 point)</button>}
      <div class="choix">
        {choix.map((c) => (
          <button key={c} disabled={!!choisi}
            class={choisi && c === q.reponse ? 'bon' : choisi === c ? 'rate' : ''}
            onClick={() => repondre(c)}>
            {c}
          </button>
        ))}
      </div>
      {choisi && (
        <div class={choisi === q.reponse ? 'verdict ok' : 'verdict ko'}>
          <p>{choisi === q.reponse ? <><Icone nom="valider" /> +{pointsQui(vus)} point(s)</> : <><Icone nom="quitter" /> C'était : {q.reponse}</>}</p>
          {q.explication && <p>{q.explication}</p>}
          <button class="principal" onClick={suivant}>Suivant <Icone nom="suivant" /></button>
        </div>
      )}
      <button onClick={onQuitter}>Abandonner</button>
    </main>
  );
}
