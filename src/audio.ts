import { rnd } from './util';

type Wave = OscillatorType;

/** Tiny WebAudio synth: every effect is a short oscillator blip, so no audio files are needed. */
export class Sound {
  private ctx: AudioContext | null = null;
  private lastHit = 0;

  /** Browsers only allow audio after a user gesture, so call this from the Start click. */
  unlock(): void {
    if (this.ctx) return;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctor) this.ctx = new Ctor();
  }

  private blip(freq: number, dur = 0.08, type: Wave = 'square', vol = 0.035, slide = 0): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(t + dur);
  }

  shoot(): void {
    this.blip(rnd(700, 820), 0.05, 'square', 0.02, -300);
  }
  hit(): void {
    const now = performance.now();
    if (now - this.lastHit < 45) return;
    this.lastHit = now;
    this.blip(rnd(200, 260), 0.05, 'triangle', 0.03);
  }
  kill(): void {
    this.blip(rnd(90, 130), 0.12, 'sawtooth', 0.04, -50);
  }
  hurt(): void {
    this.blip(140, 0.15, 'sawtooth', 0.05, -60);
  }
  gem(count: number): void {
    this.blip(900 + count * 20, 0.05, 'sine', 0.03);
  }
  levelUp(): void {
    this.blip(520, 0.25, 'triangle', 0.06, 500);
  }
  wave(): void {
    this.blip(330, 0.3, 'triangle', 0.05, 330);
  }
  gameOver(): void {
    this.blip(180, 0.6, 'sawtooth', 0.06, -120);
  }
}
