import { MinHeap } from "../utils/MinHeap.js";

const DIRS = [
  [-1, -1], [0, -1], [1, -1],
  [-1,  0],          [1,  0],
  [-1,  1], [0,  1], [1,  1],
];

const EPSILON = 1e-4;
const WATERLINE = 0.46; // elevation below which a tile is ocean/coast

/**
 * Priority-flood depression fill + D8 flow + accumulation.
 * Produces: filledElevation, flowDir, isLake, isRiver, riverStrength.
 * Deterministic (no RNG used).
 */
export class RiverGenerator {
  constructor(world) {
    this.world = world;
  }

  generate() {
    const world = this.world;
    const size = world.size;
    const n = world.tileCount;
    const elev = world.elevation;

    // ---- 1. Priority-flood fill ----
    const filledElev = new Float32Array(n);
    const visited    = new Uint8Array(n);
    const heap = new MinHeap(n + 1);

    // Seed with ocean tiles + map edges
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = y * size + x;
        const isOcean = elev[i] < WATERLINE;
        const isEdge  = x === 0 || y === 0 || x === size - 1 || y === size - 1;
        if (isOcean || isEdge) {
          filledElev[i] = elev[i];
          visited[i] = 1;
          heap.push(elev[i], i);
        }
      }
    }

    while (heap.size > 0) {
      const { key: curElev, value: curIdx } = heap.pop();
      const cx = curIdx % size;
      const cy = (curIdx / size) | 0;

      for (let d = 0; d < 8; d++) {
        const nx = cx + DIRS[d][0];
        const ny = cy + DIRS[d][1];
        if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
        const nIdx = ny * size + nx;
        if (visited[nIdx]) continue;

        const fillTo = Math.max(elev[nIdx], curElev + EPSILON);
        filledElev[nIdx] = fillTo;
        visited[nIdx] = 1;
        heap.push(fillTo, nIdx);
      }
    }

    world.filledElevation = filledElev;

    // ---- 2. D8 flow direction ----
    const flowDir = new Int8Array(n).fill(-1);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = y * size + x;
        if (elev[i] < WATERLINE) continue; // ocean cells don't flow

        let bestD = -1;
        let bestE = filledElev[i];
        for (let d = 0; d < 8; d++) {
          const nx = x + DIRS[d][0];
          const ny = y + DIRS[d][1];
          if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
          const nE = filledElev[ny * size + nx];
          if (nE < bestE) { bestE = nE; bestD = d; }
        }
        flowDir[i] = bestD;
      }
    }
    world.flowDir = flowDir;

    // ---- 3. Flow accumulation ----
    const accumulation = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      if (elev[i] >= WATERLINE) accumulation[i] = 1;
    }

    // Process cells in DESCENDING filledElevation order.
    // Counting-sort (quantised to 16 bits) — O(n) instead of O(n log n).
    const order = this._orderDescending(filledElev);
    for (let k = 0; k < n; k++) {
      const i = order[k];
      const d = flowDir[i];
      if (d >= 0) {
        const x = i % size;
        const y = (i / size) | 0;
        const ni = (y + DIRS[d][1]) * size + (x + DIRS[d][0]);
        accumulation[ni] += accumulation[i];
      }
    }

    // ---- 4. Lakes (significant fill above original terrain) ----
    const isLake = new Uint8Array(n);
    const LAKE_THRESHOLD = 0.002;
    for (let i = 0; i < n; i++) {
      if (elev[i] >= WATERLINE && (filledElev[i] - elev[i]) > LAKE_THRESHOLD) {
        isLake[i] = 1;
      }
    }
    world.isLake = isLake;

    // ---- 5. Rivers from accumulation ----
    const isRiver       = new Uint8Array(n);
    const riverStrength = new Uint8Array(n);
    const area = size * size;

    const streamThreshold = Math.max(15, area * 0.0003);
    const minorThreshold  = Math.max(30, area * 0.0008);
    const majorThreshold  = Math.max(80, area * 0.002);

    for (let i = 0; i < n; i++) {
      if (isLake[i] || elev[i] < WATERLINE) continue;
      const acc = accumulation[i];
      if (acc < streamThreshold) continue;
      isRiver[i] = 1;
      riverStrength[i] =
        acc >= majorThreshold ? 255 :
        acc >= minorThreshold ? 200 : 120;
    }
    world.isRiver       = isRiver;
    world.riverStrength = riverStrength;
  }

  /** Returns indices sorted by key descending via 16-bit counting sort. */
  _orderDescending(keys) {
    const n = keys.length;
    const BUCKETS = 65536;
    const counts  = new Uint32Array(BUCKETS);
    for (let i = 0; i < n; i++) {
      let b = (keys[i] * (BUCKETS - 1)) | 0;
      if (b < 0) b = 0; else if (b >= BUCKETS) b = BUCKETS - 1;
      counts[b]++;
    }
    const offsets = new Uint32Array(BUCKETS + 1);
    for (let i = 0; i < BUCKETS; i++) offsets[i + 1] = offsets[i] + counts[i];

    const result = new Uint32Array(n);
    const cur    = new Uint32Array(offsets);
    for (let i = 0; i < n; i++) {
      let b = (keys[i] * (BUCKETS - 1)) | 0;
      if (b < 0) b = 0; else if (b >= BUCKETS) b = BUCKETS - 1;
      result[cur[b]++] = i;
    }

    // Reverse to descending
    const desc = new Uint32Array(n);
    for (let i = 0; i < n; i++) desc[i] = result[n - 1 - i];
    return desc;
  }
}