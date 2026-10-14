import type { Player } from './types';

export interface Upgrade {
  name: string;
  desc: string;
  apply(p: Player): void;
  available?(p: Player): boolean;
}

export const UPGRADES: Upgrade[] = [
  { name: 'Rapid fire', desc: 'Fire 20% faster', apply: (p) => (p.rate *= 0.8) },
  { name: 'Heavy rounds', desc: '+1 damage per shot', apply: (p) => p.damage++ },
  {
    name: 'Twin shot',
    desc: '+1 projectile',
    apply: (p) => p.multi++,
    available: (p) => p.multi < 5,
  },
  { name: 'Thrusters', desc: 'Move 15% faster', apply: (p) => (p.speed *= 1.15) },
  { name: 'Magnet', desc: 'Pull gems from further away', apply: (p) => (p.magnet += 70) },
  {
    name: 'Piercing',
    desc: 'Shots pass through +1 enemy',
    apply: (p) => p.pierce++,
    available: (p) => p.pierce < 4,
  },
  {
    name: 'Repair',
    desc: 'Restore 40 HP',
    apply: (p) => (p.hp = Math.min(p.max, p.hp + 40)),
  },
];

/** Returns `count` distinct upgrades the player can still take (Fisher-Yates shuffle). */
export function pickUpgrades(p: Player, rng: () => number = Math.random, count = 3): Upgrade[] {
  const pool = UPGRADES.filter((u) => !u.available || u.available(p));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}
