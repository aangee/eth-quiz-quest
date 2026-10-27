export function PasDeContenu({ onQuitter }: { onQuitter: () => void }) {
  return (
    <main class="ecran">
      <p>Pas encore de contenu pour ce mini-jeu dans ces domaines.</p>
      <button onClick={onQuitter}>← Retour</button>
    </main>
  );
}
