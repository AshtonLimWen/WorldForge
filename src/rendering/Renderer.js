import { TileRenderer } from "./TileRenderer.js";

/**
 * Owns the main canvas context and draws the world via a
 * pre-rendered offscreen canvas. Handles DPI resizing.
 */
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.tileRenderer = new TileRenderer();
    this.world = null;
    this.camera = null;
    this.dpr = 1;
    this.resize();
  }

  /** Match internal canvas pixel size to CSS size × DPR. */
  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width  * dpr));
    const h = Math.max(1, Math.floor(rect.height * dpr));
    if (this.canvas.width !== w)  this.canvas.width = w;
    if (this.canvas.height !== h) this.canvas.height = h;
    this.dpr = dpr;
  }

  setWorld(world, camera) {
    this.world = world;
    this.camera = camera;
    this.tileRenderer.setWorld(world);
  }

  render() {
    if (!this.world || !this.camera) return;

    const { ctx, canvas, camera, tileRenderer } = this;
    const world = this.world;
    const worldCanvas = tileRenderer.getCanvas();
    const res = tileRenderer.tileRes;

    // Clear background
    ctx.fillStyle = "#060810";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const zoom = camera.zoom; // canvas px per tile

    // Visible world-tile rectangle
    const halfW = (canvas.width  / 2) / zoom;
    const halfH = (canvas.height / 2) / zoom;
    const x0 = Math.max(0, camera.x - halfW);
    const y0 = Math.max(0, camera.y - halfH);
    const x1 = Math.min(world.size, camera.x + halfW);
    const y1 = Math.min(world.size, camera.y + halfH);

    if (x1 <= x0 || y1 <= y0) return;

    // Source rect in offscreen canvas
    const sx = x0 * res;
    const sy = y0 * res;
    const sw = (x1 - x0) * res;
    const sh = (y1 - y0) * res;

    // Dest rect in main canvas
    const dx = (x0 - camera.x) * zoom + canvas.width  / 2;
    const dy = (y0 - camera.y) * zoom + canvas.height / 2;
    const dw = (x1 - x0) * zoom;
    const dh = (y1 - y0) * zoom;

    // Nearest-neighbor when upscaling for crisp pixels;
    // smooth when heavily downscaling to avoid aliasing.
    ctx.imageSmoothingEnabled = zoom < res;

    ctx.drawImage(worldCanvas, sx, sy, sw, sh, dx, dy, dw, dh);
  }
}