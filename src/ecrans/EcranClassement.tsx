import { useEffect, useState } from 'preact/hooks';
import type { Famille } from '../stockage';
import { chargerClassementCache, dependancesFirebase, sauverClassementCache } from '../stockage';
import { lireClassement } from '../net/classementEnLigne';
import { trier, type Critere, type EntreeClassement } from '../jeu/classement';
import { semaineDe } from '../jeu/quetes';
import { MINI_JEUX, type MiniJeu } from '../jeu/arbre';
import { Icone } from '../ui/Icone';


function ilYa(date: number): string {
  const min = Math.round((Date.now() - date) / 60000);
  return min < 1 ? "à l'instant" : min < 60 ? `il y a ${min} min` : min < 1440 ? `il y a ${Math.round(min / 60)} h` : `il y a ${Math.round(min / 1440)} j`;
}

export function EcranClassement({ famille }: { famille: Famille | null }) {
  const [entrees, setEntrees] = useState<EntreeClassement[] | null>(null);
  const [date, setDate] = useState<number | null>(null);
  const [etat, setEtat] = useState<'chargement' | 'ok' | 'hors-ligne'>('chargement');
  const [critere, setCritere] = useState<Critere>('semaine');

  useEffect(() => {
    if (!famille) return;
    chargerClassementCache().then((c) => { if (c) { setEntrees((e) => e ?? c.entrees); setDate((d) => d ?? c.date); } });
    lireClassement(famille.config, dependancesFirebase)
      .then((e) => { setEntrees(e); setDate(Date.now()); setEtat('ok'); sauverClassementCache(e); })
      .catch(() => setEtat('hors-ligne'));
  }, []);

  if (!famille) {
    return (
      <main class="ecran">
        <h2><Icone nom="trophee" /> Classement</h2>
        <p>Le classement de la famille n'est pas encore installé sur cet appareil.</p>
        <p class="domaine">Un parent peut l'installer : Espace parent › Classement famille.</p>
        
      </main>
    );
  }

  const sem = semaineDe();
  const lignes = entrees ? trier(entrees, critere, sem) : [];
  const unite = critere === 'duels' ? 'victoire(s)' : critere === 'record:memory' ? 'coups' : critere.startsWith('record:') ? 'pts' : 'XP';
  const onglet = (c: Critere, texte: string) => (
    <button class={critere === c ? 'choisi' : ''} onClick={() => setCritere(c)}>{texte}</button>
  );

  return (
    <main class="ecran">
      <h2><Icone nom="trophee" /> Classement de la famille</h2>
      <p class="domaine">
        {etat === 'chargement' ? 'Mise à jour…' : etat === 'hors-ligne' ? `Hors ligne${date ? ` · vu ${ilYa(date)}` : ''}` : `Mis à jour ${ilYa(date ?? Date.now())}`}
      </p>
      <div class="onglets">
        {onglet('semaine', 'Semaine')}
        {onglet('xp', 'Total')}
        {onglet('duels', 'Duels')}
      </div>
      <select value={critere.startsWith('record:') ? critere : ''} onChange={(e) => e.currentTarget.value && setCritere(e.currentTarget.value as Critere)}>
        <option value="">Records d'un mini-jeu…</option>
        {(Object.keys(MINI_JEUX) as MiniJeu[]).map((j) => <option key={j} value={`record:${j}`}>{MINI_JEUX[j].nom}</option>)}
      </select>
      {entrees && lignes.length === 0 && <p>Personne encore dans ce classement.</p>}
      <ol class="classement">
        {lignes.map(({ entree, valeur }, i) => (
          <li key={entree.id} style={{ animationDelay: `${i * 60}ms` }}>
            <span class={i < 3 ? `rang podium-${i + 1}` : 'rang'}>{i < 3 ? <Icone nom="trophee" titre={`${i + 1}ᵉ`} /> : `${i + 1}.`}</span>
            <span class="avatar">{entree.avatar}</span>
            <span class="nom">{entree.pseudo}<small>{entree.appareil} · niv. {entree.niveau}</small></span>
            <b>{valeur} {unite}</b>
          </li>
        ))}
      </ol>
      
    </main>
  );
}
