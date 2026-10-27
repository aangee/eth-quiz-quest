import { useEffect, useState } from 'preact/hooks';
import type { Profil } from '../../types';
import { domaines } from '../../packs';
import { NB_MANCHES, ordreDesTours, vainqueur } from '../../jeu/duel';
import { avancerQuetes } from '../../jeu/quetes';
import { QuestionDuel } from './QuestionDuel';

const TOURS = ordreDesTours(NB_MANCHES);

export function DuelLocal({ joueur, profils, onFin, onQuitter }: {
  joueur: Profil; profils: Profil[]; onFin: (majs: Profil[], justes: number) => void; onQuitter: () => void;
}) {
  const [joueurs, setJoueurs] = useState<[Profil, Profil] | null>(null);
  const [manche, setManche] = useState(0);
  const [pret, setPret] = useState(false);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [justes, setJustes] = useState(0);
  const [vues, setVues] = useState(() => new Set<string>());
  const fini = joueurs !== null && manche >= TOURS.length;

  useEffect(() => {
    if (!fini || !joueurs) return;
    const v = vainqueur(scores);
    const majs = joueurs.map((p, i) => ({ ...avancerQuetes(p, { type: 'fin_quiz' }), duels: p.duels + (v === i ? 1 : 0) })) as [Profil, Profil];
    setJoueurs(majs);
    onFin(majs, justes);
  }, [fini]);

  if (!joueurs) {
    const autres = profils.filter((p) => p.id !== joueur.id);
    return (
      <main class="ecran">
        <h2>⚔️ Contre qui ?</h2>
        {autres.length === 0 && <p>Crée d'abord un deuxième joueur sur l'écran d'accueil.</p>}
        <div class="liste">
          {autres.map((p) => (
            <button key={p.id} class="carte" onClick={() => setJoueurs([joueur, p])}>
              <span class="avatar">{p.avatar}</span> {p.prenom}
            </button>
          ))}
        </div>
        <button onClick={onQuitter}>← Retour</button>
      </main>
    );
  }

  const tableau = (
    <div class="scores">
      {joueurs.map((p, i) => <span key={p.id}>{p.avatar} {p.prenom} : <b>{scores[i]}</b></span>)}
    </div>
  );

  if (fini) {
    const v = vainqueur(scores);
    const revanche = () => { setManche(0); setScores([0, 0]); setJustes(0); setVues(new Set()); setPret(false); };
    return (
      <main class="ecran">
        <h1>{v === 'egalite' ? '🤝 Égalité !' : `🏆 ${joueurs[v].avatar} ${joueurs[v].prenom} gagne !`}</h1>
        {tableau}
        <button class="principal" onClick={revanche}>Revanche 🔁</button>
        <button onClick={onQuitter}>Mon profil</button>
      </main>
    );
  }

  const i = TOURS[manche];
  return (
    <main class="ecran">
      <div class="barre"><span>⚔️ Manche {manche + 1}/{TOURS.length}</span></div>
      {tableau}
      {!pret ? (
        <div class="passe">
          <h2>📱 Passe l'appareil à {joueurs[i].avatar} {joueurs[i].prenom}</h2>
          <button class="principal" onClick={() => setPret(true)}>Je suis prêt ▶</button>
        </div>
      ) : (
        <QuestionDuel key={manche} profil={joueurs[i]} domaines={domaines} vues={vues}
          onReponse={(r) => {
            const j = [...joueurs] as [Profil, Profil];
            j[i] = r.profil;
            setJoueurs(j);
            setScores((s) => { const n = [...s] as [number, number]; n[i] += r.points; return n; });
            if (r.juste) setJustes((n) => n + 1);
            setManche((m) => m + 1);
            setPret(false);
          }} />
      )}
      <button onClick={onQuitter}>Abandonner</button>
    </main>
  );
}
