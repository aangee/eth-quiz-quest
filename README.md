# ⭐ Quiz Quest

Quiz gamifié hors ligne pour jouer en famille : XP, niveaux, difficulté adaptée à chacun.

**Jouer :** https://aangee.github.io/eth-quiz-quest/
Ouvrir une fois avec internet, puis « Installer » (Chrome Android : menu ⋮ › Installer l'application ;
Chrome/Edge PC : icône d'installation dans la barre d'adresse). Ensuite tout marche hors ligne.

## Ajouter des questions

1. Faire générer un pack par une IA avec `packs/PROMPT-IA.md`
2. Déposer le fichier dans `packs/` et lancer `npm test` (vérifie le pack)
3. Commit + push sur `main` → l'app se met à jour

## Développer

    npm install
    npm run dev     # http://localhost:5173/eth-quiz-quest/
    npm test

## Classement famille (facultatif)

Scores partagés entre les appareils de la famille, via Firebase (gratuit) : voir [docs/FIREBASE.md](docs/FIREBASE.md).
Le jeu reste jouable hors ligne ; seuls les pseudos et les scores sont envoyés (jamais de vrai nom ni d'âge).

## Crédits

Une partie des questions est adaptée de l'[Open Trivia Database](https://opentdb.com)
(licence [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)) ; les packs qui en contiennent
sont publiés sous la même licence (voir le champ `source` de chaque pack).
