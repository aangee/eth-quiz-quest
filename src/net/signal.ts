export type TypeSignal = 'offre' | 'reponse';

/*
 * Code d'appairage le plus court possible, pour un QR peu dense que n'importe quelle caméra lit.
 * On ne transmet que ce qui change d'une connexion à l'autre (identifiants ICE, empreinte DTLS,
 * rôle, adresses locales), en binaire, puis en base 32 « 0-9 A-V » : uniquement des majuscules et
 * des chiffres, ce qui permet au QR d'utiliser son mode alphanumérique, plus compact.
 * La SDP (canal de données seul) est reconstruite de l'autre côté.
 */
const PREFIXE = 'Q2';
const B32 = '0123456789ABCDEFGHIJKLMNOPQRSTUV';
const SETUPS = ['actpass', 'active', 'passive'];
const MAX_CANDIDATS = 3;

// --- flux de bits <-> base 32 -------------------------------------------
const ICE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

class Ecrivain {
  bits: number[] = [];
  ecrire(v: number, n: number) { for (let k = n - 1; k >= 0; k--) this.bits.push((v >> k) & 1); }
  octets(o: number[]) { o.forEach((x) => this.ecrire(x, 8)); }
  /** Identifiant ICE : longueur sur 6 bits puis 6 bits par caractère. */
  ice(s: string) { this.ecrire(s.length, 6); [...s].forEach((c) => this.ecrire(Math.max(0, ICE.indexOf(c)), 6)); }
  base32() {
    let s = '';
    for (let i = 0; i < this.bits.length; i += 5) {
      let v = 0;
      for (let k = 0; k < 5; k++) v = (v << 1) | (this.bits[i + k] ?? 0);
      s += B32[v];
    }
    return s;
  }
}

class Lecteur {
  private i = 0;
  constructor(private bits: number[]) {}
  static depuisBase32(s: string): Lecteur | null {
    const bits: number[] = [];
    for (const c of s) {
      const v = B32.indexOf(c);
      if (v < 0) return null;
      for (let k = 4; k >= 0; k--) bits.push((v >> k) & 1);
    }
    return new Lecteur(bits);
  }
  lire(n: number): number | null {
    if (this.i + n > this.bits.length) return null;
    let v = 0;
    for (let k = 0; k < n; k++) v = (v << 1) | this.bits[this.i++];
    return v;
  }
  octets(n: number): number[] | null {
    const o: number[] = [];
    for (let k = 0; k < n; k++) { const v = this.lire(8); if (v === null) return null; o.push(v); }
    return o;
  }
  ice(): string | null {
    const n = this.lire(6);
    if (n === null) return null;
    let s = '';
    for (let k = 0; k < n; k++) { const v = this.lire(6); if (v === null) return null; s += ICE[v]; }
    return s;
  }
}

// --- adresses ---------------------------------------------------------------
const UUID = /^([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})\.local$/i;
const hex = (h: string) => h.match(/../g)!.map((x) => parseInt(x, 16));

function ipv6VersOctets(ip: string): number[] | null {
  const [g, d] = ip.split('::');
  const gauche = g ? g.split(':') : [];
  const droite = d !== undefined && d !== '' ? d.split(':') : [];
  const blocs = d === undefined ? gauche : [...gauche, ...Array(8 - gauche.length - droite.length).fill('0'), ...droite];
  if (blocs.length !== 8 || !blocs.every((b) => /^[0-9a-f]{1,4}$/i.test(b))) return null;
  return blocs.flatMap((b) => { const v = parseInt(b, 16); return [v >> 8, v & 255]; });
}

/** Une adresse en octets : 4 = IPv4, 6 = IPv6, 1 = nom mDNS (UUID .local). */
function adresseVersOctets(a: string): number[] | null {
  if (/^\d+\.\d+\.\d+\.\d+$/.test(a)) return [4, ...a.split('.').map(Number)];
  const u = UUID.exec(a);
  if (u) return [1, ...hex(u.slice(1).join(''))];
  const v6 = a.includes(':') ? ipv6VersOctets(a) : null;
  return v6 ? [6, ...v6] : null;
}

function lireAdresse(l: Lecteur): string | null {
  const t = l.lire(8);
  if (t === 4) return l.octets(4)?.join('.') ?? null;
  const o = t === 1 || t === 6 ? l.octets(16) : null;
  if (!o) return null;
  if (t === 1) {
    const h = o.map((x) => x.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}.local`;
  }
  return Array.from({ length: 8 }, (_, k) => ((o[2 * k] << 8) | o[2 * k + 1]).toString(16)).join(':');
}

// --- SDP --------------------------------------------------------------------
const ligne = (sdp: string, cle: string) => sdp.split(/\r?\n/).find((l) => l.startsWith(cle))?.slice(cle.length).trim() ?? '';

/** Candidats UDP retenus : IPv4 d'abord (hors 169.254), puis mDNS, puis IPv6. */
function candidats(sdp: string): { adresse: number[]; port: number }[] {
  const rang = (a: number[]) => (a[0] === 4 ? (a[1] === 169 && a[2] === 254 ? 3 : 0) : a[0] === 1 ? 1 : 2);
  return sdp.split(/\r?\n/)
    .filter((l) => l.startsWith('a=candidate:'))
    .map((l) => l.split(' '))
    .filter((c) => c[1] === '1' && c[2]?.toLowerCase() === 'udp')
    .flatMap((c) => { const a = adresseVersOctets(c[4]); return a ? [{ adresse: a, port: Number(c[5]) }] : []; })
    .sort((x, y) => rang(x.adresse) - rang(y.adresse))
    .slice(0, MAX_CANDIDATS);
}

export function encoderSignal(type: TypeSignal, sdp: string): string {
  const w = new Ecrivain();
  w.ice(ligne(sdp, 'a=ice-ufrag:'));
  w.ice(ligne(sdp, 'a=ice-pwd:'));
  w.octets(ligne(sdp, 'a=fingerprint:sha-256').split(':').map((h) => parseInt(h, 16) || 0));
  w.ecrire(Math.max(0, SETUPS.indexOf(ligne(sdp, 'a=setup:'))), 2);
  const cands = candidats(sdp);
  w.ecrire(cands.length, 2);
  for (const c of cands) { w.octets(c.adresse); w.ecrire(c.port, 16); }
  return `${PREFIXE}${type === 'offre' ? 'O' : 'R'}${w.base32()}`;
}

export function decoderSignal(code: string): { type: TypeSignal; sdp: string } | null {
  const c = code.trim().toUpperCase();
  if (!c.startsWith(PREFIXE)) return null;
  const t = c[PREFIXE.length];
  if (t !== 'O' && t !== 'R') return null;
  const l = Lecteur.depuisBase32(c.slice(PREFIXE.length + 1));
  if (!l) return null;
  const ufrag = l.ice();
  const pwd = l.ice();
  const empreinte = l.octets(32);
  const setup = SETUPS[l.lire(2) ?? 9];
  const nb = l.lire(2);
  if (!ufrag || ufrag.length < 4 || !pwd || pwd.length < 22 || !empreinte || !setup || nb === null) return null;
  const lignes: string[] = [];
  for (let k = 0; k < nb; k++) {
    const adresse = lireAdresse(l);
    const port = l.lire(16);
    if (!adresse || port === null) return null;
    lignes.push(`a=candidate:${k + 1} 1 udp ${2122260223 - k} ${adresse} ${port} typ host`);
  }
  const fp = empreinte.map((x) => x.toString(16).toUpperCase().padStart(2, '0')).join(':');
  const sdp = [
    'v=0', 'o=- 1 2 IN IP4 127.0.0.1', 's=-', 't=0 0', 'a=group:BUNDLE 0', 'a=msid-semantic: WMS',
    'm=application 9 UDP/DTLS/SCTP webrtc-datachannel', 'c=IN IP4 0.0.0.0',
    ...lignes,
    `a=ice-ufrag:${ufrag}`, `a=ice-pwd:${pwd}`, `a=fingerprint:sha-256 ${fp}`, `a=setup:${setup}`,
    'a=mid:0', 'a=sctp-port:5000', 'a=max-message-size:262144', '',
  ].join('\r\n');
  return { type: t === 'O' ? 'offre' : 'reponse', sdp };
}
