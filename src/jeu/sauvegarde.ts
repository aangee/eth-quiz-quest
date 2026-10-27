import type { Pack, Profil, QueteSemaine } from '../types';
import { normaliserProfil } from './profil';
import { dateDuJour } from './quetes';
import { validerPack } from '../packs/valider';

export interface Sauvegarde {
  app: 'quiz-quest';
  version: 1;
  date: string;
  profils: Profil[];
  semaine: QueteSemaine | null;
  packs: Pack[];
}

export function creerSauvegarde(profils: Profil[], semaine: QueteSemaine | null, packs: Pack[], date: Date = new Date()): Sauvegarde {
  return { app: 'quiz-quest', version: 1, date: date.toISOString(), profils, semaine, packs };
}

export function nomFichierSauvegarde(date: Date = new Date()): string {
  return `quiz-quest-sauvegarde-${dateDuJour(date)}.json`;
}

/** Lit un fichier de sauvegarde ; écarte ce qui est abîmé au lieu de tout refuser. */
export function lireSauvegarde(data: unknown): { sauvegarde: Sauvegarde } | { erreur: string } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any;
  if (!d || d.app !== 'quiz-quest' || d.version !== 1) return { erreur: "Ce fichier n'est pas une sauvegarde Quiz Quest." };
  if (!Array.isArray(d.profils)) return { erreur: 'Sauvegarde abîmée : profils manquants.' };
  const profils = d.profils
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((p: any) => p && typeof p.id === 'string' && typeof p.prenom === 'string' && typeof p.avatar === 'string' && Number.isInteger(p.age))
    .map(normaliserProfil);
  const packs = (Array.isArray(d.packs) ? d.packs : []).flatMap((x: unknown) => {
    const r = validerPack(x);
    return r.pack ? [r.pack] : [];
  });
  const s = d.semaine;
  const semaine = s && typeof s.semaine === 'string' && typeof s.progres === 'number' && typeof s.cible === 'number' ? (s as QueteSemaine) : null;
  return { sauvegarde: { app: 'quiz-quest', version: 1, date: String(d.date ?? ''), profils, semaine, packs } };
}
