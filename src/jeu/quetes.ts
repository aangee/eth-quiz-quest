import type { Profil, Quete, QueteSemaine } from '../types';
import { ajouterCharge, jokerARecharger } from './jokers';

const deux = (n: number) => String(n).padStart(2, '0');

/** Date locale « AAAA-MM-JJ ». */
export function dateDuJour(d: Date = new Date()): string {
  return `${d.getFullYear()}-${deux(d.getMonth() + 1)}-${deux(d.getDate())}`;
}

/** Semaine ISO « AAAA-Snn » (lundi → dimanche). */
export function semaineDe(d: Date = new Date()): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7)); // jeudi de la semaine
  const an = t.getUTCFullYear();
  const num = Math.ceil(((t.getTime() - Date.UTC(an, 0, 1)) / 86400000 + 1) / 7);
  return `${an}-S${deux(num)}`;
}

function hash(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export function genererQuetes(date: string, domaines: string[]): Quete[] {
  const domaine = domaines.length ? domaines[hash(date) % domaines.length] : undefined;
  return [
    { id: 'q1', type: 'justes_domaine', domaine, cible: 5, progres: 0 },
    { id: 'q2', type: 'finir_quiz', cible: 1, progres: 0 },
    { id: 'q3', type: 'rapides', cible: 5, progres: 0 },
  ];
}

export function libelleQuete(q: Quete): string {
  switch (q.type) {
    case 'justes_domaine': return `${q.cible} bonnes réponses${q.domaine ? ` en ${q.domaine}` : ''}`;
    case 'finir_quiz': return 'Finir un quiz';
    case 'rapides': return `${q.cible} bonnes réponses rapides`;
  }
}

/** Nouvelles quêtes si le jour a changé, sinon le profil tel quel. */
export function majJour(p: Profil, date: string, domaines: string[]): Profil {
  return p.quetes.date === date ? p : { ...p, quetes: { date, liste: genererQuetes(date, domaines) } };
}

export type Evenement =
  | { type: 'reponse'; domaine: string; juste: boolean; rapide: boolean }
  | { type: 'fin_quiz' };

function compte(q: Quete, ev: Evenement): boolean {
  if (ev.type === 'fin_quiz') return q.type === 'finir_quiz';
  if (!ev.juste) return false;
  if (q.type === 'justes_domaine') return !q.domaine || q.domaine === ev.domaine;
  if (q.type === 'rapides') return ev.rapide;
  return false;
}

/** Fait avancer les quêtes ; quête finie → +1 charge ; les 3 finies → jour coché. */
export function avancerQuetes(p: Profil, ev: Evenement): Profil {
  let r = p;
  const liste = p.quetes.liste.map((q) => {
    if (q.progres >= q.cible || !compte(q, ev)) return q;
    const n = { ...q, progres: q.progres + 1 };
    if (n.progres >= n.cible) {
      const j = jokerARecharger(r);
      if (j) r = ajouterCharge(r, j);
    }
    return n;
  });
  r = { ...r, quetes: { ...p.quetes, liste } };
  const toutes = liste.length > 0 && liste.every((q) => q.progres >= q.cible);
  if (toutes && !r.calendrier.includes(p.quetes.date)) r = { ...r, calendrier: [...r.calendrier, p.quetes.date] };
  return r;
}

export const CIBLE_SEMAINE = 30;

export function majSemaine(qs: QueteSemaine | undefined, semaine: string): QueteSemaine {
  return qs && qs.semaine === semaine ? qs : { semaine, cible: CIBLE_SEMAINE, progres: 0, recompensee: false };
}

/** Ajoute des bonnes réponses ; `terminee` n'est vrai qu'une fois par semaine. */
export function avancerSemaine(qs: QueteSemaine, justes: number): { semaine: QueteSemaine; terminee: boolean } {
  const progres = Math.min(qs.cible, qs.progres + justes);
  const terminee = progres >= qs.cible && !qs.recompensee;
  return { semaine: { ...qs, progres, recompensee: qs.recompensee || terminee }, terminee };
}
