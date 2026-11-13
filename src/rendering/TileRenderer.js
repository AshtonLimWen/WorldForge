import { TerrainColorPacked } from "../world/Terrain.js";

/**
 * Renders the entire world once to an offscreen canvas.
 * The main Renderer then blits subsets of this canvas with pan/zoom.
 *
 * The offscreen canvas uses a fixed pixels-per-tile resolution chosen
 * based on world size to balance memory (~<25 MB) vs. detail.
 */
export class TileRenderer {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d", { alpha: false });
    this.world = null;
    this._tileRes = 4;
  }

  get tileRes() { return this._tileRes; }
  getCanvas() { return this.canvas; }

  _chooseTileRes(size) {
    if (size <= 100) return 12;
    if (size <= 200) return 8;
    if (size <= 400) return 5;
    return 4;
  }

  setWorld(world) {
    this.world = world;
    this._tileRes = this._chooseTileRes(world.size);
    this.canvas.width  = world.size * this._tileRes;
    this.canvas.height = world.size * this._tileRes;
    this.renderAll();
  }

  renderAll() {
    const { size, terrain } = this.world;
    const res = this._tileRes;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const imageData = this.ctx.createImageData(w, h);
    const buf = new Uint32Array(imageData.data.buffer);

    for (let ty = 0; ty < size; ty++) {
      const py0 = ty * res;
      for (let tx = 0; tx < size; tx++) {
        const color = TerrainColorPacked[terrain[ty * size + tx]];
        const px0 = tx * res;
        for (let dy = 0; dy < res; dy++) {
          const rowStart = (py0 + dy) * w + px0;
          // Fill 'res' horizontal pixels
          for (let dx = 0; dx < res; dx++) {
            buf[rowStart + dx] = color;
          }
        }
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }
}