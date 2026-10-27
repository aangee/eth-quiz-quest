import { useEffect, useState } from 'preact/hooks';
import { toDataURL } from 'qrcode';

export function QrCode({ texte }: { texte: string }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    toDataURL(texte, { errorCorrectionLevel: 'L', margin: 2, width: 360 }).then(setSrc);
  }, [texte]);
  return src ? <img class="qr" src={src} alt="QR code à scanner avec l'autre appareil" /> : <p>Préparation du QR…</p>;
}
