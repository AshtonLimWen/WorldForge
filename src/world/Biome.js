import { TerrainType } from "./Terrain.js";

/**
 * Classify a tile into a terrain type.
 *
 * @param elevation  [0,1]
 * @param temperature[0,1]
 * @param rainfall   [0,1]
 * @param isLake     0/1
 */
export function classifyTerrain(elevation, temperature, rainfall, isLake) {
  // Water
  if (isLake) return TerrainType.LAKE;
  if (elevation < 0.32) return TerrainType.DEEP_OCEAN;
  if (elevation < 0.42) return TerrainType.OCEAN;
  if (elevation < 0.46) return TerrainType.COAST;
  if (elevation < 0.48) return TerrainType.BEACH;

  // Mountains and hills
  if (elevation > 0.88) return TerrainType.SNOW_MOUNTAIN;
  if (elevation > 0.78) return TerrainType.MOUNTAIN;
  if (elevation > 0.68) return TerrainType.HILLS;

  // Wetlands: very wet, low elevation, not frozen
  if (rainfall > 0.72 && temperature > 0.28 && elevation < 0.55) return TerrainType.WETLAND;

  // Cold regions
  if (temperature < 0.10) return TerrainType.SNOW;
  if (temperature < 0.22) {
    if (rainfall > 0.35) return TerrainType.BOREAL_FOREST;
    return TerrainType.TUNDRA;
  }
  if (temperature < 0.35 && rainfall > 0.45) return TerrainType.BOREAL_FOREST;

  // Hot, dry regions
  if (rainfall < 0.20) return TerrainType.DESERT;
  if (rainfall < 0.32 && temperature > 0.55) return TerrainType.DESERT;

  // Tropical rainforest
  if (temperature > 0.72 && rainfall > 0.65) return TerrainType.JUNGLE;

  // Savanna (hot with medium moisture)
  if (temperature > 0.65 && rainfall < 0.55) return TerrainType.SAVANNA;

  // Temperate forests
  if (rainfall > 0.60) return TerrainType.FOREST;

  // Grass / plains
  if (rainfall > 0.40) return TerrainType.GRASSLAND;
  if (rainfall > 0.28) return TerrainType.PLAINS;

  return TerrainType.SAVANNA;
}