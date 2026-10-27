import { useEffect, useMemo, useState } from 'preact/hooks';
import type { Profil } from '../../types';
import { LIMITE_MS, tirer } from '../EcranQuiz';
import { appliquerReponse, bonneReponse } from '../../jeu/partie';
import { avancerQuetes } from '../../jeu/quetes';
import { melanger } from '../../jeu/melange';
import { pointsDuel } from '../../jeu/duel';
import { BarreTemps } from '../BarreTemps';
import { Icone } from '../../ui/Icone';

export interface ReponseDuel { juste: boolean; points: number; profil: Profil }

type Valeur = number | boolean;

/** Une manche : une question au niveau du joueur, chrono 20 s, puis « Continuer ». */
export function QuestionDuel({ profil, domaines, vues, onReponse }: {
  profil: Profil; domaines: string[]; vues: Set<string>; onReponse: (r: ReponseDuel) => void;
}) {
  const [tirage] = useState(() => tirer(profil, domaines, vues));
  const [debut] = useState(() => Date.now());
  const [reste, setReste] = useState(LIMITE_MS);
  const [resultat, setResultat] = useState<ReponseDuel | null>(null);

  const choix = useMemo<{ label: string; valeur: Valeur }[]>(() => {
    if (!tirage) return [];
    const { q } = tirage;
    return q.type === 'qcm'
      ? melanger(q.choix.map((c, i) => ({ label: c, valeur: i })))
      : [{ label: 'Vrai', valeur: true }, { label: 'Faux', valeur: false }];
  }, []);

  const repondre = (rep: Valeur | null) => {
    if (!tirage || resultat) return;
    const { q, domaine } = tirage;
    const juste = rep !== null && rep === q.reponse;
    const temps = Date.now() - debut;
    const r = appliquerReponse(profil, domaine, q, juste, temps, LIMITE_MS);
    const p = avancerQuetes(r.profil, { type: 'reponse', domaine, juste, rapide: juste && temps <= LIMITE_MS / 3 });
    setResultat({ juste, points: pointsDuel(juste, temps, LIMITE_MS), profil: p });
  };

  useEffect(() => {
    if (!tirage || resultat) return;
    const t = setInterval(() => {
      const r = LIMITE_MS - (Date.now() - debut);
      setReste(Math.max(0, r));
      if (r <= 0) repondre(null);
    }, 250);
    return () => clearInterval(t);
  }, [resultat]);

  // Plus aucune question : la manche compte pour 0
  useEffect(() => { if (!tirage) onReponse({ juste: false, points: 0, profil }); }, []);

  if (!tirage) return <p>Plus de questions disponibles.</p>;
  const { q } = tirage;
  return (
    <div class="question-duel">
      <p class="domaine">{profil.avatar} {profil.prenom} · {tirage.domaine} · niv. {q.niveau} · <Icone nom="chrono" /> {Math.ceil(reste / 1000)} s</p>
      <BarreTemps reste={reste} total={LIMITE_MS} />
      <h2>{q.question}</h2>
      <div class="choix">
        {choix.map((c) => (
          <button key={c.label} disabled={!!resultat} class={resultat && c.valeur === q.reponse ? 'bon' : ''}
            onClick={() => repondre(c.valeur)}>
            {c.label}
          </button>
        ))}
      </div>
      {resultat && (
        <div class={resultat.juste ? 'verdict ok' : 'verdict ko'}>
          <p>{resultat.juste ? <><Icone nom="valider" /> +{resultat.points} points</> : <><Icone nom="quitter" /> 0 point</>}</p>
          {!resultat.juste && <p>Bonne réponse : <b>{bonneReponse(q)}</b></p>}
          <button class="principal" onClick={() => onReponse(resultat)}>Continuer <Icone nom="suivant" /></button>
        </div>
      )}
    </div>
  );
}
