import { describe, it, expect } from 'vitest';
import { decoderSignal, encoderSignal } from './signal';

const FP = '7A:1B:2C:3D:4E:5F:60:71:82:93:A4:B5:C6:D7:E8:F9:0A:1B:2C:3D:4E:5F:60:71:82:93:A4:B5:C6:D7:E8:F9';
const sdp = (candidats: string[], setup = 'actpass') => [
  'v=0', 'o=- 4611731400430051336 2 IN IP4 127.0.0.1', 's=-', 't=0 0', 'a=group:BUNDLE 0', 'a=extmap-allow-mixed',
  'a=msid-semantic: WMS', 'm=application 9 UDP/DTLS/SCTP webrtc-datachannel', 'c=IN IP4 0.0.0.0',
  ...candidats,
  'a=ice-ufrag:Hq3B', 'a=ice-pwd:t7Xf3l2Qk9Zr0m1Nw4Ys6Uv8', 'a=ice-options:trickle',
  `a=fingerprint:sha-256 ${FP}`, `a=setup:${setup}`, 'a=mid:0', 'a=sctp-port:5000', 'a=max-message-size:262144', '',
].join('\r\n');
const IPV4 = 'a=candidate:1467250027 1 udp 2122260223 192.168.1.23 53654 typ host generation 0 network-id 1';

describe('signal', () => {
  it('ne garde que l’essentiel : code court (QR peu dense) et SDP reconstruite', () => {
    const o = encoderSignal('offre', sdp([IPV4]));
    expect(o).toMatch(/^Q2O[0-9A-V]+$/);
    expect(o.length).toBeLessThan(110);
    const d = decoderSignal(o)!;
    expect(d.type).toBe('offre');
    for (const l of ['a=ice-ufrag:Hq3B', 'a=ice-pwd:t7Xf3l2Qk9Zr0m1Nw4Ys6Uv8', `a=fingerprint:sha-256 ${FP}`, 'a=setup:actpass',
      'm=application 9 UDP/DTLS/SCTP webrtc-datachannel', 'a=sctp-port:5000']) expect(d.sdp).toContain(l);
    expect(d.sdp).toMatch(/a=candidate:\S+ 1 udp \d+ 192\.168\.1\.23 53654 typ host/);
  });
  it('garde les candidats mDNS et IPv6, ignore les candidats TCP', () => {
    const r = encoderSignal('reponse', sdp([
      'a=candidate:1 1 udp 2122260223 3f2b6c1e-7d4a-4b8e-9c1f-2a3b4c5d6e7f.local 50000 typ host generation 0',
      'a=candidate:2 1 udp 2122197247 fe80::1c2b:3a4d 50001 typ host generation 0',
      'a=candidate:3 1 tcp 1518280447 192.168.1.23 9 typ host tcptype active generation 0',
    ], 'active'));
    const d = decoderSignal(` ${r}\n`)!;
    expect(d.type).toBe('reponse');
    expect(d.sdp).toContain('3f2b6c1e-7d4a-4b8e-9c1f-2a3b4c5d6e7f.local 50000 typ host');
    expect(d.sdp).toContain('fe80:0:0:0:0:0:1c2b:3a4d 50001 typ host');
    expect(d.sdp).not.toContain(' tcp ');
    expect(d.sdp).toContain('a=setup:active');
  });
  it('rejette ce qui n’est pas un code Quiz Quest', () => {
    expect(decoderSignal('https://exemple.fr')).toBeNull();
    expect(decoderSignal('Q2Xabc')).toBeNull();
    expect(decoderSignal('Q2OZZZZ')).toBeNull();
    expect(decoderSignal('Q2O00')).toBeNull();
  });
});
