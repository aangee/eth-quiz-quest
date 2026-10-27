# Installer le classement famille (Firebase, gratuit)

À faire **une seule fois**, par un parent, avec un compte Google (≈ 10 min). La famille n'a besoin d'aucun compte.

> La console Firebase change souvent de présentation. Si un menu n'est pas au même endroit, utilise la barre
> **🔍 Rechercher des produits** en haut à gauche et tape le nom (« Authentication », « Firestore »).

1. Ouvrir <https://console.firebase.google.com> → **Créer un projet** → nom : `quiz-quest-famille`
   → désactiver Google Analytics → **Créer**. Le projet affiche « Forfait Spark » (gratuit) : c'est le bon.
2. **Connexion anonyme** : menu de gauche **Sécurité › Authentication** (ou rechercher « Authentication »)
   → **Commencer** → onglet **Méthode de connexion** (*Sign-in method*) → **Anonyme** → activer → **Enregistrer**.
3. **Base de données** : menu **Bases de données et stockage › Firestore** (ou rechercher « Firestore »)
   → **Créer une base de données** → édition **Standard** si on te le demande → emplacement en Europe
   (ex. `eur3 (europe)` ou `europe-west1`) → **mode production** → **Créer**.
4. Dans Firestore, onglet **Règles** → remplacer tout le texte par celui ci-dessous → **Publier**.
5. **Clé de l'app** : retour à la **Vue d'ensemble du projet** → bouton **+ Ajouter une application** → icône **Web `</>`**
   → nom `quiz-quest` → **Enregistrer l'application** (ne pas cocher Firebase Hosting). Dans le bloc de code affiché
   (`const firebaseConfig = { … }`), noter **`projectId`** (ex. `quiz-quest-famille`) et **`apiKey`** (commence par `AIza`).
   On les retrouve plus tard dans ⚙️ **Paramètres › Paramètres du projet › Général**, en bas, « Vos applications ».
6. Dans l'app : 🔒 **Espace parent › Classement famille › Créer le classement** → coller l'ID du projet et la clé
   → nommer l'appareil → **Créer et tester**.
7. Sur chaque autre appareil : Espace parent › Classement famille › **Rejoindre** → scanner le QR affiché sur le premier.

En cas de « Firebase ne répond pas » : vérifier que la connexion **Anonyme** est bien activée (étape 2), que les
**règles** sont publiées (étape 4), et que l'ID du projet est celui de `projectId` (sans majuscules).

La clé d'API web de Firebase n'est pas un secret (elle identifie seulement le projet) ; ce qui protège la famille,
c'est le **code famille** de 24 caractères, présent seulement dans le QR. Le plan gratuit (Spark) suffit largement.

## Règles Firestore

