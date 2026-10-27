import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Pack, Profil, QueteSemaine } from './types';
import {
  chargerProfils, sauverProfils, chargerSemaine, sauverSemaine,
  chargerPacksImportes, sauverPacksImportes, chargerPin, sauverPin,
  chargerFamille, sauverFamille, dependancesFirebase, type Famille,
} from './stockage';
import { packs, domaines, installerPacks } from './packs';
import { MINI_JEUX, construireArbre, type MiniJeu } from './jeu/arbre';
import { avancerSemaine, dateDuJour, majJour, majSemaine, semaineDe } from './jeu/quetes';
import { ajouterCharge, jokerARecharger } from './jeu/jokers';
import { EcranProfils } from './ecrans/EcranProfils';
import { EcranJoueur } from './ecrans/EcranJoueur';
import { EcranArbre } from './ecrans/EcranArbre';
import { EcranDomaines } from './ecrans/EcranDomaines';
import { EcranQuiz, type Bilan } from './ecrans/EcranQuiz';
import { EcranResultats } from './ecrans/EcranResultats';
import { EcranMiniJeux } from './ecrans/EcranMiniJeux';
import { EcranFinJeu } from './ecrans/EcranFinJeu';
import { JEUX } from './ecrans/minijeux';
import { EcranDuel } from './ecrans/duel/EcranDuel';
import { EcranParent } from './ecrans/parent/EcranParent';
import type { Sauvegarde } from './jeu/sauvegarde';
import { EcranClassement } from './ecrans/EcranClassement';
import { debutSemaine, entreeDe } from './jeu/classement';
import { envoyerEntrees, supprimerEntree } from './net/classementEnLigne';
import { majRecord, type Partie, type ResultatJeu } from './jeu/minijeux';
import { celebration } from './jeu/celebration';
import { musique, musiqueActivee, memoriserMusique } from './son/musique';
import { BoutonMusique } from './ecrans/BoutonMusique';
import { appliquerTheme } from './themes/appliquer';
import { themeParId } from './themes/registre';
import { memoriserTheme } from './themes/dernier';

const MENUS = new Set(['profils', 'joueur', 'arbre', 'domaines', 'minijeux', 'classement', 'parent', 'resultats', 'finjeu']);

type Ecran =
  | { nom: 'profils' }
  | { nom: 'parent' }
  | { nom: 'joueur'; profilId: string }
  | { nom: 'arbre'; profilId: string }
  | { nom: 'domaines'; profilId: string }
  | { nom: 'quiz'; profilId: string; domaines: string[] }
  | { nom: 'resultats'; profilId: string; domaines: string[]; bilan: Bilan; avant: Profil }
  | { nom: 'minijeux'; profilId: string }
  | { nom: 'duel'; profilId: string }
  | { nom: 'classement'; profilId: string }
  | { nom: 'jeu'; profilId: string; jeu: MiniJeu; partie: Partie }
  | { nom: 'finjeu'; profilId: string; jeu: MiniJeu; partie: Partie; resultat: ResultatJeu; record: boolean; avant: Profil };

export function App() {
  const [profils, setProfils] = useState<Profil[] | null>(null);
  const [semaine, setSemaine] = useState<QueteSemaine | null>(null);
  const [ecran, setEcran] = useState<Ecran>({ nom: 'profils' });
  const [packsImportes, setPacksImportes] = useState<Pack[]>([]);
  const [pin, setPin] = useState<string | null>(null);
  const [versionPacks, setVersionPacks] = useState(0);
  const [famille, setFamille] = useState<Famille | null>(null);
  const minuteurSync = useRef<ReturnType<typeof setTimeout> | null>(null);
  // L'arbre dépend des packs installés (intégrés + importés)
  const arbre = useMemo(() => construireArbre(packs), [versionPacks]);

  useEffect(() => {
    Promise.all([chargerProfils(), chargerSemaine(), chargerPacksImportes(), chargerPin(), chargerFamille()]).then(([p, s, importes, h, fam]) => {
      setFamille(fam ?? null);
      installerPacks(importes);
      setPacksImportes(importes);
      setVersionPacks((v) => v + 1);
      setPin(h ?? null);
      setProfils(p);
      setSemaine(majSemaine(s, semaineDe()));
    });
  }, []);
  // Musique douce : seulement dans les menus, jamais en partie
  const [sonActif, setSonActif] = useState(() => musiqueActivee());
  const sonVoulu = useRef(false);
  sonVoulu.current = sonActif && MENUS.has(ecran.nom);
  useEffect(() => {
    const debloquer = () => musique.debloquer();
    const visibilite = () => { if (document.hidden) musique.couper(); else if (sonVoulu.current) musique.jouer(); };
    window.addEventListener('pointerdown', debloquer);
    window.addEventListener('keydown', debloquer);
    document.addEventListener('visibilitychange', visibilite);
    return () => {
      window.removeEventListener('pointerdown', debloquer);
      window.removeEventListener('keydown', debloquer);
      document.removeEventListener('visibilitychange', visibilite);
    };
  }, []);
  useEffect(() => { if (sonVoulu.current && !document.hidden) musique.jouer(); else musique.couper(); }, [sonActif, ecran.nom]);
  const changerSon = (v: boolean) => { setSonActif(v); memoriserMusique(v); };
  // Thème du joueur courant ; les écrans sans joueur (profils, parent) gardent le thème en place
  const idTheme = profils && 'profilId' in ecran ? profils.find((p) => p.id === ecran.profilId)?.theme : undefined;
  useEffect(() => {
    if (idTheme === undefined) return;
    const t = themeParId(idTheme);
    appliquerTheme(t);
    memoriserTheme(t.id);
  }, [idTheme]);

  if (!profils || !semaine) return <main class="ecran"><p>Chargement…</p></main>;

  /** Envoie les profils au classement de la famille (regroupé, silencieux hors ligne). */
  const synchroniser = (liste: Profil[], fam: Famille | null = famille) => {
    if (!fam) return;
    if (minuteurSync.current) clearTimeout(minuteurSync.current);
    minuteurSync.current = setTimeout(() => {
      if (!navigator.onLine) return;
      const sem = semaineDe();
      envoyerEntrees(fam.config, liste.map((p) => entreeDe(debutSemaine(p, sem), fam.appareil, sem)), dependancesFirebase)
        .catch(() => { /* hors ligne ou erreur : on réessaiera au prochain enregistrement */ });
    }, 2000);
  };
  const enregistrer = (liste: Profil[]) => { setProfils(liste); sauverProfils(liste); synchroniser(liste); };
  const changerFamille = (f: Famille | null) => { setFamille(f); sauverFamille(f); if (f) synchroniser(profils, f); };
  const maj = (p: Profil) =>
    enregistrer(profils.some((x) => x.id === p.id) ? profils.map((x) => (x.id === p.id ? p : x)) : [...profils, p]);
  const profil = (id: string) => profils.find((p) => p.id === id)!;
  const changerPacks = (liste: Pack[]) => {
    installerPacks(liste);
    setPacksImportes(liste);
    sauverPacksImportes(liste);
    setVersionPacks((v) => v + 1);
  };
  const changerPin = (hache: string | null) => { setPin(hache); sauverPin(hache); };
  const supprimerProfil = (id: string) => {
    enregistrer(profils.filter((p) => p.id !== id));
    if (famille && navigator.onLine) supprimerEntree(famille.config, id, dependancesFirebase).catch(() => {});
  };
  const restaurer = (s: Sauvegarde) => {
    enregistrer(s.profils);
    const sem = majSemaine(s.semaine ?? undefined, semaineDe());
    setSemaine(sem);
    sauverSemaine(sem);
    changerPacks(s.packs);
  };

  const ouvrir = (p: Profil) => {
    const p2 = debutSemaine(majJour(p, dateDuJour(), domaines), semaineDe());
    if (p2 !== p) maj(p2);
    setEcran({ nom: 'joueur', profilId: p.id });
  };

  /** Enregistre des profils après une partie et fait avancer la quête de la semaine. */
  const enregistrerPartie = (majs: Profil[], justes: number) => {
    const { semaine: s, terminee } = avancerSemaine(majSemaine(semaine, semaineDe()), justes);
    setSemaine(s);
    sauverSemaine(s);
    let liste = profils.map((x) => majs.find((m) => m.id === x.id) ?? x);
    // Quête de la semaine terminée : +1 charge de joker pour chaque profil
    if (terminee) liste = liste.map((x) => { const j = jokerARecharger(x); return j ? ajouterCharge(x, j) : x; });
    enregistrer(liste);
  };

  const finQuiz = (p: Profil, bilan: Bilan, doms: string[]) => {
    enregistrerPartie([p], bilan.justes);
    setEcran({ nom: 'resultats', profilId: p.id, domaines: doms, bilan, avant: profil(p.id) });
  };

  const finJeu = (jeu: MiniJeu, partie: Partie, p: Profil, resultat: ResultatJeu) => {
    const r = majRecord(p, jeu, resultat.score, partie.defi ? partie.domaines[0] : undefined);
    maj(r.profil);
    setEcran({ nom: 'finjeu', profilId: p.id, jeu, partie, resultat, record: r.nouveau, avant: profil(p.id) });
  };
  const nomJeu = (jeu: MiniJeu, partie: Partie) =>
    partie.defi ? `Défi ${MINI_JEUX[jeu].nom} ${partie.domaines[0]}` : MINI_JEUX[jeu].nom;

  const ecranCourant = (() => {
  switch (ecran.nom) {
    case 'profils':
      return <EcranProfils profils={profils} onCreer={maj} onChoisir={ouvrir} onParent={() => setEcran({ nom: 'parent' })} />;
    case 'parent':
      return <EcranParent pin={pin} profils={profils} packsImportes={packsImportes} semaine={semaine}
        onPin={changerPin} onPacks={changerPacks} onRestaurer={restaurer}
        onMajProfil={maj} onSupprimerProfil={supprimerProfil} famille={famille} onFamille={changerFamille} onRetour={() => setEcran({ nom: 'profils' })} />;
    case 'joueur':
      return <EcranJoueur profil={profil(ecran.profilId)} semaine={semaine} arbre={arbre}
        onJouer={() => setEcran({ nom: 'domaines', profilId: ecran.profilId })}
        onArbre={() => setEcran({ nom: 'arbre', profilId: ecran.profilId })}
        onMiniJeux={() => setEcran({ nom: 'minijeux', profilId: ecran.profilId })}
        onDuel={() => setEcran({ nom: 'duel', profilId: ecran.profilId })}
        onClassement={() => setEcran({ nom: 'classement', profilId: ecran.profilId })}
        onChanger={() => setEcran({ nom: 'profils' })} />;
    case 'arbre':
      return <EcranArbre profil={profil(ecran.profilId)} arbre={arbre} onMaj={maj}
        onRetour={() => setEcran({ nom: 'joueur', profilId: ecran.profilId })} />;
    case 'domaines':
      return <EcranDomaines profil={profil(ecran.profilId)} onRetour={() => setEcran({ nom: 'joueur', profilId: ecran.profilId })}
        onJouer={(d) => setEcran({ nom: 'quiz', profilId: ecran.profilId, domaines: d })} />;
    case 'quiz':
      return <EcranQuiz profil={profil(ecran.profilId)} domaines={ecran.domaines}
        onFin={(p, bilan) => finQuiz(p, bilan, ecran.domaines)} />;
    case 'resultats':
      return <EcranResultats profil={profil(ecran.profilId)} bilan={ecran.bilan} avant={ecran.avant}
        onRejouer={() => setEcran({ nom: 'quiz', profilId: ecran.profilId, domaines: ecran.domaines })}
        onRetour={() => setEcran({ nom: 'joueur', profilId: ecran.profilId })} />;
    case 'minijeux':
      return <EcranMiniJeux profil={profil(ecran.profilId)}
        onDefi={(jeu, d) => setEcran({ nom: 'jeu', profilId: ecran.profilId, jeu, partie: { domaines: [d], defi: true } })}
        onRetour={() => setEcran({ nom: 'joueur', profilId: ecran.profilId })}
        onJouer={(jeu) => setEcran({ nom: 'jeu', profilId: ecran.profilId, jeu, partie: { domaines, defi: false } })} />;
    case 'jeu': {
      const Jeu = JEUX[ecran.jeu];
      const retour = () => setEcran({ nom: 'minijeux', profilId: ecran.profilId });
      if (!Jeu) return <main class="ecran"><p>Bientôt !</p><button onClick={retour}>← Retour</button></main>;
      return <Jeu profil={profil(ecran.profilId)} partie={ecran.partie} onQuitter={retour}
        onFin={(p, r) => finJeu(ecran.jeu, ecran.partie, p, r)} />;
    }
    case 'finjeu':
      return <EcranFinJeu nom={nomJeu(ecran.jeu, ecran.partie)} resultat={ecran.resultat} record={ecran.record} celebration={celebration(ecran.avant, profil(ecran.profilId))}
        onRejouer={() => setEcran({ nom: 'jeu', profilId: ecran.profilId, jeu: ecran.jeu, partie: ecran.partie })}
        onRetour={() => setEcran({ nom: 'minijeux', profilId: ecran.profilId })} />;
    case 'duel':
      return <EcranDuel joueur={profil(ecran.profilId)} profils={profils} onFin={enregistrerPartie}
        onQuitter={() => setEcran({ nom: 'joueur', profilId: ecran.profilId })} />;
    case 'classement':
      return <EcranClassement famille={famille} onRetour={() => setEcran({ nom: 'joueur', profilId: ecran.profilId })} />;
  }
  })();
  return <>{MENUS.has(ecran.nom) && <BoutonMusique active={sonActif} onChange={changerSon} />}{ecranCourant}</>;
}
