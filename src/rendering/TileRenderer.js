import { buildTileColors, OverlayMode } from "./Overlay.js";

/**
 * Renders the world to an offscreen canvas once per overlay change.
 * Main Renderer blits subsets of that canvas with pan/zoom.
 */
export class TileRenderer {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d", { alpha: false });
    this.world = null;
    this.mode = OverlayMode.TERRAIN;
    this._tileRes = 4;
    this._imageData = null;
    this._buf = null;
    this._tileColors = null;
  }

  get tileRes() { return this._tileRes; }
  getCanvas() { return this.canvas; }
  getMode() { return this.mode; }

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

    // Allocate reusable buffers
    this._tileColors = new Uint32Array(world.tileCount);
    this._imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
    this._buf = new Uint32Array(this._imageData.data.buffer);

    this.renderAll();
  }

  setMode(mode) {
    if (this.mode === mode) return;
    this.mode = mode;
    if (this.world) this.renderAll();
  }

  renderAll() {
    if (!this.world || !this._imageData) return;

    const { size } = this.world;
    const res = this._tileRes;
    const w = this.canvas.width;
    const tileColors = this._tileColors;
    const buf = this._buf;

    // 1. Compute per-tile packed colours
    buildTileColors(this.world, this.mode, tileColors);

    // 2. Blit into the ImageData buffer
    for (let ty = 0; ty < size; ty++) {
      const py0 = ty * res;
      const rowBase = ty * size;
      for (let tx = 0; tx < size; tx++) {
        const color = tileColors[rowBase + tx];
        const px0 = tx * res;
        for (let dy = 0; dy < res; dy++) {
          const dst = (py0 + dy) * w + px0;
          for (let dx = 0; dx < res; dx++) buf[dst + dx] = color;
        }
      }
    }

    this.ctx.putImageData(this._imageData, 0, 0);
  }
}