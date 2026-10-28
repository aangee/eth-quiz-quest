import { useState } from 'preact/hooks';
import type { Pack, Profil, QueteSemaine } from '../../types';
import type { Sauvegarde } from '../../jeu/sauvegarde';
import { VerrouPin } from './VerrouPin';
import { SectionPacks } from './SectionPacks';
import { SectionSauvegarde } from './SectionSauvegarde';
import { SectionProfils } from './SectionProfils';
import { SectionClassement } from './SectionClassement';
import type { Famille } from '../../stockage';
import { Icone } from '../../ui/Icone';
import { EnteteRetour } from '../../ui/EnteteRetour';

export function EcranParent(props: {
  pin: string | null; profils: Profil[]; packsImportes: Pack[]; semaine: QueteSemaine;
  famille: Famille | null; onFamille: (f: Famille | null) => void;
  onPin: (hache: string | null) => void; onPacks: (l: Pack[]) => void; onRestaurer: (s: Sauvegarde) => void;
  onMajProfil: (p: Profil) => void; onSupprimerProfil: (id: string) => void; onRetour: () => void;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [changerPin, setChangerPin] = useState(false);

  if (!ouvert || changerPin) {
    return (
      <VerrouPin pin={changerPin ? null : props.pin} onPin={props.onPin}
        onOuvrir={() => { setOuvert(true); setChangerPin(false); }}
        onRetour={changerPin ? () => setChangerPin(false) : props.onRetour} />
    );
  }
  return (
    <main class="ecran">
      <EnteteRetour libelle="Accueil" onRetour={props.onRetour}><Icone nom="cadenas" /> Espace parent</EnteteRetour>
      <SectionPacks packsImportes={props.packsImportes} onPacks={props.onPacks} />
      <SectionSauvegarde profils={props.profils} semaine={props.semaine} packsImportes={props.packsImportes} onRestaurer={props.onRestaurer} />
      <SectionProfils profils={props.profils} onMaj={props.onMajProfil} onSupprimer={props.onSupprimerProfil} />
      <SectionClassement famille={props.famille} onFamille={props.onFamille} />
      <button onClick={() => setChangerPin(true)}><Icone nom="cadenas" /> Changer le code PIN</button>
    </main>
  );
}
