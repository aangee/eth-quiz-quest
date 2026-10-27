import { useEffect, useRef, useState } from 'preact/hooks';
import jsQR from 'jsqr';

/** Lit un QR avec la caméra (arrière sur téléphone) ; appelle onCode une seule fois. */
export function Scanner({ onCode }: { onCode: (texte: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let flux: MediaStream | null = null;
    let fini = false;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!navigator.mediaDevices?.getUserMedia || !ctx) {
      setErreur('Caméra indisponible : utilise le code texte.');
      return;
    }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then((f) => {
        flux = f;
        if (fini) { f.getTracks().forEach((t) => t.stop()); return; }
        if (video.current) { video.current.srcObject = f; video.current.play(); }
      })
      .catch(() => setErreur('Caméra indisponible : utilise le code texte.'));
    const t = setInterval(() => {
      const v = video.current;
      if (fini || !v || v.readyState < 2 || !v.videoWidth) return;
      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
      ctx.drawImage(v, 0, 0);
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const r = jsQR(image.data, image.width, image.height);
      if (r?.data) { fini = true; onCode(r.data); }
    }, 300);
    return () => {
      fini = true;
      clearInterval(t);
      flux?.getTracks().forEach((tr) => tr.stop());
    };
  }, []);

  return (
    <div class="scanner">
      {erreur ? <p>{erreur}</p> : <video ref={video} muted playsInline />}
    </div>
  );
}
