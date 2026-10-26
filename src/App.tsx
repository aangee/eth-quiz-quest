import { useEffect, useState } from 'preact/hooks';
import type { Profil } from './types';
import { chargerProfils, sauverProfils } from './stockage';
import { EcranProfils } from './ecrans/EcranProfils';
import { EcranDomaines } from './ecrans/EcranDomaines';
import { EcranQuiz, type Bilan } from './ecrans/EcranQuiz';
import { EcranResultats } from './ecrans/EcranResultats';

type Ecran =
  | { nom: 'profils' }
  | { nom: 'domaines'; profilId: string }
  | { nom: 'quiz'; profilId: string; domaines: string[] }
  | { nom: 'resultats'; profilId: string; domaines: string[]; bilan: Bilan };

export function App() {
  const [profils, setProfils] = useState<Profil[] | null>(null);
  const [ecran, setEcran] = useState<Ecran>({ nom: 'profils' });

  useEffect(() => { chargerProfils().then(setProfils); }, []);
  if (!profils) return <main class="ecran"><p>Chargement…</p></main>;

  const maj = (p: Profil) => {
    const liste = profils.some((x) => x.id === p.id) ? profils.map((x) => (x.id === p.id ? p : x)) : [...profils, p];
    setProfils(liste);
    sauverProfils(liste);
  };
  const profil = (id: string) => profils.find((p) => p.id === id)!;

  switch (ecran.nom) {
    case 'profils':
      return <EcranProfils profils={profils} onCreer={maj} onChoisir={(p) => setEcran({ nom: 'domaines', profilId: p.id })} />;
    case 'domaines':
      return <EcranDomaines profil={profil(ecran.profilId)} onRetour={() => setEcran({ nom: 'profils' })}
        onJouer={(d) => setEcran({ nom: 'quiz', profilId: ecran.profilId, domaines: d })} />;
    case 'quiz':
      return <EcranQuiz profil={profil(ecran.profilId)} domaines={ecran.domaines}
        onFin={(p, bilan) => { maj(p); setEcran({ nom: 'resultats', profilId: p.id, domaines: ecran.domaines, bilan }); }} />;
    case 'resultats':
      return <EcranResultats profil={profil(ecran.profilId)} bilan={ecran.bilan}
        onRejouer={() => setEcran({ nom: 'quiz', profilId: ecran.profilId, domaines: ecran.domaines })}
        onAccueil={() => setEcran({ nom: 'profils' })} />;
  }
}
