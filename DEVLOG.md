# DEVLOG — Quiz Quest (eth-quiz-quest)

> **Point de reprise.** Si on travaille ailleurs (autre machine, session cloud, nouvelle conversation),
> on repart d'ici : état du projet, décisions, ce qui reste. À mettre à jour à chaque fin de session.

**Dernière mise à jour : 2026-10-27** — session cloud Nysa ↔ aangee (conception + V1 + lots 6, 7 et **8 (a, b, c)**).

---

## En une phrase

Quiz gamifié **hors ligne** (PWA) pour aangee (37 ans) et son fils Loulou (10 ans), sur Android et PC Windows :
quiz adaptatif par domaine, XP, arbre de compétences, 7 mini-jeux, duel (même appareil ou réseau par QR),
espace parent, classement famille en ligne (facultatif), animations et musique douce.

- **Jouer :** <https://aangee.github.io/eth-quiz-quest/> (déployé à chaque fusion sur `main`)
- **Code :** ce dépôt · **Conception :** dépôt `nysa-atlas`, `docs/superpowers/`
  - spec : `specs/2026-10-26-quiz-quest-design.md` (§0 à §17 — **la référence des décisions**)
  - plans : `plans/2026-10-2*-quiz-quest-lot*.md` (1, 2, 3a, 3b, 4, 5, 6, 7) + `plans/2026-10-27-quiz-quest-lot5-packs/`

## État au 2026-10-27

- `main` à jour : **PR #1 à #8 fusionnées**. Branche de travail : `claude/gamification-app-multidomains-0scl4l`.
- **172 tests** (`npm test`), `npx tsc --noEmit` et `npm run build` OK.
- **Lot 8 (thèmes et refonte visuelle : 8a, 8b, 8c) fait** sur la branche `nysa/wizardly-bardeen-ciuz3m` — **pas encore de PR**.
  La spec §18 et les plans 8a/8b/8c sont dans `nysa-atlas`, branche `nysa/wizardly-bardeen-ciuz3m`.
- **Classement famille installé** par aangee (projet Firebase `quiz-quest-famille`, forfait Spark) : les scores remontent.
- **Duel réseau validé sur les vrais appareils** (box Wi-Fi et partage de connexion).

## Historique des lots

| Lot | Contenu | PR |
|---|---|---|
| 1 — Socle | Vite + Preact + TS, packs JSON validés, difficulté adaptative (cible 75 %), XP, quiz solo, PWA, GitHub Pages | #1 |
| 2 — Progression | Étoiles, arbre (branches compétences + branches domaines générées), jokers, quêtes du jour/semaine, calendrier, bonne réponse affichée | #2 |
| 3a — Mini-jeux 1/2 | Chrono-éclair, Calcul éclair, Memory, Mot mystère ; records ; packs v2 (banque OTDB) | #3 |
| 3b + 4 + 5 | Frise, Qui suis-je ?, Étiquettes, Défis · Duel (même appareil + réseau WebRTC/QR) · Espace parent (PIN, packs, sauvegarde, profils) + 4 domaines | #4 |
| Correctif QR | Code d'appairage compact (103 car.) → QR 33×33 au lieu de 93×93 (le grand n'était pas lu) | #5 |
| Correctifs + contenu | Adresses réseau (cartes virtuelles Windows) + diagnostic · 153 explications « réponse + pourquoi » · récap « À retenir » · **Lot 6 classement** | #6 |
| 7 — Animations | Animations CSS, confettis (niveau/étoile seulement), barre de temps, Memory 3D, musique douce des menus | #7 |
| Doc | `docs/FIREBASE.md` adapté à la nouvelle console Firebase | #8 |
| 8a — Socle des thèmes | Contrat `Theme` testé (contrastes ≥ 4,5), registre, thème `neon` (Orbitron / Exo 2 embarquées), thème par profil, `style.css` sur variables, ~40 icônes SVG à la place des emojis (sauf avatars) | — |
| 8b — Mise en page | Barre de navigation (Carte · Jeux · Arbre · Classement · Profil), carte d'accueil (étapes en zigzag, décor du thème, quête du jour), onglet Profil, duel dans Jeux, champ `icone` des packs, quiz lisible (lettres A–D, bonne/mauvaise réponse en couleur + symbole) | — |
| 8c — Thèmes | Thèmes `survie` (Aventure survie) et `bdpop` (BD Pop, clair), choix du thème à la création (aperçu en direct) et dans l'onglet Profil, guide `src/themes/AJOUTER-UN-THEME.md` | — |

## Décisions à ne pas oublier (détails dans la spec)

- **Hors ligne d'abord** ; pas d'IA dans l'app. Les questions viennent de **packs JSON** (`packs/`, format dans `packs/PROMPT-IA.md`).
- **Contenu** : 6 domaines, 291 éléments. Une partie vient d'**Open Trivia Database (CC BY-SA 4.0)** → crédit dans le README
  et champ `source` des packs ; les packs qui en contiennent restent sous CC BY-SA. Deux relectures factuelles faites
  (lot 5 : 4 corrections, dont Pluton/Russie ; explications : 4 corrections).
- **Explications** : affichées après une réponse (quiz, Mot mystère, Frise, Qui suis-je ?, Étiquettes) et dans le récap
  de fin de mini-jeu ; **jamais** dans le Memory, le Chrono-éclair ni le duel (la vitesse prime).
- **Arbre** : un seul arbre — branches compétences fixes + une branche par domaine générée depuis le pack ;
  les étoiles (1 par niveau de domaine) forment une réserve commune ; récompenses = mini-jeux et jokers seulement.
- **Pas de série (streak)** : un calendrier des objectifs, sans pénalité. Pas de récompense au hasard.
- **Duel réseau** : WebRTC sans serveur ni STUN ; code d'appairage binaire en base 32 (`src/net/signal.ts`, préfixe `Q2`) ;
  jusqu'à 6 IPv4 privées annoncées ; caméra demandée avant l'offre (adresses réelles au lieu de mDNS).
- **Classement famille** : Firebase par **API REST** (pas de SDK), connexion anonyme ; **toujours** publié pour chaque profil
  (pas d'option de retrait) ; **jamais de vrai nom ni d'âge** (le champ s'appelle « Pseudo ») ; code famille par QR (`QQF1:`).
  JSONBin écarté (10 000 requêtes au total, non rechargées).
- **Musique** : générée par l'app (Web Audio), **seulement dans les menus**, bouton 🎵/🔇, démarre au premier toucher.
- **Animations** : courtes, CSS ; confettis seulement pour un niveau ou une étoile ; `prefers-reduced-motion` respecté.
- **Thèmes** (spec §18, maquettes <https://claude.ai/artifact/GwmeK2ZyJ4Hpht9wDtBwZj>) : un thème = un dossier `src/themes/<id>/`
  + une ligne dans `registre.ts` (objet `Theme` : couleurs, polices, formes, `textes`, `DecorCarte`) ; `themes.test.ts` vérifie chaque thème (champs, contrastes). Les écrans n'utilisent que
  les variables `--c-*`, `--police-*`, `--rayon`, `--bord`, `--ombre`. Thème choisi **par profil** ; 3 thèmes :
  Néon arcade, Aventure survie, BD Pop (clair). Icônes : `src/ui/Icone.tsx` ; les emojis ne restent que pour les avatars.

## Architecture (repères)

- `src/jeu/` : logique pure testée (adaptation, xp, partie, quêtes, jokers, arbre, mini-jeux, calcul, mot, memory,
  frise, qui, étiquettes, duel, pin, sauvegarde, classement, célébration).
- `src/packs/` : validation, fusion par version (`fusion.ts`), packs intégrés + importés (`installerPacks`).
- `src/net/` : duel (`signal`, `connexion`, `protocole`), classement (`famille`, `firestore`, `classementEnLigne`).
- `src/son/musique.ts` : synthétiseur des menus. `src/stockage.ts` : IndexedDB (profils, semaine, packs, PIN, famille).
- `src/ecrans/` : écrans Preact ; `App.tsx` = machine à états des écrans (pas de routeur).

## À tester / retours attendus d'aangee

- 🎵 **Écouter la musique** (jamais entendue côté Nysa) : volume, tempo, accords à ajuster si besoin.
- 🎉 Confettis à une montée de niveau ; « 📅 Semaine » du classement qui repart à zéro le lundi.
- Ajouter les autres appareils au classement (Espace parent › Classement famille › Rejoindre › scanner le QR).

## Prochaines étapes

- **PR du lot 8 vers `main`** (avec l'accord d'aangee), puis tests sur les vrais appareils (les 3 thèmes, la carte, la barre).
- Ajouter un thème : suivre `src/themes/AJOUTER-UN-THEME.md`.

## Prochaines idées (non commencées)

1. 🔗 **« Lier ce profil »** : fusionner un même joueur présent sur plusieurs appareils (prévu au lot 6, « plus tard »).
2. 📚 Plus de packs / domaines (guide `packs/PROMPT-IA.md` + relecture factuelle avant publication).
3. 🎵 Retouches de la musique après écoute.
4. 🎮 **V2 Godot** (spec §9) : découverte LAN automatique, plus d'appairage QR ; 5 mini-jeux restants
   (Mot mélangé, Jeu du 24, Planisphère, Sudoku/KenKen, Liste qui s'allonge).

## Reprendre le travail

1. `git pull` dans ce dépôt **et** dans `nysa-atlas` ; lire ce DEVLOG puis la spec (`§0` à `§17`).
2. `npm install && npm test && npm run build` (attendu : 172 tests OK).
3. Pour une nouvelle fonctionnalité : brainstorm (skill `brainstorming` de `nysa-plugins`) → section de spec → plan
   `docs/superpowers/plans/AAAA-MM-JJ-quiz-quest-<lot>.md` → exécution → PR vers `main`.
4. Sur aaee-katana : lancer `/nysa-boot` depuis le dossier du projet (`L:/CORE/labs/eth-quiz-quest`, à confirmer) pour
   créer sa mémoire `reprise/`, et `/nysa-close` en fin de session.
5. Règle d'or (CLAUDE.md) : rien n'est commité ni poussé sans l'accord d'aangee.
