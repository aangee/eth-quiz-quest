import { describe, it, expect } from 'vitest';
import { decoderSignal, encoderSignal } from './signal';

const SDP = [
  'v=0', 'o=- 4611731400430051336 2 IN IP4 127.0.0.1', 's=-', 't=0 0', 'a=group:BUNDLE 0', 'a=extmap-allow-mixed',
  'a=msid-semantic: WMS', 'm=application 9 UDP/DTLS/SCTP webrtc-datachannel', 'c=IN IP4 0.0.0.0',
  'a=candidate:1467250027 1 udp 2122260223 192.168.1.23 53654 typ host generation 0 network-id 1',
  'a=ice-ufrag:Hq3B', 'a=ice-pwd:t7Xf3l2Qk9Zr0m1Nw4Ys6Uv8', 'a=ice-options:trickle',
  'a=fingerprint:sha-256 7A:1B:2C:3D:4E:5F:60:71:82:93:A4:B5:C6:D7:E8:F9:0A:1B:2C:3D:4E:5F:60:71:82:93:A4:B5:C6:D7:E8:F9',
  'a=setup:actpass', 'a=mid:0', 'a=sctp-port:5000', 'a=max-message-size:262144', '',
].join('\r\n');

describe('signal', () => {
  it('aller-retour offre et réponse, assez court pour un QR', () => {
    const o = encoderSignal('offre', SDP);
    expect(o.startsWith('QQ1O')).toBe(true);
    expect(o.length).toBeLessThan(1500);
    expect(decoderSignal(o)).toEqual({ type: 'offre', sdp: SDP });
    expect(decoderSignal(` ${encoderSignal('reponse', SDP)}\n`)).toEqual({ type: 'reponse', sdp: SDP });
  });
  it('rejette ce qui n’est pas un code Quiz Quest', () => {
    expect(decoderSignal('https://exemple.fr')).toBeNull();
    expect(decoderSignal('QQ1Xabc')).toBeNull();
    expect(decoderSignal('QQ1O%%%pas-du-base64')).toBeNull();
  });
});
