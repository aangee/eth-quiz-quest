import { useState } from 'preact/hooks';
import { dateDuJour } from '../jeu/quetes';

const JOURS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function Calendrier({ jours }: { jours: string[] }) {
  const [vue, setVue] = useState<'semaine' | 'mois'>('semaine');
  const faits = new Set(jours);
  const auj = new Date();
  let dates: (Date | null)[];
  if (vue === 'semaine') {
    const lundi = new Date(auj.getFullYear(), auj.getMonth(), auj.getDate() - ((auj.getDay() + 6) % 7));
    dates = Array.from({ length: 7 }, (_, i) => new Date(lundi.getFullYear(), lundi.getMonth(), lundi.getDate() + i));
  } else {
    const premier = new Date(auj.getFullYear(), auj.getMonth(), 1);
    const nb = new Date(auj.getFullYear(), auj.getMonth() + 1, 0).getDate();
    dates = [
      ...Array<null>((premier.getDay() + 6) % 7).fill(null),
      ...Array.from({ length: nb }, (_, i) => new Date(auj.getFullYear(), auj.getMonth(), i + 1)),
    ];
  }
  return (
    <div>
      <div class="onglets">
        <button class={vue === 'semaine' ? 'choisi' : ''} onClick={() => setVue('semaine')}>Semaine</button>
        <button class={vue === 'mois' ? 'choisi' : ''} onClick={() => setVue('mois')}>Mois</button>
      </div>
      <div class="calendrier">
        {JOURS.map((j, i) => <span key={`e${i}`} class="entete">{j}</span>)}
        {dates.map((d, i) => d
          ? <span key={i} class={`${faits.has(dateDuJour(d)) ? 'fait' : ''} ${dateDuJour(d) === dateDuJour(auj) ? 'auj' : ''}`}>{d.getDate()}</span>
          : <span key={i} class="vide" />)}
      </div>
    </div>
  );
}
