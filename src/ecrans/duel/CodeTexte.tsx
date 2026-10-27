import { useState } from 'preact/hooks';

/** Repli sans caméra : montrer son code et/ou coller celui de l'autre appareil. */
export function CodeTexte({ code, onCode }: { code?: string; onCode?: (c: string) => void }) {
  const [saisie, setSaisie] = useState('');
  return (
    <details class="code-texte">
      <summary>Pas de caméra ? Code texte</summary>
      {code && (
        <>
          <textarea readOnly rows={3} value={code} onFocus={(e) => e.currentTarget.select()} />
          <button onClick={() => navigator.clipboard?.writeText(code)}>Copier mon code</button>
        </>
      )}
      {onCode && (
        <>
          <textarea rows={3} placeholder="Colle ici le code de l'autre appareil" value={saisie}
            onInput={(e) => setSaisie(e.currentTarget.value)} />
          <button onClick={() => onCode(saisie)}>Valider le code</button>
        </>
      )}
    </details>
  );
}
