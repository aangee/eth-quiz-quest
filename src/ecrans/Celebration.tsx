import { aCelebrer, type Celebration as C } from '../jeu/celebration';

const COULEURS = ['#ffc83d', '#3ecf8e', '#ff6b6b', '#7aa7ff', '#f4f1ff'];

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
