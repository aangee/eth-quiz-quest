import { useState } from 'preact/hooks';
import type { Pack, Profil, QueteSemaine } from '../../types';
import { creerSauvegarde, lireSauvegarde, nomFichierSauvegarde, type Sauvegarde } from '../../jeu/sauvegarde';
import { lireJson, telechargerJson } from './fichiers';

export function SectionSauvegarde({ profils, semaine, packsImportes, onRestaurer }: {
  profils: Profil[]; semaine: QueteSemaine; packsImportes: Pack[]; onRestaurer: (s: Sauvegarde) => void;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const exporter = () => telechargerJson(nomFichierSauvegarde(), creerSauvegarde(profils, semaine, packsImportes));
  const importer = async (e: Event) => {
    try {
      const r = lireSauvegarde(await lireJson(e));
      if ('erreur' in r) { setMessage(`❌ ${r.erreur}`); return; }
      if (!confirm(`Remplacer les données de cet appareil par la sauvegarde (${r.sauvegarde.profils.length} profil(s)) ?`)) return;
      onRestaurer(r.sauvegarde);
      setMessage(`✅ Sauvegarde restaurée : ${r.sauvegarde.profils.length} profil(s).`);
    } catch (err) {
      setMessage(`❌ ${(err as Error).message}`);
    }
  };
  return (
    <section>
      <h3>💾 Sauvegarde</h3>
      <p class="domaine">Pour passer d'un appareil à l'autre : exporter ici, importer sur l'autre.</p>
      <button onClick={exporter}>📤 Exporter la sauvegarde</button>
      <label class="fichier">
        📥 Importer une sauvegarde
        <input type="file" accept=".json,application/json" onChange={importer} />
      </label>
      {message && <p class="bandeau">{message}</p>}
    </section>
  );
}
