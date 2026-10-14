export const clamp = (v: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, v));

export const rnd = (min: number, max: number): number => min + Math.random() * (max - min);
