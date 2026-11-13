import { GameLoop } from "./GameLoop.js";
import { Clock } from "./Clock.js";
import { Camera } from "../rendering/Camera.js";
import { Renderer } from "../rendering/Renderer.js";
import { WorldGenerator } from "../generation/WorldGenerator.js";
import { Environment } from "../environment/Environment.js";
import { ResourceSystem } from "../resources/ResourceSystem.js";

export class Game {
  constructor(canvas, { onStatus } = {}) {
    this.canvas = canvas;
    this.camera = new Camera(canvas);
    this.renderer = new Renderer(canvas);
    this.clock = new Clock();
    this.world = null;
    this.environment = null;
    this.resourceSystem = null;
    this.onStatus = onStatus || (() => {});
    this.mouseWorld = { x: 0, y: 0, inBounds: false };
    this.selectedTile = null;

    this.loop = new GameLoop({
      update: (dt) => this._update(dt),
      render: (dt) => this._render(dt),
    });

    this._bindInput();
    this._bindResize();
  }

  generateWorld({ size, seed }) {
    this.loop.stop();
    this.world = new WorldGenerator({ size, seed }).generate();
    this.environment = new Environment(this.world);
    this.resourceSystem = new ResourceSystem(this.world);
    this.selectedTile = null;

    this.renderer.resize();
    this.renderer.setWorld(this.world, this.camera);
    this.camera.setWorld(this.world.size);
    this.camera.fitWorld(this.world.size);

    this.clock = new Clock();
    this.loop.start();
  }

  stop() {
    this.loop.stop();
    this.selectedTile = null;
  }

  setOverlay(mode) {
    this.renderer.setOverlay(mode);
  }

  _update(dt) {
    this.clock.tickSim(dt);
    if (this.environment) this.environment.update(dt);
    if (this.resourceSystem) this.resourceSystem.update(dt);
  }

  _render(dt) {
    this.clock.tickReal(dt);
    this.renderer.render();
  }

  _bindInput() {
    const canvas = this.canvas;

    let dragging = false;
    let lastCx = 0, lastCy = 0;
    let dragStartX = 0, dragStartY = 0;
    let dragMoved = false;

    canvas.addEventListener("mousedown", (e) => {
      if (e.button === 0) {
        dragging = true;
        lastCx = e.clientX; lastCy = e.clientY;
        dragStartX = e.clientX; dragStartY = e.clientY;
        dragMoved = false;
      } else if (e.button === 1 || e.button === 2) {
        dragging = true;
        dragMoved = true;
        lastCx = e.clientX; lastCy = e.clientY;
      }
    });

    window.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const sx = (e.clientX - rect.left) * this.renderer.dpr;
      const sy = (e.clientY - rect.top)  * this.renderer.dpr;
      const w = this.camera.screenToWorld(sx, sy);
      this.mouseWorld.x = Math.floor(w.x);
      this.mouseWorld.y = Math.floor(w.y);
      this.mouseWorld.inBounds = !!this.world && this.world.inBounds(
        this.mouseWorld.x, this.mouseWorld.y
      );

      if (!dragging || !this.world) return;
      const dx = e.clientX - lastCx;
      const dy = e.clientY - lastCy;
      lastCx = e.clientX;
      lastCy = e.clientY;
      if (Math.abs(e.clientX - dragStartX) > 4 ||
          Math.abs(e.clientY - dragStartY) > 4) {
        dragMoved = true;
      }
      this.camera.panScreen(dx * this.renderer.dpr, dy * this.renderer.dpr);
    });

    canvas.addEventListener("mouseup", (e) => {
      if (e.button === 0 && !dragMoved && this.world) {
        const rect = canvas.getBoundingClientRect();
        const sx = (e.clientX - rect.left) * this.renderer.dpr;
        const sy = (e.clientY - rect.top)  * this.renderer.dpr;
        const w = this.camera.screenToWorld(sx, sy);
        const tx = Math.floor(w.x);
        const ty = Math.floor(w.y);
        if (this.world.inBounds(tx, ty)) {
          this.selectedTile = { x: tx, y: ty };
        } else {
          this.selectedTile = null;
        }
      }
      dragging = false;
    });

    window.addEventListener("mouseup", () => { dragging = false; });
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    canvas.addEventListener("wheel", (e) => {
      if (!this.world) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const sx = (e.clientX - rect.left) * this.renderer.dpr;
      const sy = (e.clientY - rect.top)  * this.renderer.dpr;
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      this.camera.zoomAtScreen(sx, sy, factor);
    }, { passive: false });

    window.addEventListener("keydown", (e) => {
      if (!this.world) return;
      const stepCss = 60;
      const step = stepCss * this.renderer.dpr;
      const cx = canvas.width  / 2;
      const cy = canvas.height / 2;
      switch (e.key) {
        case "ArrowLeft":  case "a": case "A": this.camera.panScreen(-step, 0); e.preventDefault(); break;
        case "ArrowRight": case "d": case "D": this.camera.panScreen( step, 0); e.preventDefault(); break;
        case "ArrowUp":    case "w": case "W": this.camera.panScreen(0, -step); e.preventDefault(); break;
        case "ArrowDown":  case "s": case "S": this.camera.panScreen(0,  step); e.preventDefault(); break;
        case "+": case "=": this.camera.zoomAtScreen(cx, cy, 1.2); e.preventDefault(); break;
        case "-": case "_": this.camera.zoomAtScreen(cx, cy, 1 / 1.2); e.preventDefault(); break;
        case "Escape": this.selectedTile = null; break;
      }
    });
  }

  _bindResize() {
    window.addEventListener("resize", () => {
      this.renderer.resize();
      if (this.world) {
        const wasAtMin = Math.abs(this.camera.zoom - this.camera.minZoom) < 0.02;
        this.camera.setWorld(this.world.size);
        if (wasAtMin) this.camera.fitWorld(this.world.size);
      }
    });
  }
}