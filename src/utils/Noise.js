import { RNG } from "./RNG.js";

/**
 * Seeded 2D value noise + fractal Brownian motion.
 * Output of `noise2D` and `fbm` is in [0, 1].
 */
export class Noise {
  constructor(seed) {
    const rng = new RNG(seed);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    // Fisher-Yates shuffle
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1));
      const tmp = p[i];
      p[i] = p[j];
      p[j] = tmp;
    }
    this.perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }

  _fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  _lerp(a, b, t) { return a + t * (b - a); }

  _valueAt(ix, iy) {
    const idx = (this.perm[ix & 255] + (iy & 255)) & 511;
    return this.perm[idx] / 255;
  }

  /** Single octave value noise, [0,1]. */
  noise2D(x, y) {
    const X = Math.floor(x);
    const Y = Math.floor(y);
    const xf = x - X;
    const yf = y - Y;
    const u = this._fade(xf);
    const v = this._fade(yf);

    const v00 = this._valueAt(X,     Y);
    const v10 = this._valueAt(X + 1, Y);
    const v01 = this._valueAt(X,     Y + 1);
    const v11 = this._valueAt(X + 1, Y + 1);

    const top = this._lerp(v00, v10, u);
    const bot = this._lerp(v01, v11, u);
    return this._lerp(top, bot, v);
  }

  /** Fractal Brownian motion (multi-octave), [0,1]. */
  fbm(x, y, { octaves = 4, lacunarity = 2, gain = 0.5 } = {}) {
    let amp = 1, freq = 1, sum = 0, norm = 0;
    for (let o = 0; o < octaves; o++) {
      sum += this.noise2D(x * freq, y * freq) * amp;
      norm += amp;
      amp *= gain;
      freq *= lacunarity;
    }
    return sum / norm;
  }
}