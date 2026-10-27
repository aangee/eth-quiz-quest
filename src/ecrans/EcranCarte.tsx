import type { Noeud } from '../jeu/arbre';
import { etoilesDispo } from '../jeu/arbre';
import { niveauDepuisXp, seuil } from '../jeu/xp';
import { positionsCarte } from '../jeu/carte';
import { domaines, iconeDuDomaine } from '../packs';
import { useTheme } from '../themes/contexte';
import { Icone } from '../ui/Icone';
import type { Profil } from '../types';

/** Accueil : le joueur et la carte des domaines (une étape par domaine). */
export function EcranCarte({ profil, arbre, onJouer }: {
  profil: Profil; arbre: Noeud[]; onJouer: (domaines: string[]) => void;
}) {
  const theme = useTheme();
  const niv = niveauDepuisXp(profil.xp);
  const pct = Math.round((100 * (profil.xp - seuil(niv))) / (seuil(niv + 1) - seuil(niv)));
  const { points, hauteur } = positionsCarte(domaines.length);
  const quetes = new Set(profil.quetes.liste.filter((q) => q.type === 'justes_domaine' && q.progres < q.cible).map((q) => q.domaine));
  const { DecorCarte } = theme;
  return (
    <main class="ecran avec-barre">
      <header class="entete-joueur">
        <span class="avatar-rond" aria-hidden="true">{profil.avatar}</span>
        <div class="identite">
          <strong>{profil.prenom}</strong>
          <small>Niveau {niv} · {theme.textes.titreJoueur}</small>
        </div>
        <span class="compteur-etoiles" title="Étoiles à dépenser dans l'arbre">
          <Icone nom="etoile" pleine /> {etoilesDispo(profil, arbre)}
        </span>
      </header>
      <div class="jauge" role="progressbar" aria-label="XP vers le niveau suivant" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div style={{ width: `${pct}%` }} />
      </div>
      <small class="xp-texte">{profil.xp - seuil(niv)} / {seuil(niv + 1) - seuil(niv)} XP</small>

      <h1 class="titre-carte">{theme.textes.titreCarte}</h1>
      <div class="carte-monde" style={{ height: `${hauteur}px` }}>
        <DecorCarte points={points} hauteur={hauteur} />
        {domaines.map((d, i) => (
          <button key={d} class="etape" style={{ left: `${points[i].x}%`, top: `${points[i].y}px`, '--couleur': `var(--c-domaine-${i % 6})` }}
            onClick={() => onJouer([d])}>
            <span class="pastille"><Icone nom={iconeDuDomaine(d)} taille={34} /></span>
            <span class="nom-etape">{d}</span>
            <small>Niv. {niveauDepuisXp(profil.xpDomaine[d] ?? 0)}</small>
            {quetes.has(d) && <span class="badge"><Icone nom="quete" taille={14} /> Quête du jour</span>}
          </button>
        ))}
      </div>
      <button class="principal" onClick={() => onJouer(domaines)}><Icone nom="melanger" /> Tout mélanger</button>
    </main>
  );
}
