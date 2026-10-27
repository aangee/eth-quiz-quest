import { Icone } from '../../ui/Icone';
export function PasDeContenu({ onQuitter }: { onQuitter: () => void }) {
  return (
    <main class="ecran">
      <p>Pas encore de contenu pour ce mini-jeu dans ces domaines.</p>
      <button onClick={onQuitter}><Icone nom="retour" /> Retour</button>
    </main>
  );
}
