/**
 * Fixed-timestep game loop with rendering every animation frame.
 * - Simulation `update(fixedDt)` runs at a stable rate.
 * - `render(realDt)` runs once per animation frame.
 */
export class GameLoop {
  constructor({ update, render, updatesPerSecond = 30, maxUpdatesPerFrame = 5 }) {
    this.update = update;
    this.render = render;
    this.fixedDt = 1 / updatesPerSecond;
    this.maxUpdatesPerFrame = maxUpdatesPerFrame;

    this.running = false;
    this.lastTime = 0;
    this.accumulator = 0;
    this._frame = this._frame.bind(this);
    this._rafId = 0;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this._rafId = requestAnimationFrame(this._frame);
  }

  stop() {
    this.running = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this._rafId = 0;
  }

  _frame(now) {
    if (!this.running) return;
    // Clamp real dt to avoid spiral of death after tab-out
    let dt = (now - this.lastTime) / 1000;
    if (dt > 0.25) dt = 0.25;
    this.lastTime = now;
    this.accumulator += dt;

    let steps = 0;
    while (this.accumulator >= this.fixedDt && steps < this.maxUpdatesPerFrame) {
      this.update(this.fixedDt);
      this.accumulator -= this.fixedDt;
      steps++;
    }
    // Discard excess accumulated time if we hit the clamp
    if (steps === this.maxUpdatesPerFrame) this.accumulator = 0;

    this.render(dt);
    this._rafId = requestAnimationFrame(this._frame);
  }
}