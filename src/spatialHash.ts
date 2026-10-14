import { clamp } from './util';

/** Uniform grid for broad-phase collision queries. Cell arrays are reused every frame. */
export class SpatialHash<T extends { x: number; y: number }> {
  readonly cols: number;
  readonly rows: number;
  private cells: T[][];

  constructor(
    width: number,
    height: number,
    private cellSize: number,
  ) {
    this.cols = Math.ceil(width / cellSize) + 1;
    this.rows = Math.ceil(height / cellSize) + 1;
    this.cells = Array.from({ length: this.cols * this.rows }, () => []);
  }

  clear(): void {
    for (const c of this.cells) c.length = 0;
  }

  insert(item: T): void {
    const cx = clamp(Math.floor(item.x / this.cellSize), 0, this.cols - 1);
    const cy = clamp(Math.floor(item.y / this.cellSize), 0, this.rows - 1);
    this.cells[cy * this.cols + cx].push(item);
  }

  /** Fills `out` with items in the 3x3 cells around (x, y) and returns it. */
  nearby(x: number, y: number, out: T[]): T[] {
    out.length = 0;
    const cx = clamp(Math.floor(x / this.cellSize), 0, this.cols - 1);
    const cy = clamp(Math.floor(y / this.cellSize), 0, this.rows - 1);
    for (let yy = Math.max(0, cy - 1); yy <= Math.min(this.rows - 1, cy + 1); yy++) {
      for (let xx = Math.max(0, cx - 1); xx <= Math.min(this.cols - 1, cx + 1); xx++) {
        const cell = this.cells[yy * this.cols + xx];
        for (let i = 0; i < cell.length; i++) out.push(cell[i]);
      }
    }
    return out;
  }
}
