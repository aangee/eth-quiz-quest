import { useEffect, useRef, useState } from 'preact/hooks';
import jsQR from 'jsqr';

// Lecteur natif (Chrome Android) ; absent de Chrome Windows → repli sur jsQR
type Detecteur = { detect(source: CanvasImageSource): Promise<{ rawValue: string }[]> };
declare global { interface Window { BarcodeDetector?: new (o: { formats: string[] }) => Detecteur } }

const LARGEUR_ANALYSE = 640;

/** Lit un QR avec la caméra (arrière sur téléphone) ; appelle onCode une seule fois. */
export function Scanner({ onCode }: { onCode: (texte: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let flux: MediaStream | null = null;
    let fini = false;
    let occupe = false;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!navigator.mediaDevices?.getUserMedia || !ctx) {
      setErreur('Caméra indisponible : utilise le code texte.');
      return;
    }
    let natif: Detecteur | null = null;
    try { if (window.BarcodeDetector) natif = new window.BarcodeDetector({ formats: ['qr_code'] }); } catch { natif = null; }

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } })
      .then((f) => {
        flux = f;
        if (fini) { f.getTracks().forEach((t) => t.stop()); return; }
        if (video.current) { video.current.srcObject = f; video.current.play(); }
      })
      .catch(() => setErreur('Caméra indisponible : utilise le code texte.'));

    const trouve = (texte: string) => { if (!fini) { fini = true; onCode(texte); } };
    const analyser = async () => {
      const v = video.current;
      if (fini || occupe || !v || v.readyState < 2 || !v.videoWidth) return;
      occupe = true;
      try {
        if (natif) {
          const r = await natif.detect(v);
          if (r[0]?.rawValue) { trouve(r[0].rawValue); return; }
        }
        // Image réduite : plus rapide, et jsQR lit mieux un QR qui n'est pas minuscule dans l'image
        const k = Math.min(1, LARGEUR_ANALYSE / v.videoWidth);
        canvas.width = Math.round(v.videoWidth * k);
        canvas.height = Math.round(v.videoHeight * k);
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const r = jsQR(image.data, image.width, image.height, { inversionAttempts: 'attemptBoth' });
        if (r?.data) trouve(r.data);
      } catch {
        natif = null; // lecteur natif en échec : on reste sur jsQR
      } finally {
        occupe = false;
      }
    };
    const t = setInterval(analyser, 150);
    return () => {
      fini = true;
      clearInterval(t);
      flux?.getTracks().forEach((tr) => tr.stop());
    };
  }, []);

  return (
    <div class="scanner">
      {erreur ? <p>{erreur}</p> : <video ref={video} muted playsInline />}
      {!erreur && <p class="domaine">Vise le QR de l'autre écran, à 20-30 cm, luminosité au maximum.</p>}
    </div>
  );
}
