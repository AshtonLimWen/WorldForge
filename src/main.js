import "./style.css";
import { Game } from "./core/Game.js";
import { HUD } from "./ui/HUD.js";

const $ = (id) => document.getElementById(id);

const canvas      = $("game-canvas");
const startScreen = $("start-screen");
const hud         = $("hud");
const loading     = $("loading");
const sizeSelect  = $("world-size");
const seedInput   = $("seed");
const generateBtn = $("generate");
const newWorldBtn = $("new-world");
const infoEl      = $("hud-info");
const coordsEl    = $("hud-coords");

const game = new Game(canvas);
const hudController = new HUD(game, { infoEl, coordsEl });

function showStart() {
  hudController.stop();
  startScreen.classList.remove("hidden");
  hud.classList.add("hidden");
  loading.classList.add("hidden");
  generateBtn.disabled = false;
}

function showGame() {
  startScreen.classList.add("hidden");
  hud.classList.remove("hidden");
  loading.classList.add("hidden");
  hudController.start();
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

  // Yield a frame so the loading overlay paints before heavy generation
  await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));

  try {
    game.generateWorld({ size, seed });
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

seedInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") generateWorld();
});

newWorldBtn.addEventListener("click", () => {
  game.stop();
  showStart();
});

// Initial state
showStart();