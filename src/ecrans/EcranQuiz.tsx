import { useEffect, useMemo, useState } from 'preact/hooks';
import type { Profil, QCM, VraiFaux } from '../types';
import { questionsDuDomaine } from '../packs';
import { choisirQuestion, coteDepart } from '../jeu/adaptation';
import { appliquerReponse, bonneReponse } from '../jeu/partie';
import { melanger } from '../jeu/melange';
import { avancerQuetes } from '../jeu/quetes';
import { choixACacher, jokersDebloques, jokerUtilisable, utiliserJoker } from '../jeu/jokers';
import { nomJoker } from '../jeu/arbre';
import { BarreTemps } from './BarreTemps';
import { Icone } from '../ui/Icone';
import { useTheme } from '../themes/contexte';
import { explicationSansReponse } from '../jeu/explication';

export const NB_QUESTIONS = 10;
export const LIMITE_MS = 20000;
export const BONUS_TEMPS_MS = 10000;

export interface Bilan {
  justes: number;
  total: number;
  xp: number;
  erreurs: { question: string; bonne: string; explication: string }[];
}

type Tirage = { q: QCM | VraiFaux; domaine: string };
type Valeur = number | boolean;

const estQuiz = (q: { type: string }): q is QCM | VraiFaux => q.type === 'qcm' || q.type === 'vrai_faux';

export function tirer(p: Profil, doms: string[], vues: Set<string>): Tirage | null {
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
  const [limite, setLimite] = useState(LIMITE_MS);
  const [reste, setReste] = useState(LIMITE_MS);
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [caches, setCaches] = useState<Set<Valeur>>(() => new Set());
  const [jokerPris, setJokerPris] = useState(false);
  const [gain, setGain] = useState(0);
  const [choisi, setChoisi] = useState<Valeur | null>(null);
  const theme = useTheme();

  // Choix des QCM mélangés une fois par question (valeur = index d'origine)
  const choix = useMemo<{ label: string; valeur: Valeur }[]>(() => {
    if (!tirage) return [];
    const { q } = tirage;
    return q.type === 'qcm'
      ? melanger(q.choix.map((c, i) => ({ label: c, valeur: i })))
      : [{ label: 'Vrai', valeur: true }, { label: 'Faux', valeur: false }];
  }, [tirage]);

  const repondre = (rep: Valeur | null) => {
    if (!tirage || verdict !== null) return;
    const { q, domaine } = tirage;
    const juste = rep !== null && rep === q.reponse;
    setChoisi(rep);
    const temps = Date.now() - debut;
    const r = appliquerReponse(p, domaine, q, juste, temps, limite);
    setGain(r.xp);
    setP(avancerQuetes(r.profil, { type: 'reponse', domaine, juste, rapide: juste && temps <= limite / 3 }));
    setVerdict(juste);
    setBilan((b) => ({
      justes: b.justes + (juste ? 1 : 0),
      total: b.total + 1,
      xp: b.xp + r.xp,
      erreurs: juste ? b.erreurs : [...b.erreurs, { question: q.question, bonne: bonneReponse(q), explication: q.explication }],
    }));
  };

  const prendreJoker = (j: string) => {
    if (!tirage || verdict !== null || jokerPris) return;
    const { q } = tirage;
    setP(utiliserJoker(p, j));
    setJokerPris(true);
    if (j === 'temps') setLimite((l) => l + BONUS_TEMPS_MS);
    else if (q.type === 'qcm') setCaches(new Set<Valeur>(choixACacher(q, j)));
    else setCaches(new Set<Valeur>([!q.reponse]));
  };

  // Chrono : temps écoulé = réponse fausse (p dans les dépendances : un joker change p)
  useEffect(() => {
    if (!tirage || verdict !== null) return;
    const t = setInterval(() => {
      const r = limite - (Date.now() - debut);
      setReste(Math.max(0, r));
      if (r <= 0) repondre(null);
    }, 250);
    return () => clearInterval(t);
  }, [tirage, verdict, debut, limite, p]);

  // Aucune question jouable : on termine tout de suite
  useEffect(() => { if (!tirage) onFin(p, bilan); }, []);

  const suivant = () => {
    const prochain = bilan.total >= NB_QUESTIONS ? null : tirer(p, domaines, vues);
    if (!prochain) { onFin(avancerQuetes(p, { type: 'fin_quiz' }), bilan); return; }
    setTirage(prochain);
    setVerdict(null);
    setChoisi(null);
    setDebut(Date.now());
    setLimite(LIMITE_MS);
    setReste(LIMITE_MS);
    setCaches(new Set());
    setJokerPris(false);
  };

  if (!tirage) return <main class="ecran"><p>Aucune question disponible.</p></main>;
  const { q } = tirage;
  const jokersDispo = jokersDebloques(p).filter((j) => (p.jokers[j] ?? 0) > 0 && jokerUtilisable(j, q, tirage.domaine));

  return (
    <main class="ecran">
      <div class="barre">
        <span>Question {bilan.total + (verdict === null ? 1 : 0)}/{NB_QUESTIONS}</span>
        <span><Icone nom="chrono" /> {Math.ceil(reste / 1000)} s</span>
        <span>{bilan.xp} XP</span>
      </div>
      <BarreTemps reste={reste} total={limite} />
      <p class="domaine">{tirage.domaine} · niv. {q.niveau}</p>
      <h2>{q.question}</h2>
      <div class="choix">
        {choix.map((c, i) => ({ ...c, lettre: 'ABCD'[i] })).filter((c) => !caches.has(c.valeur)).map((c) => {
          const etat = verdict === null ? '' : c.valeur === q.reponse ? 'bon' : c.valeur === choisi ? 'rate' : 'estompe';
          return (
            <button key={c.label} class={etat} disabled={verdict !== null} onClick={() => repondre(c.valeur)}>
              {q.type === 'qcm' && <span class="lettre" aria-hidden="true">{c.lettre}</span>}
              <span class="libelle">{c.label}</span>
              {etat === 'bon' && <Icone nom="valider" titre="bonne réponse" />}
              {etat === 'rate' && <Icone nom="quitter" titre="ta réponse" />}
            </button>
          );
        })}
      </div>
      {verdict === null && !jokerPris && jokersDispo.length > 0 && (
        <div class="jokers">
          {jokersDispo.map((j) => (
            <button key={j} onClick={() => prendreJoker(j)}><Icone nom="joker" /> {nomJoker(j)} ×{p.jokers[j]}</button>
          ))}
        </div>
      )}
      {verdict !== null && (
        <div class={verdict ? 'verdict ok' : 'verdict ko'}>
          <p>{verdict ? <><Icone nom="valider" /> {theme.textes.bravo} <span class="gain">+{gain} XP</span></> : <><Icone nom="quitter" /> Raté</>}</p>
          {!verdict && <p>Bonne réponse : <b>{bonneReponse(q)}</b></p>}
          {q.explication && <p>{verdict ? q.explication : explicationSansReponse(bonneReponse(q), q.explication)}</p>}
          <button class="principal" onClick={suivant}>{theme.textes.suite} <Icone nom="suivant" /></button>
        </div>
      )}
    </main>
  );
}
