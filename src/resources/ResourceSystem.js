import { MAX_RESOURCES_PER_TILE, RESOURCES } from "./ResourceTypes.js";

/**
 * Passive resource regeneration.
 *
 * Ticks every `regenInterval` seconds. Only visits tiles flagged as
 * "depleted" (added by `extractResource`). Removes tiles from the
 * depleted set once all regenerable resources have reached their
 * max quantity.
 */
export class ResourceSystem {
  constructor(world, { regenInterval = 2.0 } = {}) {
    this.world = world;
    this.regenInterval = regenInterval;
    this.accumulator = 0;
  }

  update(dt) {
    const depleted = this.world.depletedTiles;
    if (!depleted || depleted.size === 0) return;

    this.accumulator += dt;
    if (this.accumulator < this.regenInterval) return;
    const elapsed = this.accumulator;
    this.accumulator = 0;

    const { resourceType, resourceQty, resourceMaxQty } = this.world;
    for (const tileIndex of depleted) {
      const base = tileIndex * MAX_RESOURCES_PER_TILE;
      let stillDepleted = false;
      for (let s = 0; s < MAX_RESOURCES_PER_TILE; s++) {
        const t = resourceType[base + s];
        if (t === 0) continue;
        const def = RESOURCES[t - 1];
        if (!def || def.regenRate <= 0) continue;
        const max = resourceMaxQty[base + s];
        if (resourceQty[base + s] < max) {
          resourceQty[base + s] = Math.min(
            max,
            resourceQty[base + s] + def.regenRate * elapsed * 10
          );
        }
        if (resourceQty[base + s] < max) stillDepleted = true;
      }
      if (!stillDepleted) depleted.delete(tileIndex);
    }
  }
}