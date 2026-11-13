import { classifyTerrain } from "../world/Biome.js";

export class BiomeGenerator {
  constructor(world) {
    this.world = world;
  }

  generate() {
    const { tileCount, elevation, temperature, rainfall, isLake, terrain } = this.world;
    for (let i = 0; i < tileCount; i++) {
      terrain[i] = classifyTerrain(
        elevation[i],
        temperature[i],
        rainfall[i],
        isLake[i]
      );
    }
  }
}