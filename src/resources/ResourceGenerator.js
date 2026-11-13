import { Noise } from "../utils/Noise.js";
import { TerrainType } from "../world/Terrain.js";
import {
  RESOURCE_ID,
  MAX_RESOURCES_PER_TILE,
  RESOURCES,
} from "./ResourceTypes.js";

/**
 * Deterministic procedural resource placement.
 * Uses forked RNG seeds so world-gen stays reproducible.
 */
export class ResourceGenerator {
  constructor(world, rng) {
    this.world = world;
    this.rng = rng;

    // Independent noise fields for geological clustering
    this.stoneNoise  = new Noise(rng.fork().seed);
    this.coalNoise   = new Noise(rng.fork().seed);
    this.ironNoise   = new Noise(rng.fork().seed);
    this.copperNoise = new Noise(rng.fork().seed);
    this.goldNoise   = new Noise(rng.fork().seed);
    this.silverNoise = new Noise(rng.fork().seed);
    this.tinNoise    = new Noise(rng.fork().seed);
    this.oilNoise    = new Noise(rng.fork().seed);
    this.gasNoise    = new Noise(rng.fork().seed);
  }

  generate() {
    this._placeBiomeResources();
    this._placeAquaticResources();
    this._placeAgriculturalResources();
    this._placeGeologicalResources();
  }

  // ---------- helpers ----------

  _addResource(tileIndex, resourceId, quantity) {
    if (quantity <= 0) return false;
    const { resourceType, resourceQty, resourceMaxQty } = this.world;
    const base = tileIndex * MAX_RESOURCES_PER_TILE;

    // Reject duplicate of same resource on this tile
    for (let s = 0; s < MAX_RESOURCES_PER_TILE; s++) {
      if (resourceType[base + s] === resourceId + 1) return false;
    }
    // Find empty slot
    for (let s = 0; s < MAX_RESOURCES_PER_TILE; s++) {
      if (resourceType[base + s] === 0) {
        resourceType[base + s]    = resourceId + 1;
        resourceQty[base + s]     = quantity;
        resourceMaxQty[base + s]  = quantity;
        return true;
      }
    }
    return false; // no slot available
  }

  // ---------- biome-based (deterministic by terrain) ----------

  _placeBiomeResources() {
    const { size, tileCount, terrain, vegetation, soilFertility,
            rainfall, distanceToOcean } = this.world;

    for (let i = 0; i < tileCount; i++) {
      const terr = terrain[i];
      const veg = vegetation[i];

      // Wood — forest, jungle, boreal
      if (terr === TerrainType.FOREST ||
          terr === TerrainType.JUNGLE ||
          terr === TerrainType.BOREAL_FOREST) {
        const qty = 100 + veg * 400;
        this._addResource(i, RESOURCE_ID.WOOD, qty);
      }

      // Sand — beaches and deserts
      if (terr === TerrainType.BEACH || terr === TerrainType.DESERT) {
        const qty = 300 + this.rng.next() * 800;
        this._addResource(i, RESOURCE_ID.SAND, qty);
      }

      // Clay — wetlands and near rivers
      if (terr === TerrainType.WETLAND) {
        const qty = 300 + soilFertility[i] * 400;
        this._addResource(i, RESOURCE_ID.CLAY, qty);
      } else if (terr !== TerrainType.BEACH &&
                 terr !== TerrainType.DESERT &&
                 distanceToOcean[i] < 6 &&
                 rainfall[i] > 0.5 &&
                 this.rng.chance(0.15)) {
        const qty = 120 + this.rng.next() * 300;
        this._addResource(i, RESOURCE_ID.CLAY, qty);
      }
    }

    // (void unused-variable lint noise)
    void size;
  }

  // ---------- aquatic ----------

  _placeAquaticResources() {
    const { tileCount, elevation, isLake, isRiver, terrain, size } = this.world;

    for (let i = 0; i < tileCount; i++) {
      const elev = elevation[i];
      const terr = terrain[i];

      // Freshwater — rivers and lakes
      if (isRiver[i] || isLake[i]) {
        const qty = 500 + this.rng.next() * 1500;
        this._addResource(i, RESOURCE_ID.FRESHWATER, qty);
      }

      // Fish — coastal ocean, ocean, lakes, but not deep ocean
      const isCoastalWater = (terr === TerrainType.COAST) ||
                             (terr === TerrainType.OCEAN && elev >= 0.36);
      if (isCoastalWater || isLake[i]) {
        // Slightly noisy fish density
        const x = i % size;
        const y = (i / size) | 0;
        const n = this.gasNoise.noise2D(x * 0.15, y * 0.15);
        if (n > 0.25) {
          const qty = 150 + n * 500;
          this._addResource(i, RESOURCE_ID.FISH, qty);
        }
      }
    }
  }

  // ---------- agricultural ----------

  _placeAgriculturalResources() {
    const { tileCount, terrain, soilFertility, soilMoisture, temperature } = this.world;

    for (let i = 0; i < tileCount; i++) {
      const terr = terrain[i];
      const fert = soilFertility[i];
      const moist = soilMoisture[i];
      const temp = temperature[i];

      if (fert < 0.25) continue;

      // Grain — plains, grasslands
      if ((terr === TerrainType.PLAINS || terr === TerrainType.GRASSLAND) && fert > 0.45) {
        const qty = 80 + fert * 350;
        this._addResource(i, RESOURCE_ID.GRAIN, qty);
      }

      // Fruits — forests with decent fertility
      if ((terr === TerrainType.FOREST || terr === TerrainType.JUNGLE) && fert > 0.4) {
        const qty = 60 + fert * 200;
        this._addResource(i, RESOURCE_ID.FRUIT, qty);
      }

      // Vegetables — grasslands and wetlands
      if ((terr === TerrainType.GRASSLAND || terr === TerrainType.WETLAND) && fert > 0.55) {
        const qty = 80 + fert * 220;
        this._addResource(i, RESOURCE_ID.VEGETABLE, qty);
      }

      // Livestock — grasslands, savanna, plains
      if ((terr === TerrainType.GRASSLAND ||
           terr === TerrainType.SAVANNA ||
           terr === TerrainType.PLAINS) && fert > 0.4 && temp > 0.25) {
        const qty = 60 + fert * 200 * (0.5 + moist);
        this._addResource(i, RESOURCE_ID.LIVESTOCK, qty);
      }
    }
  }

  // ---------- geological ----------

  _placeGeologicalResources() {
    const { size, tileCount, terrain, elevation } = this.world;
    const f = 0.12; // base frequency for clustering

    for (let i = 0; i < tileCount; i++) {
      const elev = elevation[i];
      const terr = terrain[i];

      const isHillOrMountain =
        terr === TerrainType.HILLS ||
        terr === TerrainType.MOUNTAIN ||
        terr === TerrainType.SNOW_MOUNTAIN;

      const x = i % size;
      const y = (i / size) | 0;

      // ---- Stone — hills and mountains, common ----
      if (isHillOrMountain) {
        if (this.stoneNoise.fbm(x * f, y * f, { octaves: 3 }) > 0.35) {
          const qty = 800 + this.rng.next() * 1400;
          this._addResource(i, RESOURCE_ID.STONE, qty);
        }
      }

      // ---- Coal — hills and mountains, moderate ----
      if (isHillOrMountain && elev > 0.7) {
        const n = this.coalNoise.fbm(x * f * 1.3 + 400, y * f * 1.3, { octaves: 4 });
        if (n > 0.62) {
          const qty = 800 + (n - 0.62) * 6000;
          this._addResource(i, RESOURCE_ID.COAL, qty);
        }
      }

      // ---- Iron — hills and mountains, moderate ----
      if (isHillOrMountain) {
        const n = this.ironNoise.fbm(x * f * 1.1 + 800, y * f * 1.1, { octaves: 4 });
        if (n > 0.68) {
          const qty = 300 + (n - 0.68) * 3000;
          this._addResource(i, RESOURCE_ID.IRON, qty);
        }
      }

      // ---- Copper — hills, moderate ----
      if (isHillOrMountain) {
        const n = this.copperNoise.fbm(x * f * 1.2 + 1200, y * f * 1.2, { octaves: 4 });
        if (n > 0.71) {
          const qty = 200 + (n - 0.71) * 2000;
          this._addResource(i, RESOURCE_ID.COPPER, qty);
        }
      }

      // ---- Tin — hills only, rare ----
      if (terr === TerrainType.HILLS) {
        const n = this.tinNoise.fbm(x * f * 1.4 + 1600, y * f * 1.4, { octaves: 4 });
        if (n > 0.76) {
          const qty = 150 + (n - 0.76) * 2000;
          this._addResource(i, RESOURCE_ID.TIN, qty);
        }
      }

      // ---- Silver — mountains only, rare ----
      if (terr === TerrainType.MOUNTAIN || terr === TerrainType.SNOW_MOUNTAIN) {
        const n = this.silverNoise.fbm(x * f * 1.5 + 2000, y * f * 1.5, { octaves: 4 });
        if (n > 0.79) {
          const qty = 80 + (n - 0.79) * 1500;
          this._addResource(i, RESOURCE_ID.SILVER, qty);
        }
      }

      // ---- Gold — mountains only, very rare ----
      if (terr === TerrainType.MOUNTAIN || terr === TerrainType.SNOW_MOUNTAIN) {
        const n = this.goldNoise.fbm(x * f * 1.7 + 2400, y * f * 1.7, { octaves: 4 });
        if (n > 0.82) {
          const qty = 40 + (n - 0.82) * 1200;
          this._addResource(i, RESOURCE_ID.GOLD, qty);
        }
      }

      // ---- Oil — plains / hills / shallow sea ----
      const oilCandidate =
        (terr === TerrainType.PLAINS || terr === TerrainType.GRASSLAND ||
         terr === TerrainType.DESERT ||
         terr === TerrainType.SAVANNA ||
         (terr === TerrainType.OCEAN && elev >= 0.36));
      if (oilCandidate) {
        const n = this.oilNoise.fbm(x * f * 0.9 + 2800, y * f * 0.9, { octaves: 5 });
        if (n > 0.74) {
          const qty = 1000 + (n - 0.74) * 8000;
          this._addResource(i, RESOURCE_ID.OIL, qty);
        }
      }

      // ---- Natural gas — often co-located with oil fields ----
      if (oilCandidate) {
        const n = this.gasNoise.fbm(x * f * 0.9 + 3200, y * f * 0.9, { octaves: 5 });
        if (n > 0.78) {
          const qty = 800 + (n - 0.78) * 6000;
          this._addResource(i, RESOURCE_ID.GAS, qty);
        }
      }
    }
  }
}

void RESOURCES; // referenced in future chunks