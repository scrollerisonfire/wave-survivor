import { Application, BLEND_MODES, Container, Sprite, TilingSprite, type Texture } from 'pixi.js';
import { Sound } from './audio';
import { CELL_SIZE, ENEMY_TYPES, HEIGHT, MAX_ENEMIES, STEP, WIDTH } from './config';
import { Input } from './input';
import { createPlayer } from './player';
import { Pool } from './pool';
import { SpatialHash } from './spatialHash';
import { loadBest, saveBest } from './storage';
import { createTextures } from './textures';
import type { Bullet, Enemy, Gem, Particle, Player } from './types';
import { Ui } from './ui';
import { pickUpgrades } from './upgrades';
import { clamp, rnd } from './util';
import {
  WAVE_SECONDS,
  enemyHp,
  enemySpeed,
  pickKind,
  spawnCount,
  spawnInterval,
  xpNeeded,
} from './wave';

type State = 'menu' | 'play' | 'upgrade' | 'over';

export class Game {
  private app: Application;
  private tex = createTextures();
  private bg: TilingSprite;
  private ship: Sprite;
  private enemies: Pool<Enemy>;
  private bullets: Pool<Bullet>;
  private gems: Pool<Gem>;
  private particles: Pool<Particle>;
  private hash = new SpatialHash<Enemy>(WIDTH, HEIGHT, CELL_SIZE);
  private nearby: Enemy[] = [];
  private input: Input;
  private sound = new Sound();
  private ui = new Ui();
  private reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  private state: State = 'menu';
  private p: Player = createPlayer();
  private wave = 1;
  private kills = 0;
  private time = 0;
  private waveTimer = 0;
  private spawnTimer = 0;
  private shake = 0;
  private best = loadBest();
  private acc = 0;
  private hudTimer = 0;

  constructor(mount: HTMLElement) {
    this.app = new Application({
      width: WIDTH,
      height: HEIGHT,
      backgroundColor: 0x070b1a,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
    });
    const view = this.app.view as HTMLCanvasElement;
    mount.prepend(view);

    const layer = () => this.app.stage.addChild(new Container());
    const [lBg, lGem, lEnemy, lBullet, lPlayer, lFx] = [
      layer(),
      layer(),
      layer(),
      layer(),
      layer(),
      layer(),
    ];
    this.bg = lBg.addChild(new TilingSprite(this.tex.stars, WIDTH, HEIGHT));
    this.ship = this.sprite(lPlayer, this.tex.ship);
    this.ship.visible = false;

    this.enemies = new Pool(() => ({
      sprite: this.sprite(lEnemy, this.tex.sw),
      x: 0,
      y: 0,
      kind: 'sw',
      r: 0,
      speed: 0,
      damage: 0,
      xp: 0,
      hp: 0,
      dead: false,
      pop: 0,
    }));
    this.bullets = new Pool(() => ({
      sprite: this.sprite(lBullet, this.tex.bullet),
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      damage: 0,
      pierce: 0,
      last: null,
    }));
    this.gems = new Pool(() => ({ sprite: this.sprite(lGem, this.tex.gem), x: 0, y: 0 }));
    this.particles = new Pool(() => {
      const sprite = this.sprite(lFx, this.tex.puff);
      sprite.blendMode = BLEND_MODES.ADD;
      return { sprite, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1 };
    });

    this.input = new Input(view);
    addEventListener('keydown', (e) => this.onKey(e));
    this.app.ticker.add(() => this.frame());
    this.ui.showMenu(this.best, () => this.start());
  }

  private sprite(parent: Container, texture: Texture): Sprite {
    const s = new Sprite(texture);
    s.anchor.set(0.5);
    parent.addChild(s);
    return s;
  }

  private onKey(e: KeyboardEvent): void {
    if (this.state === 'upgrade' && /^Digit[1-3]$/.test(e.code)) {
      this.ui.pickByIndex(Number(e.code.slice(5)) - 1);
    } else if (
      (this.state === 'menu' || this.state === 'over') &&
      (e.code === 'Enter' || e.code === 'Space')
    ) {
      this.start();
    }
  }

  private start(): void {
    this.sound.unlock();
    for (const pool of [this.enemies, this.bullets, this.gems, this.particles]) pool.clear();
    this.p = createPlayer();
    this.wave = 1;
    this.kills = 0;
    this.time = 0;
    this.waveTimer = 0;
    this.spawnTimer = 0.5;
    this.state = 'play';
    this.ui.hide();
    this.ui.showBanner('Wave 1');
  }

  /** Fixed-timestep loop: simulation always advances in 1/60 s steps, whatever the display rate. */
  private frame(): void {
    this.acc += Math.min(this.app.ticker.deltaMS, 100) / 1000;
    while (this.acc >= STEP) {
      this.update(STEP);
      this.acc -= STEP;
    }
    if (this.state === 'menu') this.bg.tilePosition.y += 0.3;
    this.ship.visible = this.state !== 'menu';

    this.hudTimer += this.app.ticker.deltaMS;
    if (this.hudTimer > 100) {
      this.hudTimer = 0;
      this.ui.hud({
        hp: this.p.hp / this.p.max,
        xp: this.p.xp / this.p.need,
        wave: this.wave,
        kills: this.kills,
        fps: Math.round(this.app.ticker.FPS),
      });
    }
  }

  private spawnEnemy(): void {
    if (this.enemies.live.length >= MAX_ENEMIES) return;
    const kind = pickKind(this.wave, Math.random());
    const def = ENEMY_TYPES[kind];
    const e = this.enemies.get();
    const side = Math.floor(Math.random() * 4);
    e.x = side < 2 ? rnd(0, WIDTH) : side === 2 ? -30 : WIDTH + 30;
    e.y = side < 2 ? (side === 0 ? -30 : HEIGHT + 30) : rnd(0, HEIGHT);
    e.kind = kind;
    e.sprite.texture = this.tex[kind];
    e.r = def.r;
    e.speed = enemySpeed(kind, this.wave);
    e.damage = def.damage;
    e.xp = def.xp;
    e.hp = enemyHp(kind, this.wave);
    e.dead = false;
    e.pop = 0;
    e.sprite.position.set(e.x, e.y);
  }

  private burst(x: number, y: number, color: number, count: number, speed: number): void {
    for (let i = 0; i < count; i++) {
      const part = this.particles.get();
      const a = rnd(0, Math.PI * 2);
      const v = rnd(speed * 0.3, speed);
      part.x = x;
      part.y = y;
      part.vx = Math.cos(a) * v;
      part.vy = Math.sin(a) * v;
      part.life = part.max = rnd(0.25, 0.5);
      part.sprite.tint = color;
      part.sprite.position.set(x, y);
    }
  }

  private shoot(tx: number, ty: number): void {
    const p = this.p;
    const aim = Math.atan2(ty - p.y, tx - p.x);
    p.angle = aim;
    for (let k = 0; k < p.multi; k++) {
      const a = aim + (k - (p.multi - 1) / 2) * 0.2;
      const b = this.bullets.get();
      b.x = p.x;
      b.y = p.y;
      b.vx = Math.cos(a) * 540;
      b.vy = Math.sin(a) * 540;
      b.life = 1.1;
      b.damage = p.damage;
      b.pierce = p.pierce;
      b.last = null;
      b.sprite.rotation = a;
      b.sprite.position.set(b.x, b.y);
    }
    this.sound.shoot();
  }

  private openUpgrades(): void {
    this.state = 'upgrade';
    this.sound.levelUp();
    this.ui.showUpgrades(this.p.level, pickUpgrades(this.p), (u) => {
      u.apply(this.p);
      this.ui.hide();
      this.state = 'play';
    });
  }

  private gameOver(): void {
    this.state = 'over';
    this.sound.gameOver();
    if (this.kills > this.best) {
      this.best = this.kills;
      saveBest(this.best);
    }
    this.ui.showGameOver(this.wave, this.kills, this.best, () => this.start());
  }

  private update(dt: number): void {
    if (this.state !== 'play') return;
    const p = this.p;
    this.time += dt;

    const dir = this.input.vector();
    p.x = clamp(p.x + dir.x * p.speed * dt, 20, WIDTH - 20);
    p.y = clamp(p.y + dir.y * p.speed * dt, 20, HEIGHT - 20);
    p.invuln -= dt;

    this.waveTimer += dt;
    if (this.waveTimer >= WAVE_SECONDS) {
      this.waveTimer = 0;
      this.wave++;
      this.ui.showBanner(`Wave ${this.wave}`);
      this.sound.wave();
    }
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = spawnInterval(this.wave);
      for (let i = 0, n = spawnCount(this.wave); i < n; i++) this.spawnEnemy();
    }

    // Enemies: move, rebuild spatial hash, find nearest target, contact damage.
    this.hash.clear();
    let target: Enemy | null = null;
    let targetDist = 420 * 420;
    for (const e of this.enemies.live) {
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const d = Math.hypot(dx, dy) || 1;
      e.x += (dx / d) * e.speed * dt;
      e.y += (dy / d) * e.speed * dt;
      e.pop = Math.max(0, e.pop - dt * 6);
      e.sprite.scale.set(1 + e.pop * 0.3);
      e.sprite.position.set(e.x, e.y);
      if (e.kind === 'da') e.sprite.rotation = Math.atan2(dy, dx) + Math.PI / 2;
      else e.sprite.rotation += dt * (e.kind === 'ta' ? 0.8 : 2.5);
      this.hash.insert(e);
      if (d * d < targetDist) {
        targetDist = d * d;
        target = e;
      }
      if (d < e.r + 12 && p.invuln <= 0) {
        p.hp -= e.damage;
        p.invuln = 0.6;
        this.shake = Math.max(this.shake, 10);
        this.burst(p.x, p.y, 0xff4fa3, 10, 160);
        this.sound.hurt();
        if (p.hp <= 0) return this.gameOver();
      }
    }

    p.cooldown -= dt;
    if (p.cooldown <= 0 && target) {
      p.cooldown = p.rate;
      this.shoot(target.x, target.y);
    }

    // Bullets: move, then test only enemies from the 3x3 neighbouring cells.
    for (let i = this.bullets.live.length - 1; i >= 0; i--) {
      const b = this.bullets.live[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      b.sprite.position.set(b.x, b.y);
      if (b.life <= 0 || b.x < -20 || b.x > WIDTH + 20 || b.y < -20 || b.y > HEIGHT + 20) {
        this.bullets.release(i);
        continue;
      }
      for (const e of this.hash.nearby(b.x, b.y, this.nearby)) {
        if (e.dead || e === b.last) continue;
        const dx = e.x - b.x;
        const dy = e.y - b.y;
        const rr = e.r + 5;
        if (dx * dx + dy * dy >= rr * rr) continue;
        e.hp -= b.damage;
        e.pop = 1;
        this.burst(b.x, b.y, 0xffffff, 2, 120);
        this.sound.hit();
        if (e.hp <= 0) e.dead = true;
        if (b.pierce > 0) {
          b.pierce--;
          b.last = e;
        } else {
          this.bullets.release(i);
          break;
        }
      }
    }

    // Deaths: score, particles, XP gems.
    for (let i = this.enemies.live.length - 1; i >= 0; i--) {
      const e = this.enemies.live[i];
      if (!e.dead) continue;
      this.kills++;
      this.burst(e.x, e.y, ENEMY_TYPES[e.kind].color, e.kind === 'ta' ? 22 : 10, 220);
      this.shake = Math.max(this.shake, e.kind === 'ta' ? 7 : 2);
      this.sound.kill();
      for (let g = 0; g < e.xp; g++) {
        const gem = this.gems.get();
        gem.x = e.x + rnd(-8, 8);
        gem.y = e.y + rnd(-8, 8);
        gem.sprite.position.set(gem.x, gem.y);
      }
      this.enemies.release(i);
    }

    // Gems: magnet pull, pickup, level-up.
    for (let i = this.gems.live.length - 1; i >= 0; i--) {
      const gem = this.gems.live[i];
      const dx = p.x - gem.x;
      const dy = p.y - gem.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d < p.magnet) {
        gem.x += (dx / d) * 340 * dt;
        gem.y += (dy / d) * 340 * dt;
        gem.sprite.position.set(gem.x, gem.y);
      }
      if (d < 16) {
        this.gems.release(i);
        p.xp++;
        this.sound.gem(p.xp);
        if (p.xp >= p.need) {
          p.xp = 0;
          p.level++;
          p.need = xpNeeded(p.level);
          this.openUpgrades();
          break;
        }
      }
    }

    for (let i = this.particles.live.length - 1; i >= 0; i--) {
      const part = this.particles.live[i];
      part.life -= dt;
      if (part.life <= 0) {
        this.particles.release(i);
        continue;
      }
      part.x += part.vx * dt;
      part.y += part.vy * dt;
      part.vx *= 0.96;
      part.vy *= 0.96;
      const t = part.life / part.max;
      part.sprite.position.set(part.x, part.y);
      part.sprite.alpha = t;
      part.sprite.scale.set(0.4 + t * 0.8);
    }

    // Player visuals + screen shake.
    this.ship.position.set(p.x, p.y);
    if (!target && Math.hypot(dir.x, dir.y) > 0.1) p.angle = Math.atan2(dir.y, dir.x);
    this.ship.rotation = p.angle;
    this.ship.alpha = p.invuln > 0 && Math.sin(this.time * 50) > 0 ? 0.35 : 1;
    this.bg.tilePosition.set(-p.x * 0.06, -p.y * 0.06 + this.time * 8);
    this.shake = Math.max(0, this.shake - 40 * dt);
    const s = this.reducedMotion ? 0 : this.shake;
    this.app.stage.position.set(rnd(-1, 1) * s, rnd(-1, 1) * s);
  }
}
