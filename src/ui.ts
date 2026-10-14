import type { Upgrade } from './upgrades';

function el<T extends HTMLElement>(selector: string): T {
  const node = document.querySelector<T>(selector);
  if (!node) throw new Error(`Missing element: ${selector}`);
  return node;
}

export interface HudState {
  hp: number;
  xp: number;
  wave: number;
  kills: number;
  fps: number;
}

/** All DOM overlays and the HUD. The game loop never touches the DOM except through this class. */
export class Ui {
  private overlay = el<HTMLElement>('#ov');
  private banner = el<HTMLElement>('#banner');
  private hp = el<HTMLElement>('#hp i');
  private xp = el<HTMLElement>('#xp i');
  private wave = el<HTMLElement>('#wv');
  private kills = el<HTMLElement>('#kl');
  private fps = el<HTMLElement>('#fps');

  hud(s: HudState): void {
    this.hp.style.width = `${Math.max(0, s.hp * 100)}%`;
    this.xp.style.width = `${s.xp * 100}%`;
    this.wave.textContent = String(s.wave);
    this.kills.textContent = String(s.kills);
    this.fps.textContent = String(s.fps);
  }

  showBanner(text: string): void {
    this.banner.textContent = text;
    this.banner.style.opacity = '1';
    setTimeout(() => (this.banner.style.opacity = '0'), 900);
  }

  hide(): void {
    this.overlay.hidden = true;
  }

  private show(html: string): void {
    this.overlay.innerHTML = html;
    this.overlay.hidden = false;
  }

  showMenu(best: number, onStart: () => void): void {
    this.show(`<div class="panel"><h1>Wave Survivor</h1>
      <p>Your ship fires automatically at the nearest enemy. Dodge the swarm, collect cyan gems,
      and pick an upgrade each level.${best ? `<br>Best run: ${best} kills.` : ''}</p>
      <button id="go">Start run</button></div>`);
    const go = el<HTMLButtonElement>('#go');
    go.onclick = onStart;
    go.focus();
  }

  showUpgrades(level: number, options: Upgrade[], onPick: (u: Upgrade) => void): void {
    const buttons = options
      .map((u, i) => `<button>${i + 1}. ${u.name}<small>${u.desc}</small></button>`)
      .join('');
    this.show(
      `<div class="panel"><h2>Level ${level}: choose an upgrade</h2><div class="opts">${buttons}</div></div>`,
    );
    const nodes = this.overlay.querySelectorAll<HTMLButtonElement>('button');
    nodes.forEach((b, i) => (b.onclick = () => onPick(options[i])));
    nodes[0]?.focus();
  }

  /** Triggers upgrade choice `index` (0-based) from the keyboard. */
  pickByIndex(index: number): void {
    this.overlay.querySelectorAll<HTMLButtonElement>('button')[index]?.click();
  }

  showGameOver(wave: number, kills: number, best: number, onRestart: () => void): void {
    this.show(`<div class="panel"><h2>Run over</h2>
      <p>You reached wave ${wave} and destroyed ${kills} enemies.<br>Best run: ${best} kills.</p>
      <button id="go">Run again</button></div>`);
    const go = el<HTMLButtonElement>('#go');
    go.onclick = onRestart;
    go.focus();
  }
}
