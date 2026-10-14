import { ENEMY_TYPES, type EnemyKind } from './config';

export const WAVE_SECONDS = 20;

export const spawnInterval = (wave: number): number => Math.max(0.12, 0.8 - wave * 0.06);

export const spawnCount = (wave: number): number => 1 + Math.floor(wave / 3);

/** Picks an enemy kind for a roll in [0, 1). Harder kinds unlock in later waves. */
export function pickKind(wave: number, roll: number): EnemyKind {
  if (wave >= 5 && roll < 0.18) return 'ta';
  if (wave >= 3 && roll < 0.4) return 'da';
  return 'sw';
}

export const enemyHp = (kind: EnemyKind, wave: number): number =>
  ENEMY_TYPES[kind].hp + Math.floor(wave * ENEMY_TYPES[kind].hpPerWave);

export const enemySpeed = (kind: EnemyKind, wave: number): number =>
  ENEMY_TYPES[kind].speed * (1 + wave * 0.02);

export const xpNeeded = (level: number): number => 4 + level * 3;
