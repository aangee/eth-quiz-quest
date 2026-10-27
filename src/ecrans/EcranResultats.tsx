import type { Profil } from '../types';
import type { Bilan } from './EcranQuiz';
import { niveauDepuisXp, seuil } from '../jeu/xp';
import { Celebration } from './Celebration';
import { celebration } from '../jeu/celebration';

export function EcranResultats({ profil, avant, bilan, onRejouer, onRetour }: {
  profil: Profil; avant: Profil; bilan: Bilan; onRejouer: () => void; onRetour: () => void;
}) {
  const niv = niveauDepuisXp(profil.xp);
  return (
    <main class="ecran">
      <h1>{bilan.justes}/{bilan.total}</h1>
      <p>✨ +{bilan.xp} XP</p>
      <Celebration c={celebration(avant, profil)} />
      <p>
        {profil.avatar} {profil.prenom} · niveau {niv} ·{' '}
        {profil.xp - seuil(niv)}/{seuil(niv + 1) - seuil(niv)} XP vers le niveau {niv + 1}
      </p>
      {bilan.erreurs.length > 0 && (
        <>
          <h2>À retenir</h2>
          <ul>
            {bilan.erreurs.map((e) => (
              <li key={e.question}>
                <b>{e.question}</b><br />✅ {e.bonne}{e.explication && <> — {e.explication}</>}
              </li>
            ))}
          </ul>
        </>
      )}
      <button class="principal" onClick={onRejouer}>Rejouer 🔁</button>
      <button onClick={onRetour}>Mon profil</button>
    </main>
  );
}
