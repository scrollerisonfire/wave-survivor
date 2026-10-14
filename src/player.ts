import { HEIGHT, WIDTH } from './config';
import type { Player } from './types';
import { xpNeeded } from './wave';

export function createPlayer(): Player {
  return {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    hp: 100,
    max: 100,
    speed: 220,
    rate: 0.4,
    cooldown: 0,
    damage: 1,
    multi: 1,
    pierce: 0,
    magnet: 70,
    xp: 0,
    level: 1,
    need: xpNeeded(1),
    invuln: 0,
    angle: 0,
  };
}
