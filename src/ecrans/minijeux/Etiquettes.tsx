import { useMemo, useState } from 'preact/hooks';
import type { Etiquettes as QEtiquettes } from '../../types';
import { questionsDuDomaine } from '../../packs';
import { contenu, crediter, longueur, multXp, type ARetenir, type PropsJeu } from '../../jeu/minijeux';
import { etiquettesRestantes, scoreEtiquettes } from '../../jeu/etiquettes';
import { melanger } from '../../jeu/melange';
import { PasDeContenu } from './PasDeContenu';
import { Icone } from '../../ui/Icone';

export function Etiquettes({ profil, partie, onFin, onQuitter }: PropsJeu) {
  const [liste] = useState(() => contenu<QEtiquettes>(questionsDuDomaine, 'etiquettes', partie.domaines, profil.age).slice(0, longueur(1, partie)));
  const [i, setI] = useState(0);
  const [placements, setPlacements] = useState<Record<number, string>>({});
  const [etiquette, setEtiquette] = useState<string | null>(null);
  const [valide, setValide] = useState(false);
  const [p, setP] = useState(profil);
  const [score, setScore] = useState(0);
  const [rates, setRates] = useState<ARetenir[]>([]);
  const courant = liste[i];
  const labels = useMemo(() => (courant ? melanger(courant.q.zones.map((z) => z.label)) : []), [i]);

  if (!courant) return <PasDeContenu onQuitter={onQuitter} />;
  const { q, domaine } = courant;
  const restantes = etiquettesRestantes(labels, placements);
  const bonnes = scoreEtiquettes(q.zones, placements);

  // Toucher une zone : y poser l'étiquette choisie, ou retirer celle qui y est
  const toucherZone = (k: number) => {
    if (valide) return;
    if (etiquette) {
      setPlacements({ ...placements, [k]: etiquette });
      setEtiquette(null);
    } else if (placements[k]) {
      const reste = { ...placements };
      delete reste[k];
      setPlacements(reste);
    }
  };
  const valider = () => {
    setValide(true);
    setScore((s) => s + bonnes);
    setP((x) => crediter(x, domaine, 5 * q.niveau * bonnes * multXp(partie)));
    const mal = q.zones.filter((z, k) => placements[k] !== z.label).map((z) => z.label);
    if (mal.length) setRates((r) => [...r, { question: q.question, bonne: `Mal placées : ${mal.join(', ')}`, explication: q.explication }]);
  };
  const suivant = () => {
    if (i + 1 >= liste.length) {
      onFin(p, { score, xp: p.xp - profil.xp, texte: `${score} étiquette(s) bien placée(s)`, aRetenir: rates });
      return;
    }
    setI(i + 1);
    setPlacements({});
    setValide(false);
  };

  return (
    <main class="ecran">
      <div class="barre">
        <span><Icone nom="quete" /> Étiquettes</span>
        <span><Icone nom="valider" /> {score}</span>
      </div>
      <p class="domaine">{domaine}</p>
      <h2>{q.question}</h2>
      <div class="image-etiquettes">
        <img src={import.meta.env.BASE_URL + q.image} alt={q.question} />
        {q.zones.map((z, k) => (
          <button key={k} style={{ left: `${z.x * 100}%`, top: `${z.y * 100}%` }}
            class={`zone ${valide ? (placements[k] === z.label ? 'bon' : 'rate') : placements[k] ? 'posee' : ''}`}
            onClick={() => toucherZone(k)}>
            {valide ? z.label : placements[k] ?? k + 1}
          </button>
        ))}
      </div>
      {!valide && <p class="domaine">{etiquette ? `Touche l'endroit pour « ${etiquette} »` : 'Choisis une étiquette'}</p>}
      {!valide && (
        <div class="etiquettes">
          {restantes.map((l) => (
            <button key={l} class={etiquette === l ? 'choisi' : ''} onClick={() => setEtiquette(l)}>{l}</button>
          ))}
        </div>
      )}
      {!valide && restantes.length === 0 && <button class="principal" onClick={valider}>Valider</button>}
      {valide && (
        <div class={bonnes === q.zones.length ? 'verdict ok' : 'verdict ko'}>
          <p>{bonnes}/{q.zones.length} bien placée(s)</p>
          {q.explication && <p>{q.explication}</p>}
          <button class="principal" onClick={suivant}>Suivant <Icone nom="suivant" /></button>
        </div>
      )}
      <button onClick={onQuitter}>Abandonner</button>
    </main>
  );
}
