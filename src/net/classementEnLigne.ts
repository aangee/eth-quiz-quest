import type { ConfigFamille } from './famille';
import type { EntreeClassement } from '../jeu/classement';
import { depuisFirestore, versFirestore } from './firestore';

/** Jeton de la connexion anonyme Firebase (gardé sur l'appareil). */
export interface Jeton { projet: string; idToken: string; refreshToken: string; expire: number }

export interface Dependances {
  fetch: typeof fetch;
  lireJeton(): Promise<Jeton | undefined>;
  ecrireJeton(j: Jeton): Promise<void>;
  maintenant(): number;
}

const joueurs = (c: ConfigFamille) =>
  `https://firestore.googleapis.com/v1/projects/${c.projet}/databases/(default)/documents/familles/${c.famille}/joueurs`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function lireJson(r: Response): Promise<any> {
  if (!r.ok) throw new Error(`Firebase a répondu ${r.status}`);
  return r.json();
}

async function connexionAnonyme(c: ConfigFamille, d: Dependances): Promise<Jeton> {
  const r = await lireJson(await d.fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${c.cle}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }),
  }));
  return { projet: c.projet, idToken: r.idToken, refreshToken: r.refreshToken, expire: d.maintenant() + Number(r.expiresIn) * 1000 };
}

async function rafraichir(c: ConfigFamille, j: Jeton, d: Dependances): Promise<Jeton> {
  const r = await lireJson(await d.fetch(`https://securetoken.googleapis.com/v1/token?key=${c.cle}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(j.refreshToken)}`,
  }));
  return { projet: c.projet, idToken: r.id_token, refreshToken: r.refresh_token, expire: d.maintenant() + Number(r.expires_in) * 1000 };
}

/** Jeton valide : réutilisé, rafraîchi, ou nouvelle connexion anonyme. */
export async function obtenirJeton(c: ConfigFamille, d: Dependances): Promise<string> {
  const j = await d.lireJeton();
  if (j && j.projet === c.projet && j.expire > d.maintenant() + 60_000) return j.idToken;
  let nouveau: Jeton;
  try {
    nouveau = j && j.projet === c.projet ? await rafraichir(c, j, d) : await connexionAnonyme(c, d);
  } catch {
    nouveau = await connexionAnonyme(c, d);
  }
  await d.ecrireJeton(nouveau);
  return nouveau.idToken;
}

export async function envoyerEntrees(c: ConfigFamille, entrees: EntreeClassement[], d: Dependances): Promise<void> {
  if (!entrees.length) return;
  const t = await obtenirJeton(c, d);
  await Promise.all(entrees.map(async (e) => lireJson(await d.fetch(`${joueurs(c)}/${encodeURIComponent(e.id)}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(versFirestore(e)),
  }))));
}

export async function supprimerEntree(c: ConfigFamille, id: string, d: Dependances): Promise<void> {
  const t = await obtenirJeton(c, d);
  await lireJson(await d.fetch(`${joueurs(c)}/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${t}` } }));
}

export async function lireClassement(c: ConfigFamille, d: Dependances): Promise<EntreeClassement[]> {
  const t = await obtenirJeton(c, d);
  const r = await lireJson(await d.fetch(`${joueurs(c)}?pageSize=300`, { headers: { Authorization: `Bearer ${t}` } }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (r.documents ?? []).flatMap((doc: any) => { const e = depuisFirestore(doc); return e ? [e] : []; });
}
