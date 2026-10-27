import { useState } from 'preact/hooks';
import type { Profil } from '../types';
import {
  debloquer, descriptionRecompense, vueArbre, type MiniJeu, type Noeud, type NoeudVue, type BrancheVue,
} from '../jeu/arbre';
import { JEUX_DISPONIBLES } from '../jeu/minijeux';
import { iconeDuDomaine } from '../packs';
import { useTheme } from '../themes/contexte';
import { Icone } from '../ui/Icone';
import { Fiche } from '../ui/Fiche';
import type { NomIcone } from '../ui/icones';

const ICONES_BRANCHES: Record<string, NomIcone> = { 'Rapidité': 'eclair', 'Mémoire et mots': 'livre', 'Savoir': 'ampoule' };
const ICONES_JEUX: Record<MiniJeu, NomIcone> = {
  chrono: 'chrono', calcul: 'plus', memory: 'jeux', mot: 'livre', frise: 'horloge', qui: 'profil', etiquettes: 'quete',
};

function iconeNoeud(n: Noeud): NomIcone {
  const r = n.recompense;
  return r.type === 'minijeu' ? ICONES_JEUX[r.jeu] : r.type === 'defi' ? 'trophee' : 'joker';
}

const LIBELLES_ETAT = { fait: 'débloqué', prochain: 'à débloquer', trop_cher: 'pas assez d\'étoiles', ferme: 'fermé' };

/** Une rangée de nœuds reliés ; le trait se colore jusqu'au dernier nœud fait. */
function Rangee({ branche, dernier, onOuvrir }: { branche: BrancheVue; dernier: string | null; onOuvrir: (id: string) => void }) {
  const pct = branche.total > 1 ? Math.max(0, (branche.faits - 1) / (branche.total - 1)) * 100 : 0;
  return (
    <div class="rangee-noeuds">
      <span class="trait" aria-hidden="true"><span class="trait-fait" style={{ width: `${pct}%` }} /></span>
      {branche.noeuds.map((v) => (
        <button key={v.noeud.id} class={`noeud-rond ${v.etat}${v.noeud.id === dernier ? ' nouveau' : ''}`}
          aria-label={`${v.noeud.nom} : ${LIBELLES_ETAT[v.etat]}`} onClick={() => onOuvrir(v.noeud.id)}>
          <span class="rond"><Icone nom={v.etat === 'ferme' ? 'cadenas' : iconeNoeud(v.noeud)} taille={26} /></span>
          {v.etat === 'fait' && <span class="coche" aria-hidden="true"><Icone nom="valider" taille={14} /></span>}
          {(v.etat === 'prochain' || v.etat === 'trop_cher') && (
            <span class="prix" aria-hidden="true">{v.noeud.cout} <Icone nom="etoile" pleine taille={12} /></span>
          )}
          <span class="nom">{v.noeud.nom}</span>
        </button>
      ))}
    </div>
  );
}

export function EcranArbre({ profil, arbre, onMaj, onJouer, onDefi }: {
  profil: Profil; arbre: Noeud[]; onMaj: (p: Profil) => void;
  onJouer: (jeu: MiniJeu) => void; onDefi: (jeu: MiniJeu, domaine: string) => void;
}) {
  const theme = useTheme();
  const [dernier, setDernier] = useState<string | null>(null);
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [fiche, setFiche] = useState<string | null>(null);
  const { dispo, branches } = vueArbre(profil, arbre);
  const competences = branches.filter((b) => !b.domaine);
  const domaines = branches.filter((b) => b.domaine);
  const vue: NoeudVue | undefined = branches.flatMap((b) => b.noeuds).find((v) => v.noeud.id === fiche);

  const titreBranche = (b: BrancheVue) => (
    <>
      <Icone nom={b.domaine ? iconeDuDomaine(b.domaine) : ICONES_BRANCHES[b.nom] ?? 'arbre'} />
      <span>{b.nom}</span>
      <small>{b.faits}/{b.total}</small>
    </>
  );

  return (
    <main class="ecran arbre-competences">
      <h1>{theme.textes.titreArbre}</h1>
      <div class="reserve">
        <Icone nom="etoile" pleine taille={34} />
        <div>
          <strong>{dispo} étoile{dispo > 1 ? 's' : ''} {theme.textes.reserve}</strong>
          <small>1 étoile = 1 niveau gagné dans un domaine</small>
        </div>
      </div>

      {competences.map((b) => (
        <section key={b.nom} class="branche-arbre">
          <h3 class="titre-branche">{titreBranche(b)}</h3>
          <Rangee branche={b} dernier={dernier} onOuvrir={setFiche} />
        </section>
      ))}

      {domaines.length > 0 && (
        <section class="branche-arbre">
          <h3 class="titre-branche"><Icone nom="geographie" /><span>Domaines</span><small>défis et jokers Expert</small></h3>
          {domaines.map((b) => {
            const estOuvert = ouvert === b.nom;
            return (
              <div key={b.nom} class="accordeon">
                <button class="tete-accordeon" aria-expanded={estOuvert} onClick={() => setOuvert(estOuvert ? null : b.nom)}>
                  {titreBranche(b)}<Icone nom={estOuvert ? 'bas' : 'suivant'} />
                </button>
                {estOuvert && <Rangee branche={b} dernier={dernier} onOuvrir={setFiche} />}
              </div>
            );
          })}
        </section>
      )}

      {vue && (() => {
        const n = vue.noeud;
        const d = descriptionRecompense(n);
        const r = n.recompense;
        const jouable = r.type === 'defi' || (r.type === 'minijeu' && JEUX_DISPONIBLES.includes(r.jeu));
        return (
          <Fiche titre={n.nom} onFermer={() => setFiche(null)}>
            <p class="type-recompense"><Icone nom={iconeNoeud(n)} /> {d.type}</p>
            <p>{d.phrase}</p>
            {vue.etat === 'fait' && (
              <>
                <p class="etat-fiche ok"><Icone nom="valider" /> Débloqué !</p>
                {jouable && (
                  <button class="principal" onClick={() => (r.type === 'defi' ? onDefi(r.jeu, r.domaine) : r.type === 'minijeu' && onJouer(r.jeu))}>
                    Jouer <Icone nom="suivant" />
                  </button>
                )}
              </>
            )}
            {vue.etat === 'prochain' && (
              <button class="principal" onClick={() => { setDernier(n.id); onMaj(debloquer(profil, n, arbre)); }}>
                Débloquer · {n.cout} <Icone nom="etoile" pleine />
              </button>
            )}
            {vue.etat === 'trop_cher' && (
              <p class="etat-fiche">Il te manque {n.cout - dispo} <Icone nom="etoile" pleine /> : gagne un niveau dans un domaine.</p>
            )}
            {vue.etat === 'ferme' && (
              <p class="etat-fiche"><Icone nom="cadenas" /> Débloque d'abord : {vue.manquants
                .map((m) => (m.branche !== n.branche ? `${m.nom} (${m.branche})` : m.nom)).join(', ')}</p>
            )}
            {vue.suivant && <small class="ensuite">Ensuite : {vue.suivant.nom} ({vue.suivant.cout} <Icone nom="etoile" pleine taille={12} />)</small>}
          </Fiche>
        );
      })()}
    </main>
  );
}
