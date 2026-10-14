const KEY = 'wave-survivor-best';

export function loadBest(): number {
  try {
    return Number(localStorage.getItem(KEY)) || 0;
  } catch {
    return 0;
  }
}

export function saveBest(value: number): void {
  try {
    localStorage.setItem(KEY, String(value));
  } catch {
    /* storage can be unavailable (private mode); the score is just not saved */
  }
}
