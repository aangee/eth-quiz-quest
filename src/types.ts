export type TypeQuestion =
  | 'qcm' | 'vrai_faux' | 'ordre' | 'mot' | 'paires' | 'etiquettes' | 'indices';

interface Base {
  id: string;
  type: TypeQuestion;
  niveau: number;
  age_min: number;
  explication: string;
}

export interface QCM extends Base { type: 'qcm'; question: string; choix: string[]; reponse: number }
export interface VraiFaux extends Base { type: 'vrai_faux'; question: string; reponse: boolean }
export interface Ordre extends Base { type: 'ordre'; question: string; elements: string[] }
export interface Mot extends Base { type: 'mot'; indice: string; reponse: string }
export interface Paires extends Base { type: 'paires'; question: string; paires: [string, string][] }
export interface Etiquettes extends Base {
  type: 'etiquettes'; question: string; image: string;
  zones: { label: string; x: number; y: number }[];
}
export interface Indices extends Base { type: 'indices'; indices: string[]; reponse: string }

export type Question = QCM | VraiFaux | Ordre | Mot | Paires | Etiquettes | Indices;

export interface Pack { pack: string; domaine: string; version: number; questions: Question[] }

export interface Quete {
  id: string;
  type: 'justes_domaine' | 'finir_quiz' | 'rapides';
  domaine?: string;
  cible: number;
  progres: number;
}

export interface QuetesDuJour { date: string; liste: Quete[] }

export interface QueteSemaine { semaine: string; cible: number; progres: number; recompensee: boolean }

export interface Profil {
  id: string;
  prenom: string;
  avatar: string;
  age: number;
  xp: number;
  cotes: Record<string, number>;
  xpDomaine: Record<string, number>;
  /** Ids des nœuds de l'arbre débloqués. */
  debloques: string[];
  /** Charges par joker (ex. { temps: 2, 'expert:Espace': 1 }). */
  jokers: Record<string, number>;
  quetes: QuetesDuJour;
  /** Dates « AAAA-MM-JJ » où les 3 quêtes du jour ont été réussies. */
  calendrier: string[];
  /** Meilleurs scores : « chrono », ou « chrono:Espace » pour un défi. */
  records: Record<string, number>;
  /** Victoires en duel. */
  duels: number;
  /** XP au début de la semaine en cours (pour l'XP de la semaine du classement). */
  semaineXp: { semaine: string; depart: number };
}
