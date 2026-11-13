/**
 * The World holds all per-tile data using typed arrays.
 * Chunk 2 adds environmental fields (rainfall, humidity, climateZone,
 * soil, vegetation, rivers/lakes, and season state).
 */
export class World {
  constructor(size, seed) {
    this.size = size;
    this.seed = seed; // display seed (original input)
    this.tileCount = size * size;
    const n = this.tileCount;

    // ---- Chunk 1 fields ----
    this.elevation   = new Float32Array(n);
    this.temperature = new Float32Array(n);
    this.moisture    = new Float32Array(n);
    this.terrain     = new Uint8Array(n);

    // ---- Chunk 2: climate ----
    this.rainfall    = new Float32Array(n);
    this.humidity    = new Float32Array(n);
    this.climateZone = new Uint8Array(n);

    // ---- Chunk 2: soil & vegetation ----
    this.soilFertility = new Float32Array(n);
    this.soilMoisture  = new Float32Array(n);
    this.vegetation    = new Float32Array(n);

    // ---- Chunk 2: hydrology ----
    this.filledElevation = new Float32Array(n); // filled DEM
    this.flowDir         = new Int8Array(n);    // -1..7 (D8)
    this.isLake          = new Uint8Array(n);
    this.isRiver         = new Uint8Array(n);
    this.riverStrength   = new Uint8Array(n);
    this.distanceToOcean = new Float32Array(n);

    // ---- Chunk 2: season state ----
    this.season = 0;         // 0..3
    this.seasonProgress = 0; // 0..1
    this.year = 1;
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

  getEffectiveTemperature(x, y) {
    if (!this.inBounds(x, y)) return 0;
    const i = y * this.size + x;
    const base = this.temperature[i];
    const lat = 1 - (2 * y) / this.size;
    const phase = (this.season + this.seasonProgress) * Math.PI / 2;
    const amp = Math.abs(lat) * 0.35;
    const offset = Math.sin(phase) * amp * Math.sign(lat);
    const v = base + offset;
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  getRainfall(x, y) {
    if (!this.inBounds(x, y)) return 0;
    return this.rainfall[y * this.size + x];
  }

  getMoisture(x, y) {
    if (!this.inBounds(x, y)) return 0;
    return this.moisture[y * this.size + x];
  }

  isWater(x, y) {
    if (!this.inBounds(x, y)) return false;
    const i = y * this.size + x;
    return this.elevation[i] < 0.46 || this.isLake[i] === 1 || this.isRiver[i] === 1;
  }
}