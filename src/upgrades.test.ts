import { describe, expect, it } from 'vitest';
import { createPlayer } from './player';
import { UPGRADES, pickUpgrades } from './upgrades';

describe('upgrades', () => {
  it('offers three distinct upgrades', () => {
    const picks = pickUpgrades(createPlayer(), () => 0.3);
    expect(picks).toHaveLength(3);
    expect(new Set(picks.map((u) => u.name)).size).toBe(3);
  });

  it('stops offering capped upgrades', () => {
    const p = createPlayer();
    p.multi = 5;
    p.pierce = 4;
    const names = pickUpgrades(p, Math.random, UPGRADES.length).map((u) => u.name);
    expect(names).not.toContain('Twin shot');
    expect(names).not.toContain('Piercing');
  });

  it('repair never exceeds max HP', () => {
    const p = createPlayer();
    p.hp = 90;
    UPGRADES.find((u) => u.name === 'Repair')?.apply(p);
    expect(p.hp).toBe(p.max);
  });
});
