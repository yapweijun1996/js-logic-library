// Pull-to-shoot gesture math. Pure functions: no DOM, no globals, no dependencies.
// Units: pointer positions and distance share one unit (pixels); ratios are 0..1.
// Input: pointer start/current positions and track length (numbers); a ratio (number).
// Output: pullRatio and shotStrength return 0..1; reachesMinPull returns a boolean.

export const PULL = Object.freeze({ min: 0.05, curve: 1.5 });

// How far a drag has travelled along a track, clamped to 0..1.
export const pullRatio = (start, current, distance) =>
  distance > 0 ? Math.min(1, Math.max(0, (current - start) / distance)) : 0;

// Power curve: gentle pulls stay gentle, full pulls reach 1.
export const shotStrength = (ratio) => Math.max(0, Math.min(1, ratio)) ** PULL.curve;

// True when a released pull is long enough to shoot. The tolerance absorbs float
// noise: an exact 5% pull computed from pixel coordinates can land at 0.04999999.
export const reachesMinPull = (ratio, min = PULL.min) => ratio >= min - 1e-9;
