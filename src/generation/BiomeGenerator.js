import { classifyTerrain } from "../world/Biome.js";

export class BiomeGenerator {
  constructor(world) {
    this.world = world;
  }

  generate() {
    const { tileCount, elevation, temperature, moisture, terrain } = this.world;
    for (let i = 0; i < tileCount; i++) {
      terrain[i] = classifyTerrain(elevation[i], temperature[i], moisture[i]);
    }
  }
}