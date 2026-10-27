export function verifierOrdre(attendu: string[], propose: string[]): boolean[] {
  return attendu.map((e, i) => propose[i] === e);
}

export function friseJuste(attendu: string[], propose: string[]): boolean {
  return propose.length === attendu.length && verifierOrdre(attendu, propose).every(Boolean);
}
