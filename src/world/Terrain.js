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
  FOREST:        6, // Temperate forest
  JUNGLE:        7, // Tropical rainforest
  BOREAL_FOREST: 8, // Taiga
  DESERT:        9,
  SAVANNA:      10,
  TUNDRA:       11,
  SNOW:         12,
  HILLS:        13,
  MOUNTAIN:     14,
  SNOW_MOUNTAIN:15,
  WETLAND:      16,
  LAKE:         17,
};

export const TerrainInfo = {
  [TerrainType.DEEP_OCEAN]:    { name: "Deep Ocean",         color: [ 24,  52,  88], water: true,  walkable: false },
  [TerrainType.OCEAN]:         { name: "Ocean",              color: [ 44,  82, 130], water: true,  walkable: false },
  [TerrainType.COAST]:         { name: "Coast",              color: [ 66, 153, 200], water: true,  walkable: false },
  [TerrainType.BEACH]:         { name: "Beach",              color: [232, 216, 160], water: false, walkable: true  },
  [TerrainType.PLAINS]:        { name: "Plains",             color: [168, 201, 122], water: false, walkable: true  },
  [TerrainType.GRASSLAND]:     { name: "Grassland",          color: [143, 187,  90], water: false, walkable: true  },
  [TerrainType.FOREST]:        { name: "Temperate Forest",   color: [ 74, 124,  58], water: false, walkable: true  },
  [TerrainType.JUNGLE]:        { name: "Tropical Rainforest",color: [ 45,  90,  43], water: false, walkable: true  },
  [TerrainType.BOREAL_FOREST]: { name: "Boreal Forest",      color: [ 56,  92,  70], water: false, walkable: true  },
  [TerrainType.DESERT]:        { name: "Desert",             color: [224, 200, 138], water: false, walkable: true  },
  [TerrainType.SAVANNA]:       { name: "Savanna",            color: [200, 184, 120], water: false, walkable: true  },
  [TerrainType.TUNDRA]:        { name: "Tundra",             color: [168, 184, 160], water: false, walkable: true  },
  [TerrainType.SNOW]:          { name: "Snow",               color: [240, 245, 248], water: false, walkable: true  },
  [TerrainType.HILLS]:         { name: "Hills",              color: [138, 154,  90], water: false, walkable: true  },
  [TerrainType.MOUNTAIN]:      { name: "Mountain",           color: [106, 106, 106], water: false, walkable: false },
  [TerrainType.SNOW_MOUNTAIN]: { name: "Snow Mountain",      color: [216, 221, 224], water: false, walkable: false },
  [TerrainType.WETLAND]:       { name: "Wetland",            color: [ 98, 130,  98], water: false, walkable: true  },
  [TerrainType.LAKE]:          { name: "Lake",               color: [ 55, 105, 165], water: true,  walkable: false },
};

export function packColorRGB(rgb, alpha = 255) {
  return ((alpha & 255) << 24) | ((rgb[2] & 255) << 16) | ((rgb[1] & 255) << 8) | (rgb[0] & 255);
}

export const TerrainColorPacked = (() => {
  const out = new Uint32Array(Object.keys(TerrainInfo).length);
  for (const [id, info] of Object.entries(TerrainInfo)) {
    out[Number(id)] = packColorRGB(info.color);
  }
  return out;
})();