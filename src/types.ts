import type { Sprite } from 'pixi.js';
import type { EnemyKind } from './config';

export interface Enemy {
  sprite: Sprite;
  x: number;
  y: number;
  kind: EnemyKind;
  r: number;
  speed: number;
  damage: number;
  xp: number;
  hp: number;
  dead: boolean;
  pop: number;
}

export interface Bullet {
  sprite: Sprite;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  damage: number;
  pierce: number;
  last: Enemy | null;
}

export interface Gem {
  sprite: Sprite;
  x: number;
  y: number;
}

export interface Particle {
  sprite: Sprite;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
}

export interface Player {
  x: number;
  y: number;
  hp: number;
  max: number;
  speed: number;
  /** Seconds between shots. */
  rate: number;
  cooldown: number;
  damage: number;
  multi: number;
  pierce: number;
  magnet: number;
  xp: number;
  level: number;
  need: number;
  invuln: number;
  angle: number;
}
