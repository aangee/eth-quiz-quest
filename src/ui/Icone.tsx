import { ICONES, type NomIcone } from './icones';

/** Icône SVG au trait, colorée par `currentColor` (donc par le thème). Décorative sauf si `titre` est donné. */
export function Icone({ nom, taille = 22, titre, pleine }: { nom: NomIcone; taille?: number; titre?: string; pleine?: boolean }) {
  return (
    <svg class={pleine ? 'icone pleine' : 'icone'} width={taille} height={taille} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      {...(titre ? { role: 'img', 'aria-label': titre } : { 'aria-hidden': 'true' })}>
      {ICONES[nom].map((d) => <path key={d} d={d} />)}
    </svg>
  );
}
