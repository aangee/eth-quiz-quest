import { useState } from 'preact/hooks';
import type { Pack } from '../../types';
import { packs } from '../../packs';
import { validerPack, type ErreurQuestion } from '../../packs/valider';
import { ajouterPackImporte } from '../../packs/fusion';
import { lireJson } from './fichiers';
import { Icone } from '../../ui/Icone';

export function SectionPacks({ packsImportes, onPacks }: { packsImportes: Pack[]; onPacks: (l: Pack[]) => void }) {
  const [rapport, setRapport] = useState<{ titre: string; erreurs: ErreurQuestion[] } | null>(null);
  const noms = new Set(packsImportes.map((p) => p.pack));
  const integres = packs.filter((p) => !noms.has(p.pack));
  const actives = (nom: string) => packs.find((p) => p.pack === nom)?.questions.length ?? 0;

  const importer = async (e: Event) => {
    try {
      const r = validerPack(await lireJson(e));
      if (!r.pack) { setRapport({ titre: `Pack refusé : ${r.erreurPack}`, erreurs: [] }); return; }
      if (!r.pack.questions.length) { setRapport({ titre: 'Aucune question valide dans ce pack.', erreurs: r.erreurs }); return; }
      onPacks(ajouterPackImporte(packsImportes, r.pack));
      setRapport({ titre: `« ${r.pack.domaine} » : ${r.pack.questions.length} question(s) importée(s)`, erreurs: r.erreurs });
    } catch (err) {
      setRapport({ titre: `${(err as Error).message}`, erreurs: [] });
    }
  };
  const supprimer = (p: Pack) => {
    if (confirm(`Supprimer le pack « ${p.domaine} » (${p.pack}) ?`)) onPacks(packsImportes.filter((x) => x.pack !== p.pack));
  };

  return (
    <section>
      <h3><Icone nom="livre" /> Packs</h3>
      <ul class="quetes">
        {integres.map((p) => <li key={p.pack}>{p.domaine} <small>{p.questions.length} · intégré</small></li>)}
        {packsImportes.map((p) => (
          <li key={p.pack}>
            {p.domaine} <small>{actives(p.pack)}/{p.questions.length} · importé</small>
            <button class="petit" aria-label={`Supprimer le pack ${p.domaine}`} onClick={() => supprimer(p)}><Icone nom="supprimer" /></button>
          </li>
        ))}
      </ul>
      <label class="fichier">
        <Icone nom="sauvegarde" /> Importer un pack (.json)
        <input type="file" accept=".json,application/json" onChange={importer} />
      </label>
      {rapport && (
        <div class="verdict">
          <p>{rapport.titre}</p>
          {rapport.erreurs.length > 0 && (
            <>
              <p>{rapport.erreurs.length} question(s) rejetée(s) :</p>
              <ul>{rapport.erreurs.map((x) => <li key={x.index}>n° {x.index + 1} ({x.id}) : {x.raison}</li>)}</ul>
            </>
          )}
        </div>
      )}
      <p class="domaine">Pour créer un pack avec une IA : voir <code>packs/PROMPT-IA.md</code> dans le dépôt.</p>
    </section>
  );
}
