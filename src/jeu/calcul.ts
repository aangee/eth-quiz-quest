export interface Calcul { texte: string; reponse: number }

export const NIVEAU_CALCUL_MAX = 5;

export function niveauCalculDepart(age: number): number {
  return age <= 8 ? 1 : age <= 10 ? 2 : age <= 13 ? 3 : 4;
}

export function niveauCalcul(depart: number, justes: number): number {
  return Math.min(NIVEAU_CALCUL_MAX, depart + Math.floor(justes / 5));
}

const entier = (min: number, max: number, alea: () => number) => min + Math.floor(alea() * (max - min + 1));
const plus = (a: number, b: number): Calcul => ({ texte: `${a} + ${b}`, reponse: a + b });
const moins = (a: number, b: number): Calcul => ({ texte: `${a} − ${b}`, reponse: a - b });
const fois = (a: number, b: number): Calcul => ({ texte: `${a} × ${b}`, reponse: a * b });

/**
 * 1 : additions jusqu'à 10 + 10 · 2 : + et − jusqu'à 50 · 3 : tables de 2 à 10, + et − jusqu'à 100
 * 4 : tables jusqu'à 12 × 25, + et − jusqu'à 1 000 · 5 : divisions exactes, multiplications à 2 chiffres
 */
export function genererCalcul(niveau: number, alea: () => number = Math.random): Calcul {
  const op = alea();
  switch (Math.min(NIVEAU_CALCUL_MAX, Math.max(1, niveau))) {
    case 1:
      return plus(entier(1, 10, alea), entier(1, 10, alea));
    case 2: {
      const a = entier(10, 50, alea);
      const b = entier(1, a, alea);
      return op < 0.5 ? plus(a, b) : moins(a, b);
    }
    case 3: {
      if (op < 0.5) return fois(entier(2, 10, alea), entier(2, 10, alea));
      const a = entier(20, 100, alea);
      const b = entier(1, a, alea);
      return op < 0.75 ? plus(a, b) : moins(a, b);
    }
    case 4: {
      if (op < 0.5) return fois(entier(2, 12, alea), entier(11, 25, alea));
      const a = entier(100, 1000, alea);
      const b = entier(10, a, alea);
      return op < 0.75 ? plus(a, b) : moins(a, b);
    }
    default: {
      if (op < 0.5) {
        const b = entier(2, 12, alea);
        const q = entier(2, 20, alea);
        return { texte: `${b * q} ÷ ${b}`, reponse: q };
      }
      return fois(entier(11, 30, alea), entier(11, 30, alea));
    }
  }
}
