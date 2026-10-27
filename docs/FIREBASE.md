# Installer le classement famille (Firebase, gratuit)

À faire **une seule fois**, par un parent, avec un compte Google (≈ 10 min). La famille n'a besoin d'aucun compte.

1. Ouvrir <https://console.firebase.google.com> → **Ajouter un projet** → nom : `quiz-quest-famille`
   → désactiver Google Analytics → **Créer**.
2. Menu **Créer › Authentication** → **Commencer** → onglet **Sign-in method** → **Anonyme** → **Activer** → **Enregistrer**.
3. Menu **Créer › Firestore Database** → **Créer une base de données** → emplacement en Europe (ex. `europe-west`)
   → **Démarrer en mode production** → **Créer**.
4. Onglet **Règles** de Firestore → remplacer tout le texte par celui ci-dessous → **Publier**.
5. ⚙️ **Paramètres du projet › Général** → « Vos applications » → icône **Web `</>`** → nom `quiz-quest` → **Enregistrer**
   (pas besoin de Firebase Hosting). Noter **`projectId`** et **`apiKey`** dans le bloc de configuration affiché.
6. Dans l'app : 🔒 **Espace parent › Classement famille › Créer le classement** → coller l'ID du projet et la clé
   → nommer l'appareil → **Créer et tester**.
7. Sur chaque autre appareil : Espace parent › Classement famille › **Rejoindre** → scanner le QR affiché sur le premier.

La clé d'API web de Firebase n'est pas un secret (elle identifie seulement le projet) ; ce qui protège la famille,
c'est le **code famille** de 24 caractères, présent seulement dans le QR. Le plan gratuit (Spark) suffit largement.

## Règles Firestore

