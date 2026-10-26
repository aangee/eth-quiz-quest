# eth-quiz-quest

Quiz gamifié hors ligne (PWA) pour aangee et son fils.

- Spec et plans : dépôt `nysa-atlas`, `docs/superpowers/specs/2026-10-26-quiz-quest-design.md`
  et `docs/superpowers/plans/2026-10-26-quiz-quest-*.md`
- `src/jeu/` et `src/packs/` : logique pure, toujours testée (`npm test`)
- `packs/*.json` : questions ; format dans `packs/PROMPT-IA.md`
- Jamais d'IA ni d'appel réseau dans l'app : elle doit tourner hors ligne
- Répondre en français ; ne jamais committer/pusher sans accord d'aangee
