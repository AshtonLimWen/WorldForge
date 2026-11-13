import { MAX_RESOURCES_PER_TILE, RESOURCES } from "./ResourceTypes.js";

/**
 * Attempt to extract `amount` units of `resourceId` from a tile.
 * Returns the actual amount extracted (capped by availability and
 * the resource's per-second extraction rate cap, which is unused for now).
 */
export function extractResource(world, tileIndex, resourceId, amount) {
  if (tileIndex < 0 || tileIndex >= world.tileCount) return 0;
  if (amount <= 0) return 0;

  const { resourceType, resourceQty, resourceMaxQty, depletedTiles } = world;
  const base = tileIndex * MAX_RESOURCES_PER_TILE;

  for (let s = 0; s < MAX_RESOURCES_PER_TILE; s++) {
    if (resourceType[base + s] === resourceId + 1) {
      const available = resourceQty[base + s];
      const extracted = Math.min(available, amount);
      resourceQty[base + s] = available - extracted;
      if (resourceQty[base + s] < resourceMaxQty[base + s]) {
        depletedTiles.add(tileIndex);
      }
      return extracted;
    }
  }
  return 0;
}

/** Returns the current quantity of `resourceId` on a tile (0 if absent). */
export function getResourceQuantity(world, tileIndex, resourceId) {
  const base = tileIndex * MAX_RESOURCES_PER_TILE;
  for (let s = 0; s < MAX_RESOURCES_PER_TILE; s++) {
    if (world.resourceType[base + s] === resourceId + 1) {
      return world.resourceQty[base + s];
    }
  }
  return 0;
}

/**
 * Returns an array of { id, key, name, quantity, maxQuantity } for the
 * tile's resources. Includes depleted entries (quantity = 0) so inspector
 * can still show them. Use `includeDepleted: false` to filter.
 */
export function getTileResources(world, tileIndex, { includeDepleted = true } = {}) {
  const out = [];
  const base = tileIndex * MAX_RESOURCES_PER_TILE;
  for (let s = 0; s < MAX_RESOURCES_PER_TILE; s++) {
    const t = world.resourceType[base + s];
    if (t === 0) continue;
    const id = t - 1;
    const def = RESOURCES[id];
    const qty = world.resourceQty[base + s];
    if (!includeDepleted && qty <= 0) continue;
    out.push({
      id,
      key: def.key,
      name: def.name,
      quantity: qty,
      maxQuantity: world.resourceMaxQty[base + s],
    });
  }
  return out;
}

/** Total deposit value estimate for a tile (Σ quantities). */
export function getTileResourceTotal(world, tileIndex) {
  const base = tileIndex * MAX_RESOURCES_PER_TILE;
  let total = 0;
  for (let s = 0; s < MAX_RESOURCES_PER_TILE; s++) {
    if (world.resourceType[base + s] !== 0) {
      total += world.resourceQty[base + s];
    }
  }
  return total;
}