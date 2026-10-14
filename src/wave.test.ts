import { describe, expect, it } from 'vitest';
import { enemyHp, pickKind, spawnCount, spawnInterval, xpNeeded } from './wave';

describe('wave scaling', () => {
  it('spawns faster each wave but never below the floor', () => {
    expect(spawnInterval(2)).toBeLessThan(spawnInterval(1));
    expect(spawnInterval(100)).toBe(0.12);
  });

  it('adds one extra enemy per spawn every three waves', () => {
    expect([1, 3, 6].map(spawnCount)).toEqual([1, 2, 3]);
  });

  it('unlocks harder enemy kinds in later waves', () => {
    expect(pickKind(1, 0.01)).toBe('sw');
    expect(pickKind(3, 0.2)).toBe('da');
    expect(pickKind(5, 0.1)).toBe('ta');
    expect(pickKind(5, 0.9)).toBe('sw');
  });

  it('scales enemy health and level requirements', () => {
    expect(enemyHp('ta', 4)).toBe(16);
    expect(xpNeeded(2)).toBeGreaterThan(xpNeeded(1));
  });
});
