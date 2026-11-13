import { TerrainInfo } from "../world/Terrain.js";
import { getTileResources } from "../resources/Extraction.js";
import { SEASON_NAMES } from "../environment/Seasons.js";

/**
 * Persistent side panel showing everything about the selected tile.
 */
export class TileInspector {
  constructor(game, { panelEl, titleEl, bodyEl, closeBtn }) {
    this.game = game;
    this.panelEl = panelEl;
    this.titleEl = titleEl;
    this.bodyEl = bodyEl;
    this._interval = 0;

    closeBtn.addEventListener("click", () => {
      this.game.selectedTile = null;
      this.panelEl.classList.add("hidden");
    });
  }

  start() {
    this._interval = setInterval(() => this._tick(), 150);
    this._tick();
  }

  stop() {
    if (this._interval) clearInterval(this._interval);
    this._interval = 0;
  }

  _tick() {
    const g = this.game;
    const sel = g.selectedTile;
    if (!sel || !g.world || !g.world.inBounds(sel.x, sel.y)) {
      this.panelEl.classList.add("hidden");
      return;
    }
    this.panelEl.classList.remove("hidden");
    this._render(sel.x, sel.y);
  }

  _render(tx, ty) {
    const w = this.game.world;
    const i = ty * w.size + tx;
    const terr = TerrainInfo[w.terrain[i]];
    this.titleEl.textContent = `Tile (${tx}, ${ty}) — ${terr.name}`;

    const seasonName = SEASON_NAMES[w.season] || "?";
    const effTemp = w.getEffectiveTemperature(tx, ty);
    const baseTemp = w.temperature[i];
    const resources = getTileResources(w, i);

    const waterState =
      w.isLake[i] ? "Lake" :
      w.isRiver[i] ? "River" :
      w.elevation[i] < 0.46 ? "Ocean / Sea" :
      "Land";

    const resHtml = resources.length === 0
      ? `<div class="inspector-empty">No resources</div>`
      : resources.map((r) => {
          const pct = r.maxQuantity > 0 ? (r.quantity / r.maxQuantity) : 0;
          return `<div class="resource-row">
            <span class="resource-name">${r.name}</span>
            <span class="resource-qty">${Math.round(r.quantity)} / ${Math.round(r.maxQuantity)}</span>
            <div class="resource-bar"><div style="width:${(pct * 100).toFixed(0)}%"></div></div>
          </div>`;
        }).join("");

    this.bodyEl.innerHTML = `
      <div class="inspector-section">
        <div class="inspector-row"><span>Terrain</span><span>${terr.name}</span></div>
        <div class="inspector-row"><span>Water</span><span>${waterState}</span></div>
        <div class="inspector-row"><span>Elevation</span><span>${(w.elevation[i] * 100).toFixed(1)}%</span></div>
      </div>

      <div class="inspector-section">
        <div class="inspector-row"><span>Temperature (base)</span><span>${(baseTemp * 100).toFixed(0)}%</span></div>
        <div class="inspector-row"><span>Temperature (${seasonName})</span><span>${(effTemp * 100).toFixed(0)}%</span></div>
        <div class="inspector-row"><span>Rainfall</span><span>${(w.rainfall[i] * 100).toFixed(0)}%</span></div>
        <div class="inspector-row"><span>Humidity</span><span>${(w.humidity[i] * 100).toFixed(0)}%</span></div>
      </div>

      <div class="inspector-section">
        <div class="inspector-row"><span>Soil Fertility</span><span>${(w.soilFertility[i] * 100).toFixed(0)}%</span></div>
        <div class="inspector-row"><span>Soil Moisture</span><span>${(w.soilMoisture[i] * 100).toFixed(0)}%</span></div>
        <div class="inspector-row"><span>Vegetation</span><span>${(w.vegetation[i] * 100).toFixed(0)}%</span></div>
      </div>

      <div class="inspector-section">
        <div class="inspector-section-title">Resources</div>
        ${resHtml}
      </div>
    `;
  }
}