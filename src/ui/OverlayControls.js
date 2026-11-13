/**
 * Wires a <select> element to the Game overlay system.
 */
export class OverlayControls {
  constructor(game, selectEl) {
    this.game = game;
    this.selectEl = selectEl;
    this.selectEl.addEventListener("change", () => {
      this.game.setOverlay(this.selectEl.value);
    });
    this.selectEl.value = "terrain";
  }

  show() { this.selectEl.disabled = false; }
  hide() { this.selectEl.disabled = true; }
}