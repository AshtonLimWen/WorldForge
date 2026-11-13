import { TerrainInfo } from "../world/Terrain.js";

/**
 * Updates HUD text every ~200 ms. Minimal for Chunk 1.
 */
export class HUD {
  constructor(game, { infoEl, coordsEl }) {
    this.game = game;
    this.infoEl = infoEl;
    this.coordsEl = coordsEl;
    this._interval = 0;
  }

  start() {
    this._interval = setInterval(() => this._tick(), 200);
    this._tick();
  }

  stop() {
    if (this._interval) clearInterval(this._interval);
    this._interval = 0;
  }

  _tick() {
    const g = this.game;
    if (!g.world) {
      this.infoEl.textContent = "—";
      this.coordsEl.textContent = "—";
      return;
    }

    const seed = String(g.world.seed);
    this.infoEl.textContent =
      `World ${g.world.size}×${g.world.size} · Seed: ${seed} · Zoom ${g.camera.zoom.toFixed(1)}× · FPS ${g.clock.fps.toFixed(0)}`;

    const m = g.mouseWorld;
    if (m.inBounds) {
      const terrId = g.world.getTerrain(m.x, m.y);
      const terr = TerrainInfo[terrId]?.name ?? "?";
      this.coordsEl.textContent =
        `(${m.x}, ${m.y}) ${terr}`;
    } else {
      this.coordsEl.textContent = "—";
    }
  }
}