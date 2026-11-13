import { World } from "../world/World.js";
import { RNG } from "../utils/RNG.js";
import { TerrainGenerator } from "./TerrainGenerator.js";
import { ClimateGenerator } from "./ClimateGenerator.js";
import { RiverGenerator } from "./RiverGenerator.js";
import { BiomeGenerator } from "./BiomeGenerator.js";
import { SoilGenerator } from "./SoilGenerator.js";

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

    // 1. Terrain elevation / temperature / moisture
    new TerrainGenerator(world, this.rng.fork()).generate();

    // 2. Climate (rainfall, humidity, zone) — needs elevation
    new ClimateGenerator(world, this.rng.fork()).generate();

    // 3. Rivers & lakes — needs elevation only
    new RiverGenerator(world).generate();

    // 4. Biomes — needs elevation, temperature, rainfall, lake flags
    new BiomeGenerator(world).generate();

    // 5. Soil & vegetation — needs everything above
    new SoilGenerator(world).generate();

    return world;
  }
}