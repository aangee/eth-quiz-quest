# Générer un pack de questions avec une IA

Copier le texte ci-dessous dans n'importe quelle IA, en remplaçant `<DOMAINE>` et `<NOMBRE>`.

---

Génère un pack de questions de quiz en français sur le domaine « <DOMAINE> », pour un jeu
joué par un enfant de 10 ans et un adulte. Réponds **uniquement** avec un JSON valide, sans texte autour.

Format :

```json
{
  "pack": "<domaine-en-minuscules>-v1",
  "domaine": "<DOMAINE>",
  "version": 1,
  "questions": [ ... ]
}
```

Chaque question a toujours : `id` (unique, ex. `geo-001`), `type`, `niveau` (entier 1 à 5),
`age_min` (âge minimum, entier), `explication` (une phrase qui apprend quelque chose, ou `""`).

Types possibles :

| type | champs en plus |
|---|---|
| `qcm` | `question`, `choix` (2 à 4 textes), `reponse` (index du bon choix, 0 = premier) |
| `vrai_faux` | `question`, `reponse` (`true` ou `false`) |
| `ordre` | `question`, `elements` (au moins 3, **dans le bon ordre**) |
| `mot` | `indice`, `reponse` (un mot en MAJUSCULES, sans Œ ni Æ ; tirets acceptés) |
| `paires` | `question`, `paires` (au moins 2 couples `["a", "b"]`) |
| `indices` | `indices` (au moins 2, du plus vague au plus précis), `reponse` |

(Le type `etiquettes` demande une image : ne pas le générer.)

Règles :
- <NOMBRE> questions, réparties sur les niveaux 1 à 5 (1 = facile pour 7 ans, 5 = difficile pour un adulte).
- Faits **vérifiables** uniquement ; pas de question piège ni d'opinion.
- Varier les types ; au moins la moitié en `qcm` ou `vrai_faux`.
- `explication` courte, adaptée à un enfant, qui **redonne la bonne réponse** (ex. « Mercure, à 58 millions de km du Soleil. »).
