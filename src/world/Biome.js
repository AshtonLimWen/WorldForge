import { TerrainType } from "./Terrain.js";

/**
 * Classify a tile into a terrain type based on its physical properties.
 * All inputs are normalized to [0, 1].
 */
export function classifyTerrain(elevation, temperature, moisture) {
  // ---- Water ----
  if (elevation < 0.32) return TerrainType.DEEP_OCEAN;
  if (elevation < 0.42) return TerrainType.OCEAN;
  if (elevation < 0.46) return TerrainType.COAST;
  if (elevation < 0.48) return TerrainType.BEACH;

  // ---- Mountains & hills ----
  if (elevation > 0.88) return TerrainType.SNOW_MOUNTAIN;
  if (elevation > 0.78) return TerrainType.MOUNTAIN;
  if (elevation > 0.68) return TerrainType.HILLS;

  // ---- Cold ----
  if (temperature < 0.12) return TerrainType.SNOW;
  if (temperature < 0.25) return TerrainType.TUNDRA;

  // ---- Hot & dry ----
  if (temperature > 0.65 && moisture < 0.30) return TerrainType.DESERT;
  if (temperature > 0.70 && moisture < 0.50) return TerrainType.SAVANNA;

  // ---- Moisture dependent ----
  if (moisture > 0.68 && temperature > 0.55) return TerrainType.JUNGLE;
  if (moisture > 0.55) return TerrainType.FOREST;
  if (moisture > 0.35) return TerrainType.GRASSLAND;
  if (moisture > 0.20) return TerrainType.PLAINS;
  return TerrainType.SAVANNA;
}