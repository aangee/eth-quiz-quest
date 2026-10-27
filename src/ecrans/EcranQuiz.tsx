import { useEffect, useMemo, useState } from 'preact/hooks';
import type { Profil, QCM, VraiFaux } from '../types';
import { questionsDuDomaine } from '../packs';
import { choisirQuestion, coteDepart } from '../jeu/adaptation';
import { appliquerReponse } from '../jeu/partie';
import { melanger } from '../jeu/melange';

export const NB_QUESTIONS = 10;
export const LIMITE_MS = 20000;

export interface Bilan {
  justes: number;
  total: number;
  xp: number;
  erreurs: { question: string; explication: string }[];
}

type Tirage = { q: QCM | VraiFaux; domaine: string };

const estQuiz = (q: { type: string }): q is QCM | VraiFaux => q.type === 'qcm' || q.type === 'vrai_faux';

function tirer(p: Profil, doms: string[], vues: Set<string>): Tirage | null {
  for (const d of [...doms].sort(() => Math.random() - 0.5)) {
    const q = choisirQuestion(questionsDuDomaine(d).filter(estQuiz), p.cotes[d] ?? coteDepart(p.age), p.age, vues);
    if (q) { vues.add(q.id); return { q, domaine: d }; }
  }
  return null;
}

export function EcranQuiz({ profil, domaines, onFin }: {
  profil: Profil; domaines: string[]; onFin: (p: Profil, b: Bilan) => void;
}) {
  const [vues] = useState(() => new Set<string>());
  const [p, setP] = useState(profil);
  const [bilan, setBilan] = useState<Bilan>({ justes: 0, total: 0, xp: 0, erreurs: [] });
  const [tirage, setTirage] = useState<Tirage | null>(() => tirer(profil, domaines, vues));
  const [debut, setDebut] = useState(() => Date.now());
  const [reste, setReste] = useState(LIMITE_MS);
  const [verdict, setVerdict] = useState<boolean | null>(null);

  // Choix des QCM mélangés une fois par question (valeur = index d'origine)
  const choix = useMemo<{ label: string; valeur: number | boolean }[]>(() => {
    if (!tirage) return [];
    const { q } = tirage;
    return q.type === 'qcm'
      ? melanger(q.choix.map((c, i) => ({ label: c, valeur: i })))
      : [{ label: 'Vrai', valeur: true }, { label: 'Faux', valeur: false }];
  }, [tirage]);

  const repondre = (rep: number | boolean | null) => {
    if (!tirage || verdict !== null) return;
    const { q, domaine } = tirage;
    const juste = rep !== null && rep === q.reponse;
    const r = appliquerReponse(p, domaine, q, juste, Date.now() - debut, LIMITE_MS);
    setP(r.profil);
    setVerdict(juste);
    setBilan((b) => ({
      justes: b.justes + (juste ? 1 : 0),
      total: b.total + 1,
      xp: b.xp + r.xp,
      erreurs: juste ? b.erreurs : [...b.erreurs, { question: q.question, explication: q.explication }],
    }));
  };

  // Chrono : temps écoulé = réponse fausse
  useEffect(() => {
    if (!tirage || verdict !== null) return;
    const t = setInterval(() => {
      const r = LIMITE_MS - (Date.now() - debut);
      setReste(Math.max(0, r));
      if (r <= 0) repondre(null);
    }, 250);
    return () => clearInterval(t);
  }, [tirage, verdict, debut]);

  // Aucune question jouable : on termine tout de suite
  useEffect(() => { if (!tirage) onFin(p, bilan); }, []);

  const suivant = () => {
    const prochain = bilan.total >= NB_QUESTIONS ? null : tirer(p, domaines, vues);
    if (!prochain) { onFin(p, bilan); return; }
    setTirage(prochain);
    setVerdict(null);
    setDebut(Date.now());
    setReste(LIMITE_MS);
  };

  if (!tirage) return <main class="ecran"><p>Aucune question disponible.</p></main>;
  const { q } = tirage;

  return (
    <main class="ecran">
      <div class="barre">
        <span>Question {bilan.total + (verdict === null ? 1 : 0)}/{NB_QUESTIONS}</span>
        <span>⏱ {Math.ceil(reste / 1000)} s</span>
        <span>✨ {bilan.xp} XP</span>
      </div>
      <p class="domaine">{tirage.domaine} · niv. {q.niveau}</p>
      <h2>{q.question}</h2>
      <div class="choix">
        {choix.map((c) => (
          <button key={c.label} class={verdict !== null && c.valeur === q.reponse ? 'bon' : ''}
            disabled={verdict !== null} onClick={() => repondre(c.valeur)}>
            {c.label}
          </button>
        ))}
      </div>
      {verdict !== null && (
        <div class={verdict ? 'verdict ok' : 'verdict ko'}>
          <p>{verdict ? '✅ Bravo !' : '❌ Raté'}</p>
          {q.explication && <p>{q.explication}</p>}
          <button class="principal" onClick={suivant}>Suivant ▶</button>
        </div>
      )}
    </main>
  );
}
