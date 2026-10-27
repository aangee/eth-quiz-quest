import { describe, it, expect } from 'vitest';
import { envoyerEntrees, lireClassement, obtenirJeton, type Dependances, type Jeton } from './classementEnLigne';
import { depuisFirestore, versFirestore } from './firestore';
import type { EntreeClassement } from '../jeu/classement';

const cfg = { projet: 'quiz-quest-famille', cle: 'AIzaSyD-exemple_cle_api_web_123456789', famille: 'Ab3dEf6hIj9kLm2nOp5qRs8t' };
const entree: EntreeClassement = { id: 'p1', pseudo: 'Loulou', avatar: '🦊', appareil: 'tél.', niveau: 3, xp: 500, xpSemaine: 40, semaine: '2026-S44', records: { chrono: 12, 'chrono:Espace': 9 }, duels: 2, maj: '2026-10-27T10:00:00.000Z' };

/** Faux réseau : enregistre les appels et répond selon l'adresse. */
function faux(reponses: Record<string, unknown>, jeton?: Jeton) {
  const appels: { url: string; init?: RequestInit }[] = [];
  let stocke = jeton;
  const d: Dependances = {
    fetch: (async (url: string, init?: RequestInit) => {
      appels.push({ url, init });
      const cle = Object.keys(reponses).find((k) => url.includes(k));
      return new Response(JSON.stringify(cle ? reponses[cle] : {}), { status: cle ? 200 : 404 });
    }) as typeof fetch,
    lireJeton: async () => stocke,
    ecrireJeton: async (j) => { stocke = j; },
    maintenant: () => 1_000_000,
  };
  return { d, appels, jeton: () => stocke };
}

describe('Firebase (REST)', () => {
  it('conversion Firestore aller-retour', () => {
    const doc = { name: 'projects/x/databases/(default)/documents/familles/f/joueurs/p1', ...versFirestore(entree) };
    expect(depuisFirestore(doc)).toEqual(entree);
    expect(depuisFirestore({ name: 'a/b', fields: {} })).toBeNull();
  });
  it('connexion anonyme la première fois, puis jeton réutilisé tant qu’il est valide', async () => {
    const f = faux({ 'accounts:signUp': { idToken: 'T1', refreshToken: 'R1', expiresIn: '3600' } });
    expect(await obtenirJeton(cfg, f.d)).toBe('T1');
    expect(f.appels[0].url).toContain(`accounts:signUp?key=${cfg.cle}`);
    expect(await obtenirJeton(cfg, f.d)).toBe('T1');
    expect(f.appels).toHaveLength(1);
  });
  it('jeton expiré : rafraîchi', async () => {
    const f = faux({ 'securetoken.googleapis.com': { id_token: 'T2', refresh_token: 'R2', expires_in: '3600' } },
      { projet: cfg.projet, idToken: 'T1', refreshToken: 'R1', expire: 0 });
    expect(await obtenirJeton(cfg, f.d)).toBe('T2');
    expect(String(f.appels[0].init?.body)).toContain('refresh_token=R1');
  });
  it('envoi et lecture du classement de la famille', async () => {
    const doc = { name: 'projects/x/databases/(default)/documents/familles/f/joueurs/p1', ...versFirestore(entree) };
    const f = faux({ '/joueurs/p1': {}, '/joueurs?': { documents: [doc] } },
      { projet: cfg.projet, idToken: 'T1', refreshToken: 'R1', expire: 9_999_999 });
    await envoyerEntrees(cfg, [entree], f.d);
    const patch = f.appels[0];
    expect(patch.url).toBe(`https://firestore.googleapis.com/v1/projects/${cfg.projet}/databases/(default)/documents/familles/${cfg.famille}/joueurs/p1`);
    expect(patch.init?.method).toBe('PATCH');
    expect((patch.init?.headers as Record<string, string>).Authorization).toBe('Bearer T1');
    expect(await lireClassement(cfg, f.d)).toEqual([entree]);
  });
});
