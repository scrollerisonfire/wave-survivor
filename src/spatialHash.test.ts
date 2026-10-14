import { describe, expect, it } from 'vitest';
import { SpatialHash } from './spatialHash';

describe('SpatialHash', () => {
  it('returns items from neighbouring cells only', () => {
    const hash = new SpatialHash<{ x: number; y: number }>(960, 600, 48);
    const close = { x: 100, y: 100 };
    const far = { x: 800, y: 500 };
    hash.insert(close);
    hash.insert(far);
    const found = hash.nearby(110, 110, []);
    expect(found).toContain(close);
    expect(found).not.toContain(far);
  });

  it('clears all cells and tolerates out-of-bounds items', () => {
    const hash = new SpatialHash<{ x: number; y: number }>(960, 600, 48);
    hash.insert({ x: -50, y: -50 });
    expect(hash.nearby(0, 0, [])).toHaveLength(1);
    hash.clear();
    expect(hash.nearby(0, 0, [])).toHaveLength(0);
  });
});
