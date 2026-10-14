export interface Vec {
  x: number;
  y: number;
}

/** Keyboard (WASD / arrows) plus a drag-to-steer touch joystick. */
export class Input {
  private keys = new Set<string>();
  private touch: Vec = { x: 0, y: 0 };
  private pointerId: number | null = null;
  private origin: Vec = { x: 0, y: 0 };

  constructor(target: HTMLElement) {
    addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));

    target.addEventListener('pointerdown', (e) => {
      this.pointerId = e.pointerId;
      this.origin = { x: e.clientX, y: e.clientY };
    });
    target.addEventListener('pointermove', (e) => {
      if (e.pointerId !== this.pointerId) return;
      const dx = e.clientX - this.origin.x;
      const dy = e.clientY - this.origin.y;
      const d = Math.hypot(dx, dy);
      if (d > 8) {
        const k = Math.min(d, 60) / 60;
        this.touch = { x: (dx / d) * k, y: (dy / d) * k };
      } else {
        this.touch = { x: 0, y: 0 };
      }
    });
    const end = (e: PointerEvent) => {
      if (e.pointerId !== this.pointerId) return;
      this.pointerId = null;
      this.touch = { x: 0, y: 0 };
    };
    target.addEventListener('pointerup', end);
    target.addEventListener('pointercancel', end);
  }

  /** Movement vector, length <= 1. */
  vector(): Vec {
    const k = this.keys;
    let x =
      (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) -
      (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
    let y =
      (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0) - (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0);
    x += this.touch.x;
    y += this.touch.y;
    const m = Math.hypot(x, y);
    if (m > 1) {
      x /= m;
      y /= m;
    }
    return { x, y };
  }
}
