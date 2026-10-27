import type { EntreeClassement } from '../jeu/classement';

/** Valeurs au format REST de Firestore. */
type Valeur =
  | { stringValue: string }
  | { integerValue: string }
  | { timestampValue: string }
  | { mapValue: { fields: Record<string, Valeur> } };

const texte = (v: string): Valeur => ({ stringValue: v });
const entier = (v: number): Valeur => ({ integerValue: String(Math.max(0, Math.round(v))) });

export function versFirestore(e: EntreeClassement): { fields: Record<string, Valeur> } {
  return {
    fields: {
      pseudo: texte(e.pseudo),
      avatar: texte(e.avatar),
      appareil: texte(e.appareil),
      niveau: entier(e.niveau),
      xp: entier(e.xp),
      xpSemaine: entier(e.xpSemaine),
      semaine: texte(e.semaine),
      duels: entier(e.duels),
      maj: { timestampValue: e.maj },
      records: { mapValue: { fields: Object.fromEntries(Object.entries(e.records).slice(0, 40).map(([k, v]) => [k, entier(v)])) } },
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Champs = Record<string, any>;

export function depuisFirestore(doc: { name: string; fields?: Champs }): EntreeClassement | null {
  const f: Champs = doc.fields ?? {};
  const s = (k: string): string | null => (typeof f[k]?.stringValue === 'string' ? f[k].stringValue : null);
  const n = (k: string, src: Champs = f): number | null => (src[k]?.integerValue !== undefined ? Number(src[k].integerValue) : null);
  const pseudo = s('pseudo');
  const avatar = s('avatar');
  if (!pseudo || !avatar) return null;
  const rec: Champs = f.records?.mapValue?.fields ?? {};
  return {
    id: doc.name.split('/').pop() ?? '',
    pseudo,
    avatar,
    appareil: s('appareil') ?? '',
    niveau: n('niveau') ?? 1,
    xp: n('xp') ?? 0,
    xpSemaine: n('xpSemaine') ?? 0,
    semaine: s('semaine') ?? '',
    records: Object.fromEntries(Object.keys(rec).flatMap((k) => { const v = n(k, rec); return v === null ? [] : [[k, v]]; })),
    duels: n('duels') ?? 0,
    maj: typeof f.maj?.timestampValue === 'string' ? f.maj.timestampValue : '',
  };
}
