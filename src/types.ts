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

export interface Profil {
  id: string;
  prenom: string;
  avatar: string;
  age: number;
  xp: number;
  cotes: Record<string, number>;
  xpDomaine: Record<string, number>;
}
