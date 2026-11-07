// Pull-to-shoot gesture math. Pure functions: no DOM, no globals.
// Units: pointer positions and distance share one unit (pixels); ratios are 0..1.
// Version: 1.0.0
// Source: Blender-3D-Gallery Eight-Ball game (src/game/interaction.js).
// License: Apache-2.0

import { clamp } from "../math/clamp.js";

/** Gesture thresholds: minimum pull ratio to shoot (0.05) and the power-curve exponent (1.5). */
export const PULL = Object.freeze({ min: 0.05, curve: 1.5 });

/**
 * How far a drag has travelled along a track, clamped to 0..1.
 * @param {number} start - Pointer position where the drag began.
 * @param {number} current - Current pointer position.
 * @param {number} distance - Track length in the same unit as the positions.
 * @returns {number} Pull ratio in 0..1.
 * @edge A track length of 0 or less returns 0.
 * @edge Dragging backwards (current < start) returns 0.
 * @example pullRatio(100, 150, 100) // => 0.5
 * @example pullRatio(100, 50, 100) // => 0
 */
export const pullRatio = (start, current, distance) =>
  distance > 0 ? clamp((current - start) / distance, 0, 1) : 0;

/**
 * Power curve: gentle pulls stay gentle, full pulls reach 1.
 * @param {number} ratio - Pull ratio; values outside 0..1 are clamped.
 * @returns {number} Shot strength in 0..1.
 * @example shotStrength(1) // => 1
 * @example shotStrength(0) // => 0
 */
export const shotStrength = (ratio) => clamp(ratio, 0, 1) ** PULL.curve;

/**
 * True when a released pull is long enough to shoot. Tolerates 1e-9 of float noise:
 * an exact 5% pull computed from pixel coordinates can land at 0.04999999.
 * @param {number} ratio - Pull ratio at release.
 * @param {number} [min=0.05] - Minimum ratio that still shoots.
 * @returns {boolean} Whether the pull reaches the minimum.
 * @edge Exactly the minimum shoots; anything clearly below does not.
 * @example reachesMinPull(0.05) // => true
 * @example reachesMinPull(0.049) // => false
 */
export const reachesMinPull = (ratio, min = PULL.min) => ratio >= min - 1e-9;
