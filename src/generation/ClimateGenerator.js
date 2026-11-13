import { Noise } from "../utils/Noise.js";

export const ClimateZone = Object.freeze({
  POLAR:       0,
  BOREAL:      1,
  TEMPERATE:   2,
  SUBTROPICAL: 3,
  TROPICAL:    4,
  ARID:        5,
});

/**
 * Computes rainfall, humidity, and climate zone.
 * Also computes a cached distance-to-ocean field used internally.
 */
export class ClimateGenerator {
  constructor(world, rng) {
    this.world = world;
    this.rng = rng;
    this.rainNoise = new Noise(rng.fork().seed);
  }

  generate() {
    const world = this.world;
    const { size, tileCount, elevation, temperature, moisture } = world;

    const rainfall    = new Float32Array(tileCount);
    const humidity    = new Float32Array(tileCount);
    const climateZone = new Uint8Array(tileCount);

    const distToOcean = this._computeOceanDistance();
    world.distanceToOcean = distToOcean;

    for (let y = 0; y < size; y++) {
      const lat = 1 - (2 * y) / size;
      const absLat = Math.abs(lat);

      // Latitude bands: wet equator, dry subtropics, wet mid-latitudes
      const equatorialBand = Math.exp(-Math.pow(absLat / 0.15, 2)) * 0.9;
      const midLatBand     = Math.exp(-Math.pow((absLat - 0.55) / 0.20, 2)) * 0.65;
      const latRain = Math.max(equatorialBand, midLatBand) + 0.15;

      for (let x = 0; x < size; x++) {
        const i = y * size + x;
        const elev = elevation[i];
        const temp = temperature[i];
        const moist = moisture[i];
        const dist = distToOcean[i];

        // Coastal proximity (closer = wetter)
        const coastalFactor = Math.max(0.2, 1 - dist / 40);

        // Regional variation
        const noise = this.rainNoise.fbm(x * 0.02, y * 0.02, { octaves: 3 });

        let rain = latRain * coastalFactor * (0.6 + noise * 0.6) * 0.8 + moist * 0.4;

        // Ocean tiles -> saturated
        if (elev < 0.46) rain = 1.0;

        rainfall[i] = rain < 0 ? 0 : rain > 1 ? 1 : rain;

        // Humidity: precipitation + near-water + altitude
        let hum = rainfall[i] * 0.6 + coastalFactor * 0.3 + (1 - elev) * 0.1;
        if (elev < 0.46) hum = 1.0;
        humidity[i] = hum < 0 ? 0 : hum > 1 ? 1 : hum;

        climateZone[i] = this._classifyClimate(temp, rainfall[i]);
      }
    }

    world.rainfall    = rainfall;
    world.humidity    = humidity;
    world.climateZone = climateZone;
  }

  _classifyClimate(temp, rain) {
    if (temp < 0.15) return ClimateZone.POLAR;
    if (temp < 0.30) return ClimateZone.BOREAL;
    if (rain < 0.25) return ClimateZone.ARID;
    if (temp > 0.70) return ClimateZone.TROPICAL;
    if (temp > 0.55) return ClimateZone.SUBTROPICAL;
    return ClimateZone.TEMPERATE;
  }

  _computeOceanDistance() {
    const { size, elevation } = this.world;
    const n = size * size;
    const dist = new Float32Array(n).fill(999);
    const queue = new Int32Array(n);
    let head = 0, tail = 0;

    for (let i = 0; i < n; i++) {
      if (elevation[i] < 0.46) {
        dist[i] = 0;
        queue[tail++] = i;
      }
    }

    while (head < tail) {
      const i = queue[head++];
      const x = i % size;
      const y = (i / size) | 0;
      const d = dist[i] + 1;

      // 4-neighbour BFS (fast, good enough)
      if (x > 0)        { const ni = i - 1;    if (dist[ni] > d) { dist[ni] = d; queue[tail++] = ni; } }
      if (x < size - 1) { const ni = i + 1;    if (dist[ni] > d) { dist[ni] = d; queue[tail++] = ni; } }
      if (y > 0)        { const ni = i - size; if (dist[ni] > d) { dist[ni] = d; queue[tail++] = ni; } }
      if (y < size - 1) { const ni = i + size; if (dist[ni] > d) { dist[ni] = d; queue[tail++] = ni; } }
    }

    return dist;
  }
}