// Hit test for grabbing a cue shaft that lies behind the cue ball (x along the table, z across; metres).
// Version: 1.0.0
// Source: Blender-3D-Gallery Eight-Ball game (src/game/interaction.js).
// License: Apache-2.0

/** Cue geometry in metres: shaft length 1.47 and the grab radius around the shaft (0.05). */
export const CUE = Object.freeze({ length: 1.47, grabRadius: 0.05 });

/**
 * True when a point lies on the visible cue shaft behind the cue ball.
 * @param {{x: number, z: number}} cue - Cue ball centre.
 * @param {number} angle - Shot angle in radians; the shaft extends opposite to it.
 * @param {{x: number, z: number}} point - Point to test (pointer on the table plane).
 * @param {number} radius - Cue ball radius; the shaft starts one radius behind the centre.
 * @param {number} [pullOffset=0] - How far the cue is currently pulled back.
 * @param {number} [grab=0.05] - Tolerance around the shaft.
 * @returns {boolean} Whether the point can grab the cue.
 * @edge Points in front of the ball, beyond the shaft length, or farther than grab from its line return false.
 * @example hitsCue({x: 0, z: 0}, 0, {x: -0.5, z: 0}, 0.02857) // => true
 * @example hitsCue({x: 0, z: 0}, 0, {x: 0.5, z: 0}, 0.02857) // => false
 */
export function hitsCue(cue, angle, point, radius, pullOffset = 0, grab = CUE.grabRadius) {
  const dx = Math.cos(angle), dz = Math.sin(angle), start = radius + pullOffset;
  const along = -((point.x - cue.x) * dx + (point.z - cue.z) * dz);
  const across = Math.abs((point.x - cue.x) * -dz + (point.z - cue.z) * dx);
  return along >= start - grab && along <= start + CUE.length && across <= grab;
}
