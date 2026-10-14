export const WIDTH = 960;
export const HEIGHT = 600;
export const CELL_SIZE = 48;
export const MAX_ENEMIES = 450;
export const STEP = 1 / 60;

export const ENEMY_TYPES = {
  sw: { hp: 2, speed: 70, r: 11, damage: 8, xp: 1, color: 0xff4fa3, hpPerWave: 0.35 },
  da: { hp: 3, speed: 135, r: 9, damage: 10, xp: 1, color: 0xa77bff, hpPerWave: 0.35 },
  ta: { hp: 10, speed: 42, r: 18, damage: 16, xp: 3, color: 0xffc94a, hpPerWave: 1.5 },
} as const;

export type EnemyKind = keyof typeof ENEMY_TYPES;
