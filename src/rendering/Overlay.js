import { packColorRGB, TerrainColorPacked } from "../world/Terrain.js";
import {
  RESOURCES,
  RESOURCES_BY_KEY,
  MAX_RESOURCES_PER_TILE,
} from "../resources/ResourceTypes.js";

export const OverlayMode = Object.freeze({
  TERRAIN:     "terrain",
  ELEVATION:   "elevation",
  TEMPERATURE: "temperature",
  RAINFALL:    "rainfall",
  HUMIDITY:    "humidity",
  SOIL:        "soil",
  VEGETATION:  "vegetation",
  BIOME:       "biome",
  WATER:       "water",
  RESOURCES:   "resources", // combined
});

export const OVERLAY_LABELS = {
  terrain:     "Terrain",
  elevation:   "Elevation",
  temperature: "Temperature",
  rainfall:    "Rainfall",
  humidity:    "Humidity",
  soil:        "Soil Fertility",
  vegetation:  "Vegetation",
  biome:       "Biome",
  water:       "Water",
  resources:   "Resources (All)",
};

// ---- Gradient LUTs ----

function buildLUT(stops) {
  const lut = new Uint32Array(256);
  for (let i = 0; i < 256; i++) lut[i] = packColorRGB(sampleGradient(stops, i / 255));
  return lut;
}

function sampleGradient(stops, t) {
  if (t <= stops[0][0]) return stops[0][1];
  const last = stops[stops.length - 1];
  if (t >= last[0]) return last[1];
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, c0] = stops[i];
    const [t1, c1] = stops[i + 1];
    if (t >= t0 && t <= t1) {
      const f = (t - t0) / (t1 - t0);
      return [
        c0[0] + (c1[0] - c0[0]) * f,
        c0[1] + (c1[1] - c0[1]) * f,
        c0[2] + (c1[2] - c0[2]) * f,
      ];
    }
  }
  return stops[0][1];
}

export const LUT_ELEVATION = buildLUT([
  [0.00, [ 12,  35,  70]],
  [0.35, [ 24,  65, 120]],
  [0.46, [ 70, 150, 200]],
  [0.49, [232, 216, 160]],
  [0.55, [120, 165,  90]],
  [0.70, [140, 120,  80]],
  [0.82, [120, 120, 120]],
  [0.92, [200, 200, 200]],
  [1.00, [255, 255, 255]],
]);

export const LUT_TEMPERATURE = buildLUT([
  [0.0, [ 40,  70, 180]],
  [0.25,[ 80, 150, 220]],
  [0.5, [200, 220, 120]],
  [0.7, [235, 170,  80]],
  [1.0, [210,  60,  40]],
]);

export const LUT_RAINFALL = buildLUT([
  [0.0, [170, 120,  60]],
  [0.3, [220, 200, 120]],
  [0.55,[ 90, 180, 200]],
  [0.8, [ 40, 110, 190]],
  [1.0, [ 20,  60, 150]],
]);

export const LUT_HUMIDITY = LUT_RAINFALL;

export const LUT_SOIL = buildLUT([
  [0.0, [120,  90,  70]],
  [0.35,[160, 130,  90]],
  [0.65,[120, 160,  90]],
  [1.0, [ 40, 110,  40]],
]);

export const LUT_VEGETATION = buildLUT([
  [0.0, [200, 200, 200]],
  [0.3, [180, 200, 150]],
  [0.6, [ 90, 170,  80]],
  [1.0, [ 20, 100,  30]],
]);

// ---- Special colours ----

const RIVER_COLORS = [
  packColorRGB([ 90, 150, 205]),
  packColorRGB([ 60, 120, 185]),
  packColorRGB([ 40, 100, 170]),
];

const LAKE_COLOR   = packColorRGB([ 55, 105, 165]);
const OCEAN_COLOR  = packColorRGB([ 44,  82, 130]);
const DEEP_COLOR   = packColorRGB([ 24,  52,  88]);
const COAST_COLOR  = packColorRGB([ 66, 153, 200]);
const BEACH_COLOR  = packColorRGB([232, 216, 160]);
const LAND_GRAY    = packColorRGB([120, 120, 120]);
const EMPTY_RES_BG = packColorRGB([ 42,  46,  52]);

// Pre-computed packed resource colors
const RESOURCE_COLORS = RESOURCES.map((r) => r.color);
const RESOURCE_COLORS_PACKED = RESOURCES.map((r) => packColorRGB(r.color));

function riverColor(strength) {
  if (strength >= 220) return RIVER_COLORS[2];
  if (strength >= 160) return RIVER_COLORS[1];
  return RIVER_COLORS[0];
}

/**
 * Fill `out` (size = world.tileCount) with packed 32-bit colours for
 * the requested overlay mode.
 *
 * Modes supported:
 *  - All OverlayMode.* values
 *  - "resource:<key>" for any resource key (see Resources)
 */
export function buildTileColors(world, mode, out) {
  const n = world.tileCount;

  // ---- Single-resource mode ----
  if (mode.startsWith("resource:")) {
    const key = mode.slice(9);
    const def = RESOURCES_BY_KEY[key];
    if (!def) {
      for (let i = 0; i < n; i++) out[i] = EMPTY_RES_BG;
      return;
    }
    const id = def.id;
    const [cr, cg, cb] = RESOURCE_COLORS[id];
    const type = world.resourceType;
    const qty = world.resourceQty;
    for (let i = 0; i < n; i++) {
      const base = i * MAX_RESOURCES_PER_TILE;
      let found = 0;
      for (let s = 0; s < MAX_RESOURCES_PER_TILE; s++) {
        if (type[base + s] === id + 1) { found = qty[base + s]; break; }
      }
      if (found > 0) {
        const intensity = Math.min(1, found / 800);
        const r = Math.round(30 + cr * intensity);
        const g = Math.round(30 + cg * intensity);
        const b = Math.round(30 + cb * intensity);
        out[i] = packColorRGB([r, g, b]);
      } else {
        out[i] = EMPTY_RES_BG;
      }
    }
    return;
  }

  switch (mode) {
    case OverlayMode.TERRAIN: {
      const { terrain, isRiver, riverStrength } = world;
      for (let i = 0; i < n; i++) {
        out[i] = isRiver[i]
          ? riverColor(riverStrength[i])
          : TerrainColorPacked[terrain[i]];
      }
      break;
    }

    case OverlayMode.BIOME: {
      const { terrain } = world;
      for (let i = 0; i < n; i++) out[i] = TerrainColorPacked[terrain[i]];
      break;
    }

    case OverlayMode.ELEVATION: {
      const { elevation } = world;
      for (let i = 0; i < n; i++) out[i] = LUT_ELEVATION[(elevation[i] * 255) | 0];
      break;
    }

    case OverlayMode.TEMPERATURE: {
      const { temperature } = world;
      for (let i = 0; i < n; i++) out[i] = LUT_TEMPERATURE[(temperature[i] * 255) | 0];
      break;
    }

    case OverlayMode.RAINFALL: {
      const { rainfall } = world;
      for (let i = 0; i < n; i++) out[i] = LUT_RAINFALL[(rainfall[i] * 255) | 0];
      break;
    }

    case OverlayMode.HUMIDITY: {
      const { humidity } = world;
      for (let i = 0; i < n; i++) out[i] = LUT_HUMIDITY[(humidity[i] * 255) | 0];
      break;
    }

    case OverlayMode.SOIL: {
      const { soilFertility } = world;
      for (let i = 0; i < n; i++) out[i] = LUT_SOIL[(soilFertility[i] * 255) | 0];
      break;
    }

    case OverlayMode.VEGETATION: {
      const { vegetation } = world;
      for (let i = 0; i < n; i++) out[i] = LUT_VEGETATION[(vegetation[i] * 255) | 0];
      break;
    }

    case OverlayMode.WATER: {
      const { elevation, isLake, isRiver, riverStrength } = world;
      for (let i = 0; i < n; i++) {
        const e = elevation[i];
        if (e < 0.32)        out[i] = DEEP_COLOR;
        else if (e < 0.42)   out[i] = OCEAN_COLOR;
        else if (e < 0.46)   out[i] = COAST_COLOR;
        else if (e < 0.48)   out[i] = BEACH_COLOR;
        else if (isLake[i])  out[i] = LAKE_COLOR;
        else if (isRiver[i]) out[i] = riverColor(riverStrength[i]);
        else                 out[i] = LAND_GRAY;
      }
      break;
    }

    case OverlayMode.RESOURCES: {
      // Blend all resources present on a tile weighted by quantity.
      // Empty tiles fall back to a very dark variant of the terrain colour.
      const { terrain, resourceType, resourceQty } = world;
      const baseTerrain = TerrainColorPacked;
      for (let i = 0; i < n; i++) {
        const base = i * MAX_RESOURCES_PER_TILE;
        let totalQty = 0, r = 0, g = 0, b = 0;
        for (let s = 0; s < MAX_RESOURCES_PER_TILE; s++) {
          const t = resourceType[base + s];
          if (t === 0) continue;
          const q = resourceQty[base + s];
          if (q <= 0) continue;
          const c = RESOURCE_COLORS[t - 1];
          totalQty += q;
          r += c[0] * q;
          g += c[1] * q;
          b += c[2] * q;
        }
        if (totalQty === 0) {
          // Darken terrain colour for "no resources" tiles
          const packed = baseTerrain[terrain[i]];
          const r0 = (packed & 0xFF) * 0.35;
          const g0 = ((packed >> 8) & 0xFF) * 0.35;
          const b0 = ((packed >> 16) & 0xFF) * 0.35;
          out[i] = packColorRGB([r0 | 0, g0 | 0, b0 | 0]);
        } else {
          out[i] = packColorRGB([
            Math.round(r / totalQty),
            Math.round(g / totalQty),
            Math.round(b / totalQty),
          ]);
        }
      }
      break;
    }

    default: {
      const { terrain } = world;
      for (let i = 0; i < n; i++) out[i] = TerrainColorPacked[terrain[i]];
    }
  }
}

void RESOURCE_COLORS_PACKED; // reserved for future per-resource styling