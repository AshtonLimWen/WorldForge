/**
 * Deterministic seeded PRNG (Mulberry32).
 * The same seed always produces the same sequence.
 */
export class RNG {
  constructor(seed) {
    this.seed = (seed >>> 0) || 1;
    this.state = this.seed;
  }

  next() {
    this.state = (this.state + 0x6D2B79F5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  range(min, max) { return min + this.next() * (max - min); }
  int(min, max)   { return Math.floor(this.range(min, max + 1)); }
  pick(arr)       { return arr[Math.floor(this.next() * arr.length)]; }
  chance(p)       { return this.next() < p; }

  /** Returns a new RNG seeded from this one, leaving this RNG advanced. */
  fork() {
    return new RNG(Math.floor(this.next() * 0xFFFFFFFF));
  }

  /**
   * Accept a number (used directly) or a string (hashed).
   * Empty/undefined -> random.
   */
  static fromSeed(input) {
    if (typeof input === "number") return new RNG(input);
    if (input === undefined || input === null || input === "") {
      return new RNG(Math.floor(Math.random() * 0xFFFFFFFF));
    }
    const s = String(input).trim();
    // Pure integer string -> treat as number for user intuition
    if (/^-?\d+$/.test(s)) {
      return new RNG(parseInt(s, 10));
    }
    // FNV-1a hash of arbitrary string
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return new RNG(h >>> 0);
  }
}