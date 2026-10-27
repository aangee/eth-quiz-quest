import { useState } from 'preact/hooks';
import type { Profil } from '../types';
import { nouveauProfil } from '../stockage';
import { niveauDepuisXp } from '../jeu/xp';
import { Icone } from '../ui/Icone';

const AVATARS = ['🦊', '🐉', '🚀', '🦉', '🐼', '🤖', '🦖', '🐙'];

export function EcranProfils({ profils, onCreer, onChoisir, onParent }: {
  profils: Profil[]; onCreer: (p: Profil) => void; onChoisir: (p: Profil) => void; onParent: () => void;
}) {
  const [prenom, setPrenom] = useState('');
  const [age, setAge] = useState(10);
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const valide = prenom.trim() !== '' && age >= 5 && age <= 99;

  return (
    <main class="ecran">
      <h1>Quiz Quest</h1>
      {profils.length > 0 && <h2>Qui joue ?</h2>}
      <div class="liste">
        {profils.map((p) => (
          <button key={p.id} class="carte" onClick={() => onChoisir(p)}>
            <span class="avatar">{p.avatar}</span> {p.prenom} <small>niv. {niveauDepuisXp(p.xp)}</small>
          </button>
        ))}
      </div>
      <h2>Nouveau joueur</h2>
      <input placeholder="Pseudo" value={prenom} onInput={(e) => setPrenom(e.currentTarget.value)} />
      <label>Âge <input type="number" min={5} max={99} value={age} onInput={(e) => setAge(Number(e.currentTarget.value))} /></label>
      <div class="avatars">
        {AVATARS.map((a) => (
          <button key={a} class={a === avatar ? 'choisi' : ''} onClick={() => setAvatar(a)}>{a}</button>
        ))}
      </div>
      <button class="principal" disabled={!valide} onClick={() => { onCreer(nouveauProfil(prenom.trim(), avatar, age)); setPrenom(''); }}>
        Créer
      </button>
      <button onClick={onParent}><Icone nom="cadenas" /> Espace parent</button>
    </main>
  );
}
