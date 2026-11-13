/**
 * The World holds all per-tile data using typed arrays for
 * cache-friendly iteration and low memory overhead.
 */
export class World {
  constructor(size, seed) {
    this.size = size;
    this.seed = seed; // display seed (original input)
    this.tileCount = size * size;

    this.elevation   = new Float32Array(this.tileCount); // [0,1]
    this.temperature = new Float32Array(this.tileCount); // [0,1]
    this.moisture    = new Float32Array(this.tileCount); // [0,1]
    this.terrain     = new Uint8Array(this.tileCount);   // TerrainType
  }

  index(x, y) { return y * this.size + x; }

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.size && y < this.size;
  }

  getTerrain(x, y) {
    if (!this.inBounds(x, y)) return 0;
    return this.terrain[y * this.size + x];
  }

  getElevation(x, y) {
    if (!this.inBounds(x, y)) return 0;
    return this.elevation[y * this.size + x];
  }

  getTemperature(x, y) {
    if (!this.inBounds(x, y)) return 0;
    return this.temperature[y * this.size + x];
  }

  getMoisture(x, y) {
    if (!this.inBounds(x, y)) return 0;
    return this.moisture[y * this.size + x];
  }
}