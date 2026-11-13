export const SEASON = Object.freeze({
  SPRING: 0,
  SUMMER: 1,
  AUTUMN: 2,
  WINTER: 3,
});

export const SEASON_NAMES = ["Spring", "Summer", "Autumn", "Winter"];

/**
 * Seasonal temperature offset for a given latitude.
 * @param season   0..3
 * @param progress 0..1 within season
 * @param latitude -1 (south pole) .. +1 (north pole)
 * @returns additive offset (roughly -0.35 .. +0.35)
 */
export function seasonalOffset(season, progress, latitude) {
  const phase = (season + progress) * Math.PI / 2;
  const amplitude = Math.abs(latitude) * 0.35;
  return Math.sin(phase) * amplitude * Math.sign(latitude);
}