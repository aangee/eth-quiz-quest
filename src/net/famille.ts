/** Ce qu'il faut pour rejoindre le classement d'une famille (transmis par QR). */
export interface ConfigFamille { projet: string; cle: string; famille: string }

const PREFIXE = 'QQF1:';
const B62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/** Secret de la famille : 24 caractères aléatoires, impossible à deviner. */
export function genererFamille(): string {
  return [...crypto.getRandomValues(new Uint8Array(24))].map((o) => B62[o % 62]).join('');
}

export function configValide(c: Partial<ConfigFamille> | null): c is ConfigFamille {
  return !!c && /^[a-z0-9-]{4,40}$/.test(c.projet ?? '') && /^[A-Za-z0-9_-]{20,60}$/.test(c.cle ?? '') && /^[A-Za-z0-9]{20,40}$/.test(c.famille ?? '');
}

export function encoderFamille(c: ConfigFamille): string {
  return PREFIXE + [c.projet, c.cle, c.famille].join('.');
}

export function decoderFamille(code: string): ConfigFamille | null {
  const t = code.trim();
  if (!t.startsWith(PREFIXE)) return null;
  const morceaux = t.slice(PREFIXE.length).split('.');
  if (morceaux.length !== 3) return null;
  const [projet, cle, famille] = morceaux;
  const c = { projet, cle, famille };
  return configValide(c) ? c : null;
}
