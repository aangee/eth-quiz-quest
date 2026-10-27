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
      <button class="principal" onClick={onRejouer}>Rejouer 🔁</button>
      <button onClick={onRetour}>← Mini-jeux</button>
    </main>
  );
}
