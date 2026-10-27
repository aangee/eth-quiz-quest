import { useEffect, useState } from 'preact/hooks';
import type { Paires } from '../../types';
import { questionsDuDomaine } from '../../packs';
import { contenu, crediter, multXp, type PropsJeu } from '../../jeu/minijeux';
import { creerCartes, estPaire, type Carte } from '../../jeu/memory';
import { PasDeContenu } from './PasDeContenu';
import { Icone } from '../../ui/Icone';

export const PAIRES_MAX = 6;

export function Memory({ profil, partie, onFin, onQuitter }: PropsJeu) {
  const [tirage] = useState(() => contenu<Paires>(questionsDuDomaine, 'paires', partie.domaines, profil.age)[0] ?? null);
  const [cartes] = useState(() => (tirage ? creerCartes(tirage.q.paires.slice(0, PAIRES_MAX)) : []));
  const [trouvees, setTrouvees] = useState<Set<number>>(() => new Set());
  const [retournees, setRetournees] = useState<number[]>([]);
  const [coups, setCoups] = useState(0);
  const nbPaires = cartes.length / 2;

  useEffect(() => {
    if (tirage && nbPaires > 0 && trouvees.size === nbPaires) {
      const xp = 5 * tirage.q.niveau * nbPaires * multXp(partie);
      onFin(crediter(profil, tirage.domaine, xp), { score: coups, xp, texte: `${nbPaires} paires en ${coups} coups` });
    }
  }, [trouvees]);

  if (!tirage) return <PasDeContenu onQuitter={onQuitter} />;

  const toucher = (c: Carte) => {
    if (retournees.length === 2 || trouvees.has(c.paire) || retournees.includes(c.id)) return;
    const r = [...retournees, c.id];
    setRetournees(r);
    if (r.length < 2) return;
    setCoups((n) => n + 1);
    const [a, b] = r.map((id) => cartes.find((x) => x.id === id)!);
    if (estPaire(a, b)) {
      setTrouvees((t) => new Set(t).add(a.paire));
      setRetournees([]);
    } else {
      setTimeout(() => setRetournees([]), 900);
    }
  };

  return (
    <main class="ecran">
      <div class="barre">
        <span>🃏 Memory</span>
        <span><Icone nom="melanger" /> {coups} coups</span>
      </div>
      <p class="domaine">{tirage.domaine} · {tirage.q.question}</p>
      <div class="grille">
        {cartes.map((c) => {
          const trouvee = trouvees.has(c.paire);
          const visible = trouvee || retournees.includes(c.id);
          return (
            <button key={c.id} class={`carte-memory ${visible ? 'visible' : ''} ${trouvee ? 'trouvee' : ''}`} onClick={() => toucher(c)}>
              <span class="face dos">?</span><span class="face recto">{c.texte}</span>
            </button>
          );
        })}
      </div>
      <button onClick={onQuitter}>Abandonner</button>
    </main>
  );
}
