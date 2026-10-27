export function BoutonMusique({ active, onChange }: { active: boolean; onChange: (v: boolean) => void }) {
  return (
    <button class="bouton-musique" aria-label={active ? 'Couper la musique' : 'Mettre la musique'} onClick={() => onChange(!active)}>
      {active ? '🎵' : '🔇'}
    </button>
  );
}
