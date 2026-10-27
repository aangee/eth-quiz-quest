import { useState } from 'preact/hooks';
import type { Profil } from '../../types';
import { Icone } from '../../ui/Icone';

function LigneProfil({ p, onMaj, onSupprimer }: { p: Profil; onMaj: (p: Profil) => void; onSupprimer: (id: string) => void }) {
  const [prenom, setPrenom] = useState(p.prenom);
  const [age, setAge] = useState(p.age);
  const modifie = prenom.trim() !== p.prenom || age !== p.age;
  const valide = prenom.trim() !== '' && age >= 5 && age <= 99;
  return (
    <div class="noeud">
      <span class="avatar">{p.avatar}</span>
      <input aria-label="Pseudo" value={prenom} onInput={(e) => setPrenom(e.currentTarget.value)} />
      <input aria-label="Âge" class="age" type="number" min={5} max={99} value={age}
        onInput={(e) => setAge(Number(e.currentTarget.value))} />
      <button class="petit" disabled={!modifie || !valide} onClick={() => onMaj({ ...p, prenom: prenom.trim(), age })} aria-label={`Enregistrer ${p.prenom}`}><Icone nom="valider" /></button>
      <button class="petit" onClick={() => { if (confirm(`Supprimer ${p.prenom} et toute sa progression ?`)) onSupprimer(p.id); }} aria-label={`Supprimer ${p.prenom}`}><Icone nom="supprimer" /></button>
    </div>
  );
}

export function SectionProfils({ profils, onMaj, onSupprimer }: {
  profils: Profil[]; onMaj: (p: Profil) => void; onSupprimer: (id: string) => void;
}) {
  return (
    <section>
      <h3><Icone nom="profil" /> Profils</h3>
      {profils.length === 0 && <p>Aucun profil.</p>}
      <div class="liste">
        {profils.map((p) => <LigneProfil key={p.id} p={p} onMaj={onMaj} onSupprimer={onSupprimer} />)}
      </div>
    </section>
  );
}
