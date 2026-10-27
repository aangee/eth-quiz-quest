import { useEffect, useState } from 'preact/hooks';
import type { Profil, QueteSemaine } from './types';
import { chargerProfils, sauverProfils, chargerSemaine, sauverSemaine } from './stockage';
import { packs, domaines } from './packs';
import { construireArbre } from './jeu/arbre';
import { avancerSemaine, dateDuJour, majJour, majSemaine, semaineDe } from './jeu/quetes';
import { ajouterCharge, jokerARecharger } from './jeu/jokers';
import { EcranProfils } from './ecrans/EcranProfils';
import { EcranJoueur } from './ecrans/EcranJoueur';
import { EcranArbre } from './ecrans/EcranArbre';
import { EcranDomaines } from './ecrans/EcranDomaines';
import { EcranQuiz, type Bilan } from './ecrans/EcranQuiz';
import { EcranResultats } from './ecrans/EcranResultats';

const arbre = construireArbre(packs);

type Ecran =
  | { nom: 'profils' }
  | { nom: 'joueur'; profilId: string }
  | { nom: 'arbre'; profilId: string }
  | { nom: 'domaines'; profilId: string }
  | { nom: 'quiz'; profilId: string; domaines: string[] }
  | { nom: 'resultats'; profilId: string; domaines: string[]; bilan: Bilan };

export function App() {
  const [profils, setProfils] = useState<Profil[] | null>(null);
  const [semaine, setSemaine] = useState<QueteSemaine | null>(null);
  const [ecran, setEcran] = useState<Ecran>({ nom: 'profils' });

  useEffect(() => {
    Promise.all([chargerProfils(), chargerSemaine()]).then(([p, s]) => {
      setProfils(p);
      setSemaine(majSemaine(s, semaineDe()));
    });
  }, []);
  if (!profils || !semaine) return <main class="ecran"><p>Chargement…</p></main>;

  const enregistrer = (liste: Profil[]) => { setProfils(liste); sauverProfils(liste); };
  const maj = (p: Profil) =>
    enregistrer(profils.some((x) => x.id === p.id) ? profils.map((x) => (x.id === p.id ? p : x)) : [...profils, p]);
  const profil = (id: string) => profils.find((p) => p.id === id)!;

  const ouvrir = (p: Profil) => {
    const p2 = majJour(p, dateDuJour(), domaines);
    if (p2 !== p) maj(p2);
    setEcran({ nom: 'joueur', profilId: p.id });
  };

  const finQuiz = (p: Profil, bilan: Bilan, doms: string[]) => {
    const { semaine: s, terminee } = avancerSemaine(majSemaine(semaine, semaineDe()), bilan.justes);
    setSemaine(s);
    sauverSemaine(s);
    let liste = profils.map((x) => (x.id === p.id ? p : x));
    // Quête de la semaine terminée : +1 charge de joker pour chaque profil
    if (terminee) liste = liste.map((x) => { const j = jokerARecharger(x); return j ? ajouterCharge(x, j) : x; });
    enregistrer(liste);
    setEcran({ nom: 'resultats', profilId: p.id, domaines: doms, bilan });
  };

  switch (ecran.nom) {
    case 'profils':
      return <EcranProfils profils={profils} onCreer={maj} onChoisir={ouvrir} />;
    case 'joueur':
      return <EcranJoueur profil={profil(ecran.profilId)} semaine={semaine} arbre={arbre}
        onJouer={() => setEcran({ nom: 'domaines', profilId: ecran.profilId })}
        onArbre={() => setEcran({ nom: 'arbre', profilId: ecran.profilId })}
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
      return <EcranResultats profil={profil(ecran.profilId)} bilan={ecran.bilan}
        onRejouer={() => setEcran({ nom: 'quiz', profilId: ecran.profilId, domaines: ecran.domaines })}
        onRetour={() => setEcran({ nom: 'joueur', profilId: ecran.profilId })} />;
  }
}
