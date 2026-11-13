import { World } from "../world/World.js";
import { RNG } from "../utils/RNG.js";
import { TerrainGenerator } from "./TerrainGenerator.js";
import { ClimateGenerator } from "./ClimateGenerator.js";
import { RiverGenerator } from "./RiverGenerator.js";
import { BiomeGenerator } from "./BiomeGenerator.js";
import { SoilGenerator } from "./SoilGenerator.js";
import { ResourceGenerator } from "../resources/ResourceGenerator.js";

/**
 * Orchestrates a full world generation pass.
 * Deterministic for a given (size, seed) pair.
 */
export class WorldGenerator {
  constructor({ size, seed }) {
    this.size = size;
    this.originalSeed = seed;
    this.rng = RNG.fromSeed(seed);
  }

  generate() {
    const world = new World(this.size, this.originalSeed);

    // 1. Elevation / temperature / moisture
    new TerrainGenerator(world, this.rng.fork()).generate();

    // 2. Climate (rainfall, humidity, zones)
    new ClimateGenerator(world, this.rng.fork()).generate();

    // 3. Rivers & lakes
    new RiverGenerator(world).generate();

    // 4. Biomes (uses rainfall & lake flags)
    new BiomeGenerator(world).generate();

    // 5. Soil & vegetation
    new SoilGenerator(world).generate();

    // 6. Resources (uses everything above)
    new ResourceGenerator(world, this.rng.fork()).generate();

    return world;
  }
}