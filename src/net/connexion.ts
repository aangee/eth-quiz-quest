import { lireMessage, type Message } from './protocole';
import { decoderSignal, encoderSignal } from './signal';

export type EtatConnexion = 'ouvert' | 'instable' | 'ferme';

/** Canal entre deux appareils ; seule dépendance du jeu au réseau (remplaçable en V2). */
export interface Transport {
  envoyer(m: Message): void;
  surMessage(f: (m: Message) => void): void;
  surEtat(f: (e: EtatConnexion) => void): void;
  fermer(): void;
}

// Aucun serveur STUN : réseau local uniquement, fonctionne hors ligne
const CONFIG: RTCConfiguration = { iceServers: [] };
const DELAI_OUVERTURE_MS = 20000;

/**
 * Demande la caméra avant de créer l'offre ou la réponse : avec cette permission, Chrome
 * annonce les vraies adresses locales au lieu de noms mDNS (plus fiable sur certaines box).
 */
export async function demanderCamera(): Promise<void> {
  try {
    const flux = await navigator.mediaDevices.getUserMedia({ video: true });
    flux.getTracks().forEach((t) => t.stop());
  } catch {
    // Pas de caméra ou refus : on continue (code texte possible)
  }
}

function attendreIce(pc: RTCPeerConnection, delaiMs = 3000): Promise<void> {
  if (pc.iceGatheringState === 'complete') return Promise.resolve();
  return new Promise((ok) => {
    const t = setTimeout(ok, delaiMs);
    pc.addEventListener('icegatheringstatechange', () => {
      if (pc.iceGatheringState === 'complete') { clearTimeout(t); ok(); }
    });
  });
}

function attendreOuverture(canal: RTCDataChannel): Promise<void> {
  if (canal.readyState === 'open') return Promise.resolve();
  return new Promise((ok, ko) => {
    const t = setTimeout(() => ko(new Error('Connexion impossible : vérifiez que les deux appareils sont sur le même réseau.')), DELAI_OUVERTURE_MS);
    canal.addEventListener('open', () => { clearTimeout(t); ok(); });
  });
}

function envelopper(pc: RTCPeerConnection, canal: RTCDataChannel): Transport {
  const ecouteurs: ((m: Message) => void)[] = [];
  const etats: ((e: EtatConnexion) => void)[] = [];
  const signaler = (e: EtatConnexion) => etats.forEach((f) => f(e));
  canal.addEventListener('message', (ev) => {
    const m = lireMessage(String(ev.data));
    if (m) ecouteurs.forEach((f) => f(m));
  });
  canal.addEventListener('close', () => signaler('ferme'));
  pc.addEventListener('connectionstatechange', () => {
    if (pc.connectionState === 'connected') signaler('ouvert');
    else if (pc.connectionState === 'disconnected') signaler('instable');
    else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') signaler('ferme');
  });
  return {
    envoyer: (m) => { if (canal.readyState === 'open') canal.send(JSON.stringify(m)); },
    surMessage: (f) => { ecouteurs.push(f); },
    surEtat: (f) => { etats.push(f); },
    fermer: () => { canal.close(); pc.close(); },
  };
}

/** Hôte : crée l'offre (à montrer en QR), puis se connecte avec le code réponse de l'invité. */
export async function creerOffre(): Promise<{
  code: string; finaliser: (codeReponse: string) => Promise<Transport>; annuler: () => void;
}> {
  const pc = new RTCPeerConnection(CONFIG);
  const canal = pc.createDataChannel('duel');
  await pc.setLocalDescription(await pc.createOffer());
  await attendreIce(pc);
  return {
    code: encoderSignal('offre', pc.localDescription!.sdp),
    finaliser: async (codeReponse) => {
      const s = decoderSignal(codeReponse);
      if (!s || s.type !== 'reponse') throw new Error("Ce QR n'est pas une réponse Quiz Quest.");
      await pc.setRemoteDescription({ type: 'answer', sdp: s.sdp });
      await attendreOuverture(canal);
      return envelopper(pc, canal);
    },
    annuler: () => pc.close(),
  };
}

/** Invité : lit l'offre de l'hôte, produit le code réponse (à montrer en QR) et attend la connexion. */
export async function repondre(codeOffre: string): Promise<{
  code: string; transport: Promise<Transport>; annuler: () => void;
}> {
  const s = decoderSignal(codeOffre);
  if (!s || s.type !== 'offre') throw new Error("Ce QR n'est pas une invitation Quiz Quest.");
  const pc = new RTCPeerConnection(CONFIG);
  const canal = new Promise<RTCDataChannel>((ok) => { pc.addEventListener('datachannel', (ev) => ok(ev.channel)); });
  await pc.setRemoteDescription({ type: 'offer', sdp: s.sdp });
  await pc.setLocalDescription(await pc.createAnswer());
  await attendreIce(pc);
  return {
    code: encoderSignal('reponse', pc.localDescription!.sdp),
    transport: canal.then(async (c) => { await attendreOuverture(c); return envelopper(pc, c); }),
    annuler: () => pc.close(),
  };
}
