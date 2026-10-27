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
