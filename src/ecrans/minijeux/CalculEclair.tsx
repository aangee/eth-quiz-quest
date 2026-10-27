import { useEffect, useState } from 'preact/hooks';
import { crediter, longueur, multXp, type PropsJeu } from '../../jeu/minijeux';
import { genererCalcul, niveauCalcul, niveauCalculDepart } from '../../jeu/calcul';
import { DUREE_MS } from './ChronoEclair';
import { BarreTemps } from '../BarreTemps';

const TOUCHES = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];

export function CalculEclair({ profil, partie, onFin, onQuitter }: PropsJeu) {
  const depart = niveauCalculDepart(profil.age);
  const duree = longueur(DUREE_MS, partie);
  const [fin] = useState(() => Date.now() + duree);
  const [reste, setReste] = useState(duree);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [calcul, setCalcul] = useState(() => genererCalcul(depart));
  const [saisie, setSaisie] = useState('');
  const [rate, setRate] = useState(false);
  const termine = reste <= 0;
  const niveau = niveauCalcul(depart, score);

  useEffect(() => {
    if (termine) return;
    const t = setInterval(() => setReste(Math.max(0, fin - Date.now())), 200);
    return () => clearInterval(t);
  }, [termine]);

  // Calcul éclair n'a pas de domaine : XP global seulement
  useEffect(() => {
    if (termine) onFin(crediter(profil, null, xp), { score, xp, texte: `${score} calcul(s) juste(s)` });
  }, [termine]);

  if (termine) return <main class="ecran"><p>⏱ Terminé !</p></main>;

  const valider = () => {
    if (saisie === '') return;
    if (Number(saisie) === calcul.reponse) {
      const s = score + 1;
      setScore(s);
      setXp((x) => x + 5 * niveau * multXp(partie));
      setCalcul(genererCalcul(niveauCalcul(depart, s)));
      setRate(false);
    } else {
      setRate(true);
    }
    setSaisie('');
  };
  const taper = (t: string) => setSaisie((s) => (s.length < 5 ? s + t : s));

  return (
    <main class="ecran">
      <div class="barre">
        <span>🔢 Calcul éclair · niv. {niveau}</span>
        <span>⏱ {Math.ceil(reste / 1000)} s</span>
        <span>✅ {score}</span>
      </div>
      <BarreTemps reste={reste} total={duree} />
      <h1 class="calcul">{calcul.texte} = {saisie || '?'}</h1>
      {rate && <p class="rate-texte">❌ Essaie encore</p>}
      <div class="pave">
        {TOUCHES.map((t) => <button key={t} onClick={() => taper(t)}>{t}</button>)}
        <button onClick={() => setSaisie((s) => s.slice(0, -1))}>⌫</button>
        <button onClick={() => taper('0')}>0</button>
        <button class="principal" onClick={valider}>OK</button>
      </div>
      <button onClick={onQuitter}>Abandonner</button>
    </main>
  );
}
