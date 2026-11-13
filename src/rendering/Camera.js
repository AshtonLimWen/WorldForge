/**
 * Orthographic top-down camera.
 *
 * Coordinate conventions:
 *  - Camera.x / Camera.y are in world tile units.
 *  - Camera.zoom is measured in *canvas pixels per tile*.
 *  - Canvas pixel dimensions include the device pixel ratio.
 */
export class Camera {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = 0;
    this.y = 0;
    this.zoom = 8;
    this.minZoom = 0.5;
    this.maxZoom = 40;
    this.worldSize = 1;
  }

  setWorld(worldSize) {
    this.worldSize = worldSize;
    this.minZoom = Math.min(
      this.canvas.width / worldSize,
      this.canvas.height / worldSize
    ) * 0.9;
    this.maxZoom = 40;
    if (this.zoom < this.minZoom) this.zoom = this.minZoom;
    if (this.zoom > this.maxZoom) this.zoom = this.maxZoom;
    this.clamp();
  }

  fitWorld(worldSize) {
    this.zoom = this.minZoom;
    this.x = worldSize / 2;
    this.y = worldSize / 2;
    this.clamp();
  }

  worldToScreen(wx, wy) {
    return {
      x: (wx - this.x) * this.zoom + this.canvas.width / 2,
      y: (wy - this.y) * this.zoom + this.canvas.height / 2,
    };
  }

  screenToWorld(sx, sy) {
    return {
      x: (sx - this.canvas.width / 2) / this.zoom + this.x,
      y: (sy - this.canvas.height / 2) / this.zoom + this.y,
    };
  }

  /** Pan by a delta expressed in canvas pixels. */
  panScreen(dxCanvasPx, dyCanvasPx) {
    this.x -= dxCanvasPx / this.zoom;
    this.y -= dyCanvasPx / this.zoom;
    this.clamp();
  }

  /** Zoom around a fixed canvas-pixel point. */
  zoomAtScreen(sxCanvasPx, syCanvasPx, factor) {
    const before = this.screenToWorld(sxCanvasPx, syCanvasPx);
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * factor));
    const after = this.screenToWorld(sxCanvasPx, syCanvasPx);
    this.x += before.x - after.x;
    this.y += before.y - after.y;
    this.clamp();
  }

  clamp() {
    const margin = 5;
    const max = this.worldSize + margin;
    if (this.x < -margin) this.x = -margin;
    if (this.y < -margin) this.y = -margin;
    if (this.x > max)     this.x = max;
    if (this.y > max)     this.y = max;
  }
}