import { compressToBase64, decompressFromBase64 } from 'lz-string';

export type TypeSignal = 'offre' | 'reponse';

// Préfixe + version : un QR qui ne commence pas par là n'est pas à nous
const PREFIXE = 'QQ1';

export function encoderSignal(type: TypeSignal, sdp: string): string {
  return `${PREFIXE}${type === 'offre' ? 'O' : 'R'}${compressToBase64(sdp)}`;
}

export function decoderSignal(code: string): { type: TypeSignal; sdp: string } | null {
  const c = code.trim();
  if (!c.startsWith(PREFIXE)) return null;
  const t = c[PREFIXE.length];
  if (t !== 'O' && t !== 'R') return null;
  let sdp: string | null = null;
  try { sdp = decompressFromBase64(c.slice(PREFIXE.length + 1)); } catch { return null; }
  if (!sdp || !sdp.startsWith('v=0')) return null;
  return { type: t === 'O' ? 'offre' : 'reponse', sdp };
}
