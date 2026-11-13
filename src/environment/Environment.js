import { SEASON } from "./Seasons.js";

/**
 * Seasonal cycle. Owns sim-time progression of season/year and syncs
 * that state onto the World so any system can query it.
 */
export class Environment {
  constructor(world, { seasonLength = 30 } = {}) {
    this.world = world;
    this.seasonLength = seasonLength; // in simulated seconds
    this.season = 0;
    this.progress = 0;
    this.year = 1;

    // Write initial state
    this.world.season = this.season;
    this.world.seasonProgress = this.progress;
    this.world.year = this.year;
  }

  update(dt) {
    this.progress += dt / this.seasonLength;
    while (this.progress >= 1) {
      this.progress -= 1;
      this.season = (this.season + 1) % 4;
      if (this.season === SEASON.SPRING) this.year++;
    }
    this.world.season = this.season;
    this.world.seasonProgress = this.progress;
    this.world.year = this.year;
  }
}