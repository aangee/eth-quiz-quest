import { THEMES } from '../themes/registre';

/** Vignettes d'aperçu des thèmes ; chacune est dessinée avec les couleurs, la police et la forme de son thème. */
export function ChoixTheme({ valeur, onChoisir }: { valeur: string; onChoisir: (id: string) => void }) {
  return (
    <div class="choix-theme" role="radiogroup" aria-label="Thème">
      {THEMES.map((t) => {
        const c = t.couleurs;
        const choisi = t.id === valeur;
        return (
          <button key={t.id} role="radio" aria-checked={choisi} class={choisi ? 'vignette choisie' : 'vignette'} onClick={() => onChoisir(t.id)}>
            <span class="apercu" aria-hidden="true" style={{ background: c.fond, borderColor: c.bord, borderRadius: `${t.forme.rayon}px` }}>
              <span class="apercu-titre" style={{ color: c.texte, fontFamily: t.polices.titre }}>{t.textes.titreCarte}</span>
              <span class="apercu-pastilles">
                {t.couleursDomaines.slice(0, 3).map((d) => (
                  <i key={d} style={{ borderColor: d, background: t.clair ? d : c.surface }} />
                ))}
              </span>
              <span class="apercu-bouton" style={{ background: c.accent, color: c.surAccent, fontFamily: t.polices.titre,
                borderRadius: `${t.forme.rayon}px`, boxShadow: t.forme.ombre }}>{t.textes.suite}</span>
            </span>
            <span class="vignette-nom">{t.nom}</span>
            <small>{t.description}</small>
          </button>
        );
      })}
    </div>
  );
}
