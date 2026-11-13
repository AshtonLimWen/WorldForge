import { TerrainInfo } from "../world/Terrain.js";
import { SEASON_NAMES } from "../environment/Seasons.js";
import { OverlayMode, OVERLAY_LABELS } from "../rendering/Overlay.js";

export class HUD {
  constructor(game, { infoEl, coordsEl }) {
    this.game = game;
    this.infoEl = infoEl;
    this.coordsEl = coordsEl;
    this._interval = 0;
    this._overlayMode = OverlayMode.TERRAIN;
  }

  setOverlayMode(mode) { this._overlayMode = mode; }

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

    const w = g.world;
    const seed = String(w.seed);
    const seasonStr = SEASON_NAMES[w.season] || "?";
    const overlayStr = OVERLAY_LABELS[this._overlayMode] || this._overlayMode;

    this.infoEl.textContent =
      `${w.size}×${w.size} · Seed ${seed} · Y${w.year} ${seasonStr} · ${overlayStr} · ${g.camera.zoom.toFixed(1)}× · ${g.clock.fps.toFixed(0)}fps`;

    const m = g.mouseWorld;
    if (m.inBounds) {
      const i = m.y * w.size + m.x;
      const terr = TerrainInfo[w.terrain[i]]?.name ?? "?";
      const elev = (w.elevation[i] * 100).toFixed(0);
      const temp = (w.getEffectiveTemperature(m.x, m.y) * 100).toFixed(0);
      const rain = (w.rainfall[i] * 100).toFixed(0);
      const waterFlag = w.isLake[i] ? " [lake]" : w.isRiver[i] ? " [river]" : "";
      this.coordsEl.textContent =
        `(${m.x}, ${m.y}) ${terr}${waterFlag} · e${elev} t${temp} r${rain}`;
    } else {
      this.coordsEl.textContent = "—";
    }
  }
}