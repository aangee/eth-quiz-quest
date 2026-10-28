import { useState } from 'preact/hooks';
import { defiOubli, hacherPin, pinValide, verifierPin } from '../../jeu/pin';
import { Icone } from '../../ui/Icone';
import { EnteteRetour } from '../../ui/EnteteRetour';

type Mode = 'saisie' | 'creer' | 'oubli';

/** Entrée de l'espace parent : créer le PIN, le saisir, ou le réinitialiser. */
export function VerrouPin({ pin, onPin, onOuvrir, onRetour }: {
  pin: string | null; onPin: (hache: string | null) => void; onOuvrir: () => void; onRetour: () => void;
}) {
  const [mode, setMode] = useState<Mode>(pin ? 'saisie' : 'creer');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [defi] = useState(() => defiOubli());

  const champ = (valeur: string, changer: (v: string) => void, indice: string) => (
    <input type="password" inputMode="numeric" maxLength={4} autoComplete="off" placeholder={indice}
      value={valeur} onInput={(e) => changer(e.currentTarget.value.replace(/\D/g, ''))} />
  );

  const entrer = async () => {
    if (pin && (await verifierPin(a, pin))) onOuvrir();
    else { setMessage('Code incorrect.'); setA(''); }
  };
  const creer = async () => {
    if (!pinValide(a)) { setMessage('Le code doit avoir 4 chiffres.'); return; }
    if (a !== b) { setMessage('Les deux codes sont différents.'); return; }
    onPin(await hacherPin(a));
    onOuvrir();
  };
  const verifierDefi = () => {
    if (Number(a) === defi.reponse) { setMode('creer'); setA(''); setB(''); setMessage('Choisis un nouveau code.'); }
    else setMessage('Ce n’est pas le bon résultat.');
  };

  return (
    <main class="ecran">
      <EnteteRetour onRetour={onRetour}><Icone nom="cadenas" /> Espace parent</EnteteRetour>
      {mode === 'saisie' && (
        <>
          <p>Entre le code PIN :</p>
          {champ(a, setA, '••••')}
          <button class="principal" disabled={a.length !== 4} onClick={entrer}>Entrer</button>
          <button onClick={() => { setMode('oubli'); setA(''); setMessage(null); }}>PIN oublié ?</button>
        </>
      )}
      {mode === 'creer' && (
        <>
          <p>Choisis un code PIN à 4 chiffres (à ne pas dire aux enfants) :</p>
          {champ(a, setA, 'Nouveau code')}
          {champ(b, setB, 'Encore une fois')}
          <button class="principal" disabled={a.length !== 4 || b.length !== 4} onClick={creer}>Enregistrer le code</button>
        </>
      )}
      {mode === 'oubli' && (
        <>
          <p>Pour réinitialiser le code, calcule :</p>
          <h1 class="calcul">{defi.texte} = ?</h1>
          <input inputMode="numeric" value={a} onInput={(e) => setA(e.currentTarget.value.replace(/\D/g, ''))} />
          <button class="principal" onClick={verifierDefi}>Valider</button>
        </>
      )}
      {message && <p class="bandeau">{message}</p>}
    </main>
  );
}
