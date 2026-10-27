import type { ResultatJeu } from '../jeu/minijeux';
import { Celebration } from './Celebration';
import type { Celebration as CelebrationT } from '../jeu/celebration';

export function EcranFinJeu({ nom, resultat, record, celebration, onRejouer, onRetour }: {
  nom: string; resultat: ResultatJeu; record: boolean; celebration: CelebrationT; onRejouer: () => void; onRetour: () => void;
}) {
  return (
    <main class="ecran">
      <h1>{nom}</h1>
      <p>{resultat.texte}</p>
      <p>✨ +{resultat.xp} XP</p>
      <Celebration c={celebration} />
      {record && <p class="record">🏆 Nouveau record !</p>}
      {resultat.aRetenir && resultat.aRetenir.length > 0 && (
        <>
          <h2>À retenir</h2>
          <ul>
            {resultat.aRetenir.map((r) => (
              <li key={r.question}><b>{r.question}</b><br />✅ {r.bonne}{r.explication && <> — {r.explication}</>}</li>
            ))}
          </ul>
        </>
      )}
      <button class="principal" onClick={onRejouer}>Rejouer 🔁</button>
      <button onClick={onRetour}>← Mini-jeux</button>
    </main>
  );
}
