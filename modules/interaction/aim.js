// Aim angles for a cue ball on a table plane (x along the table, z across; angles in radians, atan2 convention).
// Version: 1.0.0
// Source: Blender-3D-Gallery Eight-Ball game (src/game/interaction.js).
// License: Apache-2.0

/**
 * Aim from the cue ball toward the pointer (dragging on the felt).
 * @param {{x: number, z: number}} cue - Cue ball centre.
 * @param {{x: number, z: number}} point - Pointer position on the table plane.
 * @param {number} previous - Angle to keep when the pointer sits on the cue ball.
 * @returns {number} Angle in radians from the cue ball to the pointer.
 * @edge A pointer within 1e-6 of the cue ball returns previous unchanged.
 * @example aimAngle({x: 0, z: 0}, {x: -1, z: 0}, 1) // => Math.PI
 * @example aimAngle({x: 0, z: 0}, {x: 0, z: 0}, 1) // => 1
 */
export function aimAngle(cue, point, previous) {
  return Math.hypot(point.x - cue.x, point.z - cue.z) > 1e-6 ? Math.atan2(point.z - cue.z, point.x - cue.x) : previous;
}

/**
 * Aim while dragging the cue butt itself: the butt follows the pointer, so the shot goes the opposite way.
 * @param {{x: number, z: number}} cue - Cue ball centre.
 * @param {{x: number, z: number}} point - Pointer position (the cue butt).
 * @param {number} previous - Angle to keep when the pointer sits on the cue ball.
 * @returns {number} Shot angle in radians, pointing from the pointer through the cue ball.
 * @edge A pointer within 1e-6 of the cue ball returns previous unchanged.
 * @example dragAngle({x: 0, z: 0}, {x: -1, z: 0}, 1) // => 0
 * @example dragAngle({x: 0, z: 0}, {x: 0, z: 0}, 1) // => 1
 */
export function dragAngle(cue, point, previous) {
  return Math.hypot(cue.x - point.x, cue.z - point.z) > 1e-6 ? Math.atan2(cue.z - point.z, cue.x - point.x) : previous;
}
