/** Fréquence d'une note MIDI (69 = la 440 Hz). */
export function frequence(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Boucle douce : do maj7 – la m7 – fa maj7 – sol6, 4 secondes chacun. */
export const ACCORDS: number[][] = [[48, 55, 64, 71], [45, 52, 60, 67], [41, 48, 57, 64], [43, 50, 59, 64]];
const DUREE_ACCORD = 4;
const VOLUME = 0.05;

/** Petit synthétiseur Web Audio : nappe d'accords + quatre notes cristallines par accord (toujours les mêmes). */
class Musique {
  private ctx: AudioContext | null = null;
  private maitre: GainNode | null = null;
  private voulu = false;
  private minuteur: ReturnType<typeof setInterval> | null = null;
  private prochain = 0;
  private indice = 0;

  /** À appeler sur un geste (toucher, clic, touche) : les navigateurs interdisent le son avant. */
  debloquer() {
    if (!this.ctx) {
      const Contexte = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Contexte) return;
      this.ctx = new Contexte();
      this.maitre = this.ctx.createGain();
      this.maitre.gain.value = 0;
      const filtre = this.ctx.createBiquadFilter();
      filtre.type = 'lowpass';
      filtre.frequency.value = 1400;
      this.maitre.connect(filtre).connect(this.ctx.destination);
    }
    if (this.voulu) this.lancer();
  }

  jouer() {
    this.voulu = true;
    if (this.ctx) this.lancer();
  }

  couper() {
    this.voulu = false;
    if (this.minuteur) { clearInterval(this.minuteur); this.minuteur = null; }
    if (!this.ctx || !this.maitre) return;
    const t = this.ctx.currentTime;
    this.maitre.gain.cancelScheduledValues(t);
    this.maitre.gain.setTargetAtTime(0, t, 0.4);
  }

  private lancer() {
    const ctx = this.ctx!;
    const maitre = this.maitre!;
    ctx.resume();
    const t = ctx.currentTime;
    maitre.gain.cancelScheduledValues(t);
    maitre.gain.setTargetAtTime(VOLUME, t, 1.2);
    if (this.minuteur) return;
    this.prochain = Math.max(this.prochain, t + 0.1);
    this.planifier();
    this.minuteur = setInterval(() => this.planifier(), 1000);
  }

  private planifier() {
    const ctx = this.ctx!;
    while (this.prochain < ctx.currentTime + 2) {
      this.accord(ACCORDS[this.indice % ACCORDS.length], this.prochain);
      this.indice++;
      this.prochain += DUREE_ACCORD;
    }
  }

  private accord(notes: number[], t: number) {
    notes.forEach((n, k) => this.note(frequence(n), t, DUREE_ACCORD + 1, k === 0 ? 'triangle' : 'sine', 0.22, 1.2));
    [0, 1, 2, 3].forEach((k) => this.note(frequence(notes[(k + 1) % notes.length] + 12), t + k, 0.9, 'sine', 0.08, 0.02));
  }

  private note(f: number, debut: number, duree: number, type: OscillatorType, niveau: number, attaque: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.value = f;
    env.gain.setValueAtTime(0, debut);
    env.gain.linearRampToValueAtTime(niveau, debut + attaque);
    env.gain.setTargetAtTime(0, Math.max(debut + attaque, debut + duree - 0.8), 0.4);
    osc.connect(env).connect(this.maitre!);
    osc.start(debut);
    osc.stop(debut + duree + 1);
  }
}

export const musique = new Musique();

/** Préférence de l'appareil (activée par défaut). */
export function musiqueActivee(): boolean {
  try { return localStorage.getItem('musique') !== 'non'; } catch { return true; }
}

export function memoriserMusique(active: boolean): void {
  try { localStorage.setItem('musique', active ? 'oui' : 'non'); } catch { /* stockage indisponible : choix non mémorisé */ }
}
