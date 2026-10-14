import type { Sprite } from 'pixi.js';

/** Object pool: entities are recycled instead of allocated, which avoids GC spikes. */
export class Pool<T extends { sprite: Sprite }> {
  readonly live: T[] = [];
  private free: T[] = [];

  constructor(private create: () => T) {}

  get(): T {
    const item = this.free.pop() ?? this.create();
    item.sprite.visible = true;
    item.sprite.alpha = 1;
    item.sprite.scale.set(1);
    this.live.push(item);
    return item;
  }

  /** Releases live[i] via swap-remove. Iterate backwards when releasing inside a loop. */
  release(i: number): void {
    const item = this.live[i];
    item.sprite.visible = false;
    this.live[i] = this.live[this.live.length - 1];
    this.live.pop();
    this.free.push(item);
  }

  clear(): void {
    while (this.live.length) this.release(this.live.length - 1);
  }
}
