# Ajouter un thème

Un thème = **un dossier** `src/themes/<id>/` + **une ligne** dans `registre.ts`. Aucun écran à modifier.

## Pas à pas

1. **Copier** un dossier existant le plus proche (`neon`, `survie` ou `bdpop` pour un thème clair) vers
   `src/themes/<id>/`. L'id : minuscules, chiffres et tirets (`ocean`, `foret-magique`).
2. **`index.ts`** — l'objet `Theme` (contrat dans `types.ts`) :
   - `id`, `nom`, `description` (montrés dans le choix du thème), `clair` (`true` si fond clair) ;
   - `couleurs` : les 13 jetons sémantiques (`fond`, `surface`, `texte`, `accent` / `surAccent`, `ok` / `surOk`…).
     `surX` = couleur du texte posé **sur** X ;
   - `couleursDomaines` : au moins 6 couleurs (pastilles de la carte, confettis) ;
   - `polices` : familles CSS **titre** et **texte** ; les importer en tête du fichier
     (`npm install @fontsource/<police>` puis `import '@fontsource/<police>/latin-<graisse>.css'`) ;
   - `forme` : `rayon` et `bord` (px), `ombre` (`box-shadow`) ;
   - `textes` : `titreCarte`, `titreJoueur`, `bravo`, `suite` ;
   - `DecorCarte` : le décor de la carte d'accueil.
3. **`DecorCarte.tsx`** — un `<svg class="decor-carte">` en `viewBox="0 0 100 hauteur"` avec
   `preserveAspectRatio="none"` : x en % de la largeur, y en px. `cheminLisse(points)` donne le chemin entre les
   étapes ; mettre `vector-effect="non-scaling-stroke"` sur les traits. `aria-hidden="true"`.
4. **`theme.css`** — les ornements (textures, lueurs, ombres, polices des étapes…). **Chaque règle** commence par
   `:root[data-theme="<id>"]`. Pour un fond décoré, le poser sur `:root[data-theme="<id>"]` et rendre
   `body` transparent.
5. **`registre.ts`** — importer le thème et l'ajouter à `THEMES`.
6. **`npm test`** — `themes.test.ts` vérifie le nouveau thème tout seul : champs complets, id unique, ≥ 6 couleurs de
   domaine, textes, décor, et **contrastes** (≥ 4,5:1 pour les textes, ≥ 3:1 pour les couleurs de domaine sur le
   fond). Un thème illisible ne passe pas.
7. **Regarder** : `npm run dev`, créer un joueur avec le thème, parcourir Carte, quiz, Jeux, Arbre, Classement, Profil.

## Règles

- **Jamais de couleur dans les écrans** (`src/ecrans/`) : seulement les variables `--c-*`, `--police-*`, `--rayon`,
  `--bord`, `--ombre` et les classes sémantiques. Une couleur propre au thème va dans son `theme.css`.
- **Polices embarquées** (paquets `@fontsource`) : jamais de chargement depuis Internet, l'app doit marcher hors ligne.
  Les `woff2` sont mis en cache par le service worker (`vite.config.ts`).
- Pas d'animation qui ignore `prefers-reduced-motion`.
- Les emojis restent réservés aux avatars ; les icônes viennent de `src/ui/icones.ts`.
