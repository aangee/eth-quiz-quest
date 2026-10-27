/** Fisher-Yates : renvoie une copie mélangée, sans toucher à l'entrée. */
export function melanger<T>(t: T[], alea: () => number = Math.random): T[] {
  const r = [...t];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(alea() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}
