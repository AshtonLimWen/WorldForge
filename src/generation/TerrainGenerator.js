import { Noise } from "../utils/Noise.js";

/**
 * Generates elevation, temperature and moisture for every tile.
 * Deterministic given the parent RNG.
 */
export class TerrainGenerator {
  constructor(world, rng) {
    this.world = world;
    this.rng = rng;

    this.elevNoise   = new Noise(rng.fork().seed);
    this.moistNoise  = new Noise(rng.fork().seed);
    this.warpNoise   = new Noise(rng.fork().seed);
    this.detailNoise = new Noise(rng.fork().seed);
  }

  generate() {
    const { size, elevation, temperature, moisture } = this.world;
    const baseFreq = 3.0 / size;       // ~3 continent-scale features across the world
    const warpStrength = size * 0.015; // domain-warp offset in tiles

    for (let y = 0; y < size; y++) {
      const ny = y / size;
      const dy = 2 * ny - 1;

      for (let x = 0; x < size; x++) {
        const i = y * size + x;
        const nx = x / size;
        const dx = 2 * nx - 1;

        // ---- Domain warp for organic continent shapes ----
        const wx = (this.warpNoise.fbm(x * baseFreq * 2, y * baseFreq * 2, { octaves: 3 }) - 0.5) * warpStrength;
        const wy = (this.warpNoise.fbm(x * baseFreq * 2 + 100, y * baseFreq * 2 + 100, { octaves: 3 }) - 0.5) * warpStrength;

        // ---- Elevation ----
        let e = this.elevNoise.fbm(
          (x + wx) * baseFreq,
          (y + wy) * baseFreq,
          { octaves: 6 }
        );
        // Increase contrast and bias slightly toward land
        e = (e - 0.5) * 1.7 + 0.5 + 0.05;

        // Radial falloff pushes coastlines inward
        const d = Math.sqrt(dx * dx + dy * dy);
        const falloff = Math.max(0, 1 - Math.pow(d * 0.85, 2.5));
        e *= falloff;

        // Small-scale detail
        e += (this.detailNoise.fbm(x * baseFreq * 4, y * baseFreq * 4, { octaves: 3 }) - 0.5) * 0.08;

        elevation[i] = Math.max(0, Math.min(1, e));

        // ---- Temperature: latitude - elevation ----
        const lat = Math.abs(2 * ny - 1); // 0 at equator, 1 at poles
        let t = 1 - lat * 0.8 - elevation[i] * 0.4;
        temperature[i] = Math.max(0, Math.min(1, t));

        // ---- Moisture: independent noise, mildly contrast-boosted ----
        let m = this.moistNoise.fbm(
          x * baseFreq * 1.5,
          y * baseFreq * 1.5,
          { octaves: 4 }
        );
        m = (m - 0.5) * 1.4 + 0.5;
        moisture[i] = Math.max(0, Math.min(1, m));
      }
    }
  }
}