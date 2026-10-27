export function pinValide(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

/** SHA-256 du PIN (préfixé) : le code n'est jamais stocké en clair. */
export async function hacherPin(pin: string): Promise<string> {
  const octets = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`quiz-quest:${pin}`));
  return [...new Uint8Array(octets)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifierPin(pin: string, hache: string): Promise<boolean> {
  return (await hacherPin(pin)) === hache;
}

/** « PIN oublié ? » : une multiplication d'adulte (de 12 × 12 à 98 × 98). */
export function defiOubli(alea: () => number = Math.random): { texte: string; reponse: number } {
  const a = 12 + Math.floor(alea() * 87);
  const b = 12 + Math.floor(alea() * 87);
  return { texte: `${a} × ${b}`, reponse: a * b };
}
