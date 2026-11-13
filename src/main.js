import "./style.css";
import { Game } from "./core/Game.js";
import { HUD } from "./ui/HUD.js";
import { OverlayControls } from "./ui/OverlayControls.js";
import { TileInspector } from "./ui/TileInspector.js";
import { RESOURCES } from "./resources/ResourceTypes.js";

const $ = (id) => document.getElementById(id);

const canvas       = $("game-canvas");
const startScreen  = $("start-screen");
const hud          = $("hud");
const overlayPanel = $("overlay-panel");
const loading      = $("loading");
const sizeSelect   = $("world-size");
const seedInput    = $("seed");
const generateBtn  = $("generate");
const newWorldBtn  = $("new-world");
const infoEl       = $("hud-info");
const coordsEl     = $("hud-coords");
const overlaySel   = $("overlay-select");
const inspector    = $("inspector");
const inspectorTitle = $("inspector-title");
const inspectorBody  = $("inspector-body");
const inspectorClose = $("inspector-close");

const game = new Game(canvas);
const hudController = new HUD(game, { infoEl, coordsEl });
const overlayControls = new OverlayControls(game, overlaySel);
const tileInspector = new TileInspector(game, {
  panelEl: inspector,
  titleEl: inspectorTitle,
  bodyEl: inspectorBody,
  closeBtn: inspectorClose,
});

// Populate the Resources optgroup with per-resource options
(() => {
  const group = overlaySel.querySelector('optgroup[label="Resources"]');
  if (!group) return;
  for (const r of RESOURCES) {
    const opt = document.createElement("option");
    opt.value = `resource:${r.key}`;
    opt.textContent = `Resources: ${r.name}`;
    group.appendChild(opt);
  }
})();

overlaySel.addEventListener("change", () => {
  hudController.setOverlayMode(overlaySel.value);
});

function showStart() {
  hudController.stop();
  tileInspector.stop();
  inspector.classList.add("hidden");
  startScreen.classList.remove("hidden");
  hud.classList.add("hidden");
  overlayPanel.classList.add("hidden");
  loading.classList.add("hidden");
  generateBtn.disabled = false;
}

function showGame() {
  startScreen.classList.add("hidden");
  hud.classList.remove("hidden");
  overlayPanel.classList.remove("hidden");
  loading.classList.add("hidden");
  hudController.start();
  tileInspector.start();
}

async function generateWorld() {
  const size = parseInt(sizeSelect.value, 10);
  let seed = seedInput.value.trim();
  if (!seed) {
    seed = Math.random().toString(36).slice(2, 10);
    seedInput.value = seed;
  }

  loading.classList.remove("hidden");
  generateBtn.disabled = true;
  await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));

  try {
    game.generateWorld({ size, seed });
    overlaySel.value = "terrain";
    hudController.setOverlayMode("terrain");
    game.setOverlay("terrain");
    showGame();
  } catch (err) {
    console.error("World generation failed:", err);
    loading.classList.add("hidden");
    startScreen.classList.remove("hidden");
    generateBtn.disabled = false;
    alert("World generation failed. See the browser console.");
  }
}

generateBtn.addEventListener("click", generateWorld);
seedInput.addEventListener("keydown", (e) => { if (e.key === "Enter") generateWorld(); });
newWorldBtn.addEventListener("click", () => { game.stop(); showStart(); });

showStart();