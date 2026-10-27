# eth-quiz-quest

Quiz gamifié hors ligne (PWA) pour aangee et son fils.

- **Point de reprise : `DEVLOG.md`** (état, décisions, prochaines étapes) — à lire en premier, à mettre à jour en fin de session
- Spec et plans : dépôt `nysa-atlas`, `docs/superpowers/specs/2026-10-26-quiz-quest-design.md`
  et `docs/superpowers/plans/2026-10-2*-quiz-quest-*.md`
- `src/jeu/` et `src/packs/` : logique pure, toujours testée (`npm test`)
- `packs/*.json` : questions ; format dans `packs/PROMPT-IA.md`
- Jamais d'IA dans l'app ; elle doit tourner hors ligne. Seuls appels réseau : le classement famille
  (Firebase, facultatif) et le duel en réseau local — le jeu ne doit jamais en dépendre
- Répondre en français ; ne jamais committer/pusher sans accord d'aangee
