import { TileRenderer } from "./TileRenderer.js";
import { OverlayMode } from "./Overlay.js";

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

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width  * dpr));
    const h = Math.max(1, Math.floor(rect.height * dpr));
    if (this.canvas.width  !== w) this.canvas.width  = w;
    if (this.canvas.height !== h) this.canvas.height = h;
    this.dpr = dpr;
  }

  setWorld(world, camera) {
    this.world = world;
    this.camera = camera;
    this.tileRenderer.setWorld(world);
  }

  setOverlay(mode) {
    this.tileRenderer.setMode(mode);
  }

  render() {
    if (!this.world || !this.camera) return;

    const { ctx, canvas, camera, tileRenderer } = this;
    const world = this.world;
    const worldCanvas = tileRenderer.getCanvas();
    const res = tileRenderer.tileRes;

    ctx.fillStyle = "#060810";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const zoom = camera.zoom;
    const halfW = (canvas.width  / 2) / zoom;
    const halfH = (canvas.height / 2) / zoom;
    const x0 = Math.max(0, camera.x - halfW);
    const y0 = Math.max(0, camera.y - halfH);
    const x1 = Math.min(world.size, camera.x + halfW);
    const y1 = Math.min(world.size, camera.y + halfH);

    if (x1 <= x0 || y1 <= y0) return;

    const sx = x0 * res;
    const sy = y0 * res;
    const sw = (x1 - x0) * res;
    const sh = (y1 - y0) * res;
    const dx = (x0 - camera.x) * zoom + canvas.width  / 2;
    const dy = (y0 - camera.y) * zoom + canvas.height / 2;
    const dw = (x1 - x0) * zoom;
    const dh = (y1 - y0) * zoom;

    ctx.imageSmoothingEnabled = zoom < res;
    ctx.drawImage(worldCanvas, sx, sy, sw, sh, dx, dy, dw, dh);
  }
}