/**
 * Terrain types and their rendering / gameplay properties.
 */
export const TerrainType = {
  DEEP_OCEAN:    0,
  OCEAN:         1,
  COAST:         2,
  BEACH:         3,
  PLAINS:        4,
  GRASSLAND:     5,
  FOREST:        6,
  JUNGLE:        7,
  DESERT:        8,
  SAVANNA:       9,
  TUNDRA:       10,
  SNOW:         11,
  HILLS:        12,
  MOUNTAIN:     13,
  SNOW_MOUNTAIN:14,
};

export const TerrainInfo = {
  [TerrainType.DEEP_OCEAN]:    { name: "Deep Ocean",    color: [ 24,  52,  88], water: true,  walkable: false },
  [TerrainType.OCEAN]:         { name: "Ocean",         color: [ 44,  82, 130], water: true,  walkable: false },
  [TerrainType.COAST]:         { name: "Coast",         color: [ 66, 153, 200], water: true,  walkable: false },
  [TerrainType.BEACH]:         { name: "Beach",         color: [232, 216, 160], water: false, walkable: true  },
  [TerrainType.PLAINS]:        { name: "Plains",        color: [168, 201, 122], water: false, walkable: true  },
  [TerrainType.GRASSLAND]:     { name: "Grassland",     color: [143, 187,  90], water: false, walkable: true  },
  [TerrainType.FOREST]:        { name: "Forest",        color: [ 74, 124,  58], water: false, walkable: true  },
  [TerrainType.JUNGLE]:        { name: "Jungle",        color: [ 45,  90,  43], water: false, walkable: true  },
  [TerrainType.DESERT]:        { name: "Desert",        color: [224, 200, 138], water: false, walkable: true  },
  [TerrainType.SAVANNA]:       { name: "Savanna",       color: [200, 184, 120], water: false, walkable: true  },
  [TerrainType.TUNDRA]:        { name: "Tundra",        color: [168, 184, 160], water: false, walkable: true  },
  [TerrainType.SNOW]:          { name: "Snow",          color: [240, 245, 248], water: false, walkable: true  },
  [TerrainType.HILLS]:         { name: "Hills",         color: [138, 154,  90], water: false, walkable: true  },
  [TerrainType.MOUNTAIN]:      { name: "Mountain",      color: [106, 106, 106], water: false, walkable: false },
  [TerrainType.SNOW_MOUNTAIN]: { name: "Snow Mountain", color: [216, 221, 224], water: false, walkable: false },
};

/** Pack [r, g, b] into a 32-bit value suitable for ImageData (little-endian RGBA). */
export function packColorRGB(rgb, alpha = 255) {
  return ((alpha & 255) << 24) | ((rgb[2] & 255) << 16) | ((rgb[1] & 255) << 8) | (rgb[0] & 255);
}

/** Pre-computed packed color per terrain ID. */
export const TerrainColorPacked = (() => {
  const out = new Uint32Array(Object.keys(TerrainInfo).length);
  for (const [id, info] of Object.entries(TerrainInfo)) {
    out[Number(id)] = packColorRGB(info.color);
  }
  return out;
})();