/**
 * Tracks simulation time, real time, and running FPS.
 */
export class Clock {
  constructor() {
    this.simTime = 0;
    this.realTime = 0;
    this.fps = 0;
    this._fpsAcc = 0;
    this._fpsFrames = 0;
  }

  tickSim(dt) { this.simTime += dt; }

  tickReal(dt) {
    this.realTime += dt;
    this._fpsAcc += dt;
    this._fpsFrames++;
    if (this._fpsAcc >= 0.5) {
      this.fps = this._fpsFrames / this._fpsAcc;
      this._fpsAcc = 0;
      this._fpsFrames = 0;
    }
  }
}