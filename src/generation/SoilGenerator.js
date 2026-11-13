import { TerrainType } from "../world/Terrain.js";

/**
 * Computes soil fertility, soil moisture, and vegetation density.
 * Uses terrain type, rainfall, temperature, and river proximity.
 */
export class SoilGenerator {
  constructor(world) {
    this.world = world;
  }

  generate() {
    const world = this.world;
    const { size, tileCount, terrain, elevation, temperature, rainfall,
            isLake, isRiver } = world;

    const soilFertility = new Float32Array(tileCount);
    const soilMoisture  = new Float32Array(tileCount);
    const vegetation    = new Float32Array(tileCount);

    const distToRiver = this._computeRiverDistance();

    for (let i = 0; i < tileCount; i++) {
      const elev = elevation[i];
      const temp = temperature[i];
      const rain = rainfall[i];

      if (elev < 0.46 || isLake[i]) {
        soilFertility[i] = 0;
        soilMoisture[i]  = 1;
        vegetation[i]    = 0;
        continue;
      }

      const terr = terrain[i];

      // --- Fertility ---
      let fert = this._baseFertility(terr);
      if (isRiver[i]) fert += 0.3;
      else if (distToRiver[i] < 8) fert += 0.2 * (1 - distToRiver[i] / 8);
      fert += rain * 0.15;
      if (elev > 0.75) fert *= 0.3;
      else if (elev > 0.65) fert *= 0.6;
      if (temp < 0.2) fert *= 0.5;
      soilFertility[i] = fert < 0 ? 0 : fert > 1 ? 1 : fert;

      // --- Soil moisture ---
      let sm = rain * 0.6 + world.humidity[i] * 0.3;
      if (isRiver[i]) sm = Math.max(sm, 0.9);
      if (distToRiver[i] < 5) sm = Math.max(sm, 0.7 - distToRiver[i] * 0.08);
      if (temp > 0.7) sm *= 0.7;
      soilMoisture[i] = sm < 0 ? 0 : sm > 1 ? 1 : sm;

      // --- Vegetation ---
      let veg = this._baseVegetation(terr);
      veg *= 0.5 + rain * 0.5;
      veg *= 0.7 + soilMoisture[i] * 0.3;
      if (temp < 0.15) veg *= 0.2;
      vegetation[i] = veg < 0 ? 0 : veg > 1 ? 1 : veg;
    }

    world.soilFertility = soilFertility;
    world.soilMoisture  = soilMoisture;
    world.vegetation    = vegetation;
  }

  _baseFertility(terr) {
    switch (terr) {
      case TerrainType.WETLAND:       return 0.85;
      case TerrainType.FOREST:        return 0.7;
      case TerrainType.JUNGLE:        return 0.55; // nutrients mostly in biomass
      case TerrainType.BOREAL_FOREST: return 0.4;
      case TerrainType.GRASSLAND:     return 0.75;
      case TerrainType.PLAINS:        return 0.6;
      case TerrainType.SAVANNA:       return 0.5;
      case TerrainType.BEACH:         return 0.25;
      case TerrainType.HILLS:         return 0.4;
      case TerrainType.DESERT:        return 0.1;
      case TerrainType.TUNDRA:        return 0.15;
      case TerrainType.SNOW:          return 0.05;
      case TerrainType.MOUNTAIN:      return 0.1;
      case TerrainType.SNOW_MOUNTAIN: return 0.0;
      default:                        return 0.3;
    }
  }

  _baseVegetation(terr) {
    switch (terr) {
      case TerrainType.JUNGLE:        return 1.0;
      case TerrainType.FOREST:        return 0.9;
      case TerrainType.BOREAL_FOREST: return 0.75;
      case TerrainType.WETLAND:       return 0.8;
      case TerrainType.GRASSLAND:     return 0.6;
      case TerrainType.SAVANNA:       return 0.4;
      case TerrainType.PLAINS:        return 0.35;
      case TerrainType.HILLS:         return 0.3;
      case TerrainType.TUNDRA:        return 0.15;
      case TerrainType.DESERT:        return 0.05;
      case TerrainType.BEACH:         return 0.05;
      case TerrainType.SNOW:          return 0.02;
      case TerrainType.MOUNTAIN:      return 0.05;
      case TerrainType.SNOW_MOUNTAIN: return 0.0;
      default:                        return 0.2;
    }
  }

  _computeRiverDistance() {
    const { size, isRiver, isLake, elevation } = this.world;
    const n = size * size;
    const dist = new Float32Array(n).fill(999);
    const queue = new Int32Array(n);
    let head = 0, tail = 0;

    for (let i = 0; i < n; i++) {
      if (isRiver[i] || isLake[i] || elevation[i] < 0.46) {
        dist[i] = 0;
        queue[tail++] = i;
      }
    }

    while (head < tail) {
      const i = queue[head++];
      const x = i % size;
      const y = (i / size) | 0;
      const d = dist[i] + 1;
      if (x > 0)        { const ni = i - 1;    if (dist[ni] > d) { dist[ni] = d; queue[tail++] = ni; } }
      if (x < size - 1) { const ni = i + 1;    if (dist[ni] > d) { dist[ni] = d; queue[tail++] = ni; } }
      if (y > 0)        { const ni = i - size; if (dist[ni] > d) { dist[ni] = d; queue[tail++] = ni; } }
      if (y < size - 1) { const ni = i + size; if (dist[ni] > d) { dist[ni] = d; queue[tail++] = ni; } }
    }

    return dist;
  }
}