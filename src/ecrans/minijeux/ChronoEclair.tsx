import { useEffect, useState } from 'preact/hooks';
import type { VraiFaux } from '../../types';
import { questionsDuDomaine } from '../../packs';
import { contenu, crediter, longueur, multXp, type PropsJeu } from '../../jeu/minijeux';
import { PasDeContenu } from './PasDeContenu';
import { BarreTemps } from '../BarreTemps';

export const DUREE_MS = 60000;
export const PENALITE_MS = 3000;

export function ChronoEclair({ profil, partie, onFin, onQuitter }: PropsJeu) {
  const [liste] = useState(() => contenu<VraiFaux>(questionsDuDomaine, 'vrai_faux', partie.domaines, profil.age));
  const [fin, setFin] = useState(() => Date.now() + longueur(DUREE_MS, partie));
  const [reste, setReste] = useState(longueur(DUREE_MS, partie));
  const [i, setI] = useState(0);
  const [p, setP] = useState(profil);
  const [score, setScore] = useState(0);
  const [dernier, setDernier] = useState<'ok' | 'ko' | null>(null);
  const termine = liste.length > 0 && (reste <= 0 || i >= liste.length);

  useEffect(() => {
    if (termine) return;
    const t = setInterval(() => setReste(Math.max(0, fin - Date.now())), 200);
    return () => clearInterval(t);
  }, [fin, termine]);

  useEffect(() => {
    if (termine) onFin(p, { score, xp: p.xp - profil.xp, texte: `${score} bonne(s) réponse(s)` });
  }, [termine]);

  if (!liste.length) return <PasDeContenu onQuitter={onQuitter} />;
  if (termine) return <main class="ecran"><p>⏱ Terminé !</p></main>;
  const { q, domaine } = liste[i];

  const repondre = (v: boolean) => {
    if (v === q.reponse) {
      setScore((s) => s + 1);
      setP((x) => crediter(x, domaine, 10 * q.niveau * multXp(partie)));
      setDernier('ok');
    } else {
      setFin((f) => f - PENALITE_MS);
      setDernier('ko');
    }
    setI((n) => n + 1);
  };

  return (
    <main class="ecran">
      <div class="barre">
        <span>⚡ Chrono-éclair</span>
        <span>⏱ {Math.ceil(reste / 1000)} s</span>
        <span>✅ {score} {dernier === 'ok' ? '👍' : dernier === 'ko' ? '−3 s' : ''}</span>
      </div>
      <BarreTemps reste={reste} total={longueur(DUREE_MS, partie)} />
      <p class="domaine">{domaine}</p>
      <h2>{q.question}</h2>
      <div class="duo">
        <button onClick={() => repondre(true)}>Vrai</button>
        <button onClick={() => repondre(false)}>Faux</button>
      </div>
      <button onClick={onQuitter}>Abandonner</button>
    </main>
  );
}
