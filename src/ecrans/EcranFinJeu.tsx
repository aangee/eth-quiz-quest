import type { ResultatJeu } from '../jeu/minijeux';

export function EcranFinJeu({ nom, resultat, record, onRejouer, onRetour }: {
  nom: string; resultat: ResultatJeu; record: boolean; onRejouer: () => void; onRetour: () => void;
}) {
  return (
    <main class="ecran">
      <h1>{nom}</h1>
      <p>{resultat.texte}</p>
      <p>✨ +{resultat.xp} XP</p>
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
