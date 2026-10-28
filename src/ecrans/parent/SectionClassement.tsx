import { useState } from 'preact/hooks';
import type { Famille } from '../../stockage';
import { dependancesFirebase } from '../../stockage';
import { configValide, decoderFamille, encoderFamille, genererFamille, type ConfigFamille } from '../../net/famille';
import { lireClassement } from '../../net/classementEnLigne';
import { QrCode } from '../duel/QrCode';
import { Scanner } from '../duel/Scanner';
import { CodeTexte } from '../duel/CodeTexte';
import { Icone } from '../../ui/Icone';

export function SectionClassement({ famille, onFamille }: { famille: Famille | null; onFamille: (f: Famille | null) => void }) {
  const [mode, setMode] = useState<'choix' | 'creer' | 'rejoindre'>('choix');
  const [projet, setProjet] = useState('');
  const [cle, setCle] = useState('');
  const [appareil, setAppareil] = useState(famille?.appareil ?? '');
  const [scanner, setScanner] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [attente, setAttente] = useState(false);

  // Vérifie que Firebase répond avant d'enregistrer la famille
  const installer = async (config: ConfigFamille) => {
    if (!appareil.trim()) { setMessage('Donne un nom à cet appareil (ex. « PC du salon »).'); return; }
    setAttente(true);
    setMessage('Connexion à Firebase…');
    try {
      await lireClassement(config, dependancesFirebase);
      onFamille({ config, appareil: appareil.trim() });
      setMessage('Classement installé sur cet appareil.');
      setMode('choix');
    } catch (e) {
      setMessage(`Firebase ne répond pas (${(e as Error).message}). Vérifie l'ID du projet, la clé et les règles (docs/FIREBASE.md).`);
    } finally {
      setAttente(false);
    }
  };
  const creer = () => {
    const config = { projet: projet.trim(), cle: cle.trim(), famille: genererFamille() };
    if (!configValide(config)) { setMessage("ID du projet ou clé d'API invalide."); return; }
    installer(config);
  };
  const recuCode = (code: string) => {
    setScanner(false);
    const config = decoderFamille(code);
    if (!config) { setMessage("Ce n'est pas un code famille Quiz Quest."); return; }
    installer(config);
  };

  const champAppareil = (
    <input placeholder="Nom de cet appareil (ex. PC du salon)" value={appareil} maxLength={30} onInput={(e) => setAppareil(e.currentTarget.value)} />
  );

  return (
    <section>
      <h3><Icone nom="trophee" /> Classement famille</h3>
      {famille ? (
        <>
          <p class="domaine">Installé sur cet appareil (« {famille.appareil} »). Pour ajouter un appareil : Espace parent › Classement famille › Rejoindre, puis scanne ce QR.</p>
          <QrCode texte={encoderFamille(famille.config)} />
          <CodeTexte code={encoderFamille(famille.config)} />
          <button onClick={() => { if (confirm('Retirer le classement de cet appareil ?')) onFamille(null); }}>Retirer le classement de cet appareil</button>
        </>
      ) : mode === 'choix' ? (
        <>
          <p class="domaine">Partage les scores entre les appareils de la famille (pseudos seulement, jamais de vrai nom ni d'âge).</p>
          <button onClick={() => setMode('rejoindre')}><Icone nom="qr" /> Rejoindre la famille (scanner le QR d'un autre appareil)</button>
          <button onClick={() => setMode('creer')}><Icone nom="plus" /> Créer le classement (première fois, avec Firebase)</button>
        </>
      ) : mode === 'creer' ? (
        <>
          <p class="domaine">Suis le guide <code>docs/FIREBASE.md</code> du dépôt, puis colle ici l'ID du projet et la clé d'API web.</p>
          <input placeholder="ID du projet Firebase (ex. quiz-quest-famille)" value={projet} onInput={(e) => setProjet(e.currentTarget.value)} />
          <input placeholder="Clé d'API web (AIza…)" value={cle} onInput={(e) => setCle(e.currentTarget.value)} />
          {champAppareil}
          <button class="principal" disabled={attente} onClick={creer}>Créer et tester</button>
          <button onClick={() => setMode('choix')}><Icone nom="retour" /> Retour</button>
        </>
      ) : (
        <>
          {champAppareil}
          {scanner ? <Scanner onCode={recuCode} /> : <button class="principal" disabled={attente} onClick={() => setScanner(true)}><Icone nom="qr" /> Scanner le QR famille</button>}
          <CodeTexte onCode={recuCode} />
          <button onClick={() => { setScanner(false); setMode('choix'); }}><Icone nom="retour" /> Retour</button>
        </>
      )}
      {message && <p class="bandeau">{message}</p>}
    </section>
  );
}
