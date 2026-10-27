import { aCelebrer, type Celebration as C } from '../jeu/celebration';

/** Couleurs du thème actif (variables posées par appliquerTheme). */
const COULEURS = [0, 1, 2, 3, 4, 5].map((i) => `var(--c-domaine-${i})`);

/** Confettis + message, seulement pour un niveau ou des étoiles gagnés. */
export function Celebration({ c }: { c: C }) {
  if (!aCelebrer(c)) return null;
  return (
    <div class="celebration" role="status">
      <div class="confettis" aria-hidden="true">
        {Array.from({ length: 28 }, (_, i) => (
          <i key={i} style={{
            left: `${(i * 37) % 100}%`, background: COULEURS[i % COULEURS.length],
            animationDelay: `${(i % 7) * 60}ms`, animationDuration: `${900 + (i % 5) * 150}ms`,
          }} />
        ))}
      </div>
      {c.niveau !== null && <p class="grand">🎉 Niveau {c.niveau} !</p>}
      {c.etoiles > 0 && <p>⭐ +{c.etoiles} étoile{c.etoiles > 1 ? 's' : ''} à dépenser dans l'arbre</p>}
    </div>
  );
}
