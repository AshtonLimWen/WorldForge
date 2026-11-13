import { World } from "../world/World.js";
import { RNG } from "../utils/RNG.js";
import { TerrainGenerator } from "./TerrainGenerator.js";
import { BiomeGenerator } from "./BiomeGenerator.js";

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

    // Terrain (elevation/temperature/moisture) shares a child RNG.
    new TerrainGenerator(world, this.rng.fork()).generate();

    // Biomes are derived from terrain properties.
    new BiomeGenerator(world).generate();

    return world;
  }
}