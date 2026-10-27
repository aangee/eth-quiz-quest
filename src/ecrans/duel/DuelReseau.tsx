import { useEffect, useRef, useState } from 'preact/hooks';
import type { Profil } from '../../types';
import { domaines } from '../../packs';
import { NB_MANCHES, vainqueur } from '../../jeu/duel';
import { avancerQuetes } from '../../jeu/quetes';
import { creerOffre, demanderCamera, repondre, type EtatConnexion, type Transport } from '../../net/connexion';
import { QuestionDuel } from './QuestionDuel';
import { QrCode } from './QrCode';
import { Scanner } from './Scanner';
import { CodeTexte } from './CodeTexte';

type Phase = 'role' | 'hote' | 'invite' | 'salon' | 'jeu';

export function DuelReseau({ joueur, onFin, onQuitter }: {
  joueur: Profil; onFin: (majs: Profil[], justes: number) => void; onQuitter: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('role');
  const [hote, setHote] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [attente, setAttente] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [etat, setEtat] = useState<EtatConnexion>('ouvert');
  const [adv, setAdv] = useState<{ prenom: string; avatar: string } | null>(null);
  const [p, setP] = useState(joueur);
  const [manche, setManche] = useState(0);
  const [mesPoints, setMesPoints] = useState(0);
  const [justes, setJustes] = useState(0);
  const [sesPoints, setSesPoints] = useState(0);
  const [sesManches, setSesManches] = useState(0);
  const [vues, setVues] = useState(() => new Set<string>());
  const transport = useRef<Transport | null>(null);
  const finaliser = useRef<((c: string) => Promise<Transport>) | null>(null);
  const annuler = useRef<(() => void) | null>(null);
  const moiFini = phase === 'jeu' && manche >= NB_MANCHES;

  useEffect(() => () => { transport.current?.fermer(); annuler.current?.(); }, []);

  // Mes 10 questions faites : on enregistre ma progression
  useEffect(() => {
    if (!moiFini) return;
    const maj = avancerQuetes(p, { type: 'fin_quiz' });
    setP(maj);
    onFin([maj], justes);
  }, [moiFini]);

  const demarrer = () => {
    setManche(0); setMesPoints(0); setJustes(0); setSesPoints(0); setSesManches(0); setVues(new Set()); setPhase('jeu');
  };

  const connecte = (t: Transport) => {
    transport.current = t;
    setEtat('ouvert');
    setPhase('salon');
    t.surEtat(setEtat);
    t.surMessage((m) => {
      if (m.t === 'bonjour') setAdv({ prenom: m.prenom, avatar: m.avatar });
      else if (m.t === 'debut') demarrer();
      else if (m.t === 'reponse') { setSesPoints((s) => s + m.points); setSesManches((n) => Math.max(n, m.manche + 1)); }
    });
    t.envoyer({ t: 'bonjour', prenom: joueur.prenom, avatar: joueur.avatar });
  };
  const echec = (e: unknown) => { setAttente(false); setErreur(e instanceof Error ? e.message : 'Connexion impossible.'); };

  const devenirHote = async () => {
    setHote(true); setPhase('hote'); setErreur(null);
    try {
      await demanderCamera();
      const o = await creerOffre();
      finaliser.current = o.finaliser;
      annuler.current = o.annuler;
      setCode(o.code);
    } catch (e) { echec(e); }
  };
  const recuReponse = async (c: string) => {
    if (!finaliser.current) return;
    setAttente(true);
    try { connecte(await finaliser.current(c)); } catch (e) { echec(e); }
  };
  const devenirInvite = async () => {
    setHote(false); setPhase('invite'); setErreur(null);
    await demanderCamera();
  };
  const recuOffre = async (c: string) => {
    setAttente(true);
    try {
      const r = await repondre(c);
      annuler.current = r.annuler;
      setCode(r.code);
      connecte(await r.transport);
    } catch (e) { echec(e); }
  };
  const lancer = () => { transport.current?.envoyer({ t: 'debut' }); demarrer(); };

  const bandeau = etat === 'instable' ? <p class="bandeau">📶 Connexion instable…</p>
    : etat === 'ferme' && phase !== 'role' && phase !== 'hote' && phase !== 'invite' ? <p class="bandeau ko">🔌 Connexion perdue</p>
    : null;
  const nomAdv = adv ? `${adv.avatar} ${adv.prenom}` : "l'autre joueur";

  if (phase === 'role') {
    return (
      <main class="ecran">
        <h2>📶 Duel en réseau</h2>
        <p class="domaine">Les deux appareils sur le même Wi-Fi, ou sur le partage de connexion du téléphone.</p>
        <button class="principal" onClick={devenirHote}>Créer la partie (montrer un QR)</button>
        <button onClick={devenirInvite}>Rejoindre (scanner le QR)</button>
        <button onClick={onQuitter}>← Retour</button>
      </main>
    );
  }

  if (phase === 'hote' || phase === 'invite') {
    const etape = phase === 'hote'
      ? (code ? '2. Scanne le QR affiché par l’autre appareil :' : 'Préparation…')
      : (code ? '2. Montre ce QR à l’appareil hôte :' : '1. Scanne le QR de l’appareil hôte :');
    return (
      <main class="ecran">
        <h2>{phase === 'hote' ? '🎮 Tu crées la partie' : '🔗 Tu rejoins la partie'}</h2>
        {erreur && <p class="bandeau ko">{erreur}</p>}
        {phase === 'hote' && code && <><p>1. Fais scanner ce QR par l’autre appareil :</p><QrCode texte={code} /></>}
        {phase === 'invite' && code && <QrCode texte={code} />}
        <p>{attente && phase === 'invite' ? `${etape} — en attente de connexion…` : etape}</p>
        {((phase === 'hote' && code && !attente) || (phase === 'invite' && !code)) && (
          <Scanner key={phase} onCode={phase === 'hote' ? recuReponse : recuOffre} />
        )}
        <CodeTexte code={code ?? undefined}
          onCode={phase === 'hote' ? (code ? recuReponse : undefined) : (code ? undefined : recuOffre)} />
        <button onClick={onQuitter}>Annuler</button>
      </main>
    );
  }

  if (phase === 'salon') {
    return (
      <main class="ecran">
        {bandeau}
        <h2>✅ Connecté avec {nomAdv}</h2>
        {hote
          ? <button class="principal" disabled={!adv} onClick={lancer}>Lancer le duel ▶</button>
          : <p>En attente de l’hôte…</p>}
        <button onClick={onQuitter}>Quitter</button>
      </main>
    );
  }

  // phase === 'jeu'
  const tableau = (
    <div class="scores">
      <span>{p.avatar} Moi : <b>{mesPoints}</b> ({Math.min(manche, NB_MANCHES)}/{NB_MANCHES})</span>
      <span>{nomAdv} : <b>{sesPoints}</b> ({sesManches}/{NB_MANCHES})</span>
    </div>
  );

  if (!moiFini) {
    return (
      <main class="ecran">
        {bandeau}
        {tableau}
        <QuestionDuel key={manche} profil={p} domaines={domaines} vues={vues}
          onReponse={(r) => {
            setP(r.profil);
            setMesPoints((s) => s + r.points);
            if (r.juste) setJustes((n) => n + 1);
            transport.current?.envoyer({ t: 'reponse', manche, points: r.points, juste: r.juste });
            setManche((m) => m + 1);
          }} />
      </main>
    );
  }

  const adversaireFini = sesManches >= NB_MANCHES;
  const v = vainqueur([mesPoints, sesPoints]);
  return (
    <main class="ecran">
      {bandeau}
      {adversaireFini
        ? <h1>{v === 'egalite' ? '🤝 Égalité !' : v === 0 ? '🏆 Tu gagnes !' : `🏆 ${nomAdv} gagne !`}</h1>
        : <h2>⏳ En attente de {nomAdv}…</h2>}
      {tableau}
      {adversaireFini && (hote
        ? <button class="principal" onClick={lancer}>Revanche 🔁</button>
        : <p>L’hôte peut lancer une revanche.</p>)}
      <button onClick={onQuitter}>Quitter</button>
    </main>
  );
}
