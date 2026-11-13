/**
 * Modular resource database.
 *
 * Every resource has:
 *  - id:               unique numeric id (0..N-1)
 *  - key:              string used in overlay mode names & code
 *  - name:             display name
 *  - category:         one of ResourceCategory
 *  - color:            [r,g,b] used in overlays
 *  - distribution:     generation strategy hint
 *  - baseQuantity:     typical quantity per tile when present (also regen cap)
 *  - regenRate:        units per real-world second (0 = non-renewable)
 *  - extractionRate:   max units per second per tile (future use)
 *  - description:      short text for inspection
 *  - uses:             list of intended uses (future systems)
 */
export const ResourceCategory = Object.freeze({
  NATURAL:      "natural",
  METALLIC:     "metallic",
  ENERGY:       "energy",
  AGRICULTURAL: "agricultural",
  AQUATIC:      "aquatic",
});

export const RESOURCE_ID = Object.freeze({
  WOOD:       0,
  STONE:      1,
  CLAY:       2,
  SAND:       3,
  COPPER:     4,
  IRON:       5,
  GOLD:       6,
  SILVER:     7,
  TIN:        8,
  COAL:       9,
  OIL:        10,
  GAS:        11,
  GRAIN:      12,
  FRUIT:      13,
  VEGETABLE:  14,
  LIVESTOCK:  15,
  FISH:       16,
  FRESHWATER: 17,
});

/** Maximum number of resources stored per tile. */
export const MAX_RESOURCES_PER_TILE = 6;

export const RESOURCES = [
  // ---- Natural ----
  {
    id: RESOURCE_ID.WOOD, key: "wood", name: "Wood",
    category: ResourceCategory.NATURAL,
    color: [102, 140, 68],
    distribution: "biome",
    baseQuantity: 500, regenRate: 0.6, extractionRate: 20,
    description: "Harvested from forests. Used for construction, fuel, and crafts.",
    uses: ["construction", "fuel", "crafts"],
  },
  {
    id: RESOURCE_ID.STONE, key: "stone", name: "Stone",
    category: ResourceCategory.NATURAL,
    color: [140, 140, 145],
    distribution: "geological",
    baseQuantity: 2000, regenRate: 0, extractionRate: 30,
    description: "Common building material quarried from hills and mountains.",
    uses: ["construction", "masonry"],
  },
  {
    id: RESOURCE_ID.CLAY, key: "clay", name: "Clay",
    category: ResourceCategory.NATURAL,
    color: [170, 95, 72],
    distribution: "biome",
    baseQuantity: 700, regenRate: 0, extractionRate: 15,
    description: "Fine-grained soil near water. Used for pottery and bricks.",
    uses: ["pottery", "construction"],
  },
  {
    id: RESOURCE_ID.SAND, key: "sand", name: "Sand",
    category: ResourceCategory.NATURAL,
    color: [222, 205, 150],
    distribution: "biome",
    baseQuantity: 1500, regenRate: 0, extractionRate: 25,
    description: "Found on beaches and deserts. Used for glass and mortar.",
    uses: ["glassmaking", "construction"],
  },

  // ---- Metallic ----
  {
    id: RESOURCE_ID.COPPER, key: "copper", name: "Copper",
    category: ResourceCategory.METALLIC,
    color: [205, 120, 62],
    distribution: "geological",
    baseQuantity: 450, regenRate: 0, extractionRate: 5,
    description: "Soft conductive metal. First metal worked by many civilizations.",
    uses: ["tools", "weapons", "wiring"],
  },
  {
    id: RESOURCE_ID.IRON, key: "iron", name: "Iron",
    category: ResourceCategory.METALLIC,
    color: [130, 72, 54],
    distribution: "geological",
    baseQuantity: 850, regenRate: 0, extractionRate: 6,
    description: "The backbone metal of pre-industrial and industrial economies.",
    uses: ["tools", "weapons", "construction", "industry"],
  },
  {
    id: RESOURCE_ID.GOLD, key: "gold", name: "Gold",
    category: ResourceCategory.METALLIC,
    color: [228, 184, 46],
    distribution: "geological",
    baseQuantity: 120, regenRate: 0, extractionRate: 1,
    description: "Rare precious metal. Used for coinage, jewellery, and prestige.",
    uses: ["currency", "luxury"],
  },
  {
    id: RESOURCE_ID.SILVER, key: "silver", name: "Silver",
    category: ResourceCategory.METALLIC,
    color: [205, 210, 220],
    distribution: "geological",
    baseQuantity: 180, regenRate: 0, extractionRate: 2,
    description: "Precious metal used for coinage, mirrors, and crafts.",
    uses: ["currency", "luxury", "trade"],
  },
  {
    id: RESOURCE_ID.TIN, key: "tin", name: "Tin",
    category: ResourceCategory.METALLIC,
    color: [190, 175, 155],
    distribution: "geological",
    baseQuantity: 320, regenRate: 0, extractionRate: 3,
    description: "Needed with copper to forge bronze. Enabled the Bronze Age.",
    uses: ["bronze", "alloys"],
  },

  // ---- Energy ----
  {
    id: RESOURCE_ID.COAL, key: "coal", name: "Coal",
    category: ResourceCategory.ENERGY,
    color: [48, 48, 52],
    distribution: "geological",
    baseQuantity: 2200, regenRate: 0, extractionRate: 40,
    description: "Combustible sedimentary rock. Fuelled the Industrial Revolution.",
    uses: ["fuel", "smelting", "industry"],
  },
  {
    id: RESOURCE_ID.OIL, key: "oil", name: "Oil",
    category: ResourceCategory.ENERGY,
    color: [42, 32, 22],
    distribution: "geological",
    baseQuantity: 3000, regenRate: 0, extractionRate: 60,
    description: "Petroleum. Foundation of the modern energy economy.",
    uses: ["fuel", "plastics", "industry"],
  },
  {
    id: RESOURCE_ID.GAS, key: "gas", name: "Natural Gas",
    category: ResourceCategory.ENERGY,
    color: [148, 188, 208],
    distribution: "geological",
    baseQuantity: 2200, regenRate: 0, extractionRate: 50,
    description: "Flammable gas occurring with oil and in gas fields.",
    uses: ["fuel", "heating", "industry"],
  },

  // ---- Agricultural ----
  {
    id: RESOURCE_ID.GRAIN, key: "grain", name: "Grain",
    category: ResourceCategory.AGRICULTURAL,
    color: [224, 202, 116],
    distribution: "agricultural",
    baseQuantity: 320, regenRate: 1.2, extractionRate: 15,
    description: "Cereals (wheat, rice, barley). Staple food of most civilizations.",
    uses: ["food", "trade"],
  },
  {
    id: RESOURCE_ID.FRUIT, key: "fruit", name: "Fruits",
    category: ResourceCategory.AGRICULTURAL,
    color: [200, 84, 84],
    distribution: "agricultural",
    baseQuantity: 220, regenRate: 0.9, extractionRate: 10,
    description: "Orchard fruits. Diverse diet and trade goods.",
    uses: ["food", "luxury"],
  },
  {
    id: RESOURCE_ID.VEGETABLE, key: "vegetable", name: "Vegetables",
    category: ResourceCategory.AGRICULTURAL,
    color: [90, 160, 70],
    distribution: "agricultural",
    baseQuantity: 260, regenRate: 1.1, extractionRate: 12,
    description: "Root vegetables and greens. Supplement to grain.",
    uses: ["food"],
  },
  {
    id: RESOURCE_ID.LIVESTOCK, key: "livestock", name: "Livestock",
    category: ResourceCategory.AGRICULTURAL,
    color: [168, 124, 84],
    distribution: "agricultural",
    baseQuantity: 200, regenRate: 0.5, extractionRate: 6,
    description: "Cattle, sheep, and goats. Meat, milk, wool, and traction.",
    uses: ["food", "wool", "traction"],
  },

  // ---- Aquatic ----
  {
    id: RESOURCE_ID.FISH, key: "fish", name: "Fish",
    category: ResourceCategory.AQUATIC,
    color: [110, 168, 220],
    distribution: "aquatic",
    baseQuantity: 420, regenRate: 1.0, extractionRate: 15,
    description: "Wild fish. Abundant along coasts, in lakes, and shallow seas.",
    uses: ["food", "trade"],
  },
  {
    id: RESOURCE_ID.FRESHWATER, key: "freshwater", name: "Freshwater",
    category: ResourceCategory.AQUATIC,
    color: [150, 190, 240],
    distribution: "aquatic",
    baseQuantity: 1000, regenRate: 8.0, extractionRate: 100,
    description: "Drinking and irrigation water from rivers and lakes.",
    uses: ["drinking", "irrigation", "industry"],
  },
];

export const RESOURCES_BY_KEY = (() => {
  const m = {};
  for (const r of RESOURCES) m[r.key] = r;
  return m;
})();

export const RESOURCE_COUNT = RESOURCES.length;