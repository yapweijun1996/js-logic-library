// First-contact aftermath estimate for equal-mass balls (plane coordinates: x, z).
// Frictionless model: ignores spin, friction and any later collision, so it is a guide, not a simulation.
// Version: 1.0.0
// Source: Blender-3D-Gallery Eight-Ball game (src/game/presentation.js).
// License: Apache-2.0

/**
 * Directions the object ball and the cue ball leave in after the cue ball first touches a ball.
 * @param {Array<{id: number, x: number, z: number}>} balls - Ball positions.
 * @param {number} angle - Shot angle of the cue ball in radians.
 * @param {{kind: string, id?: number, x: number, z: number}} contact - First contact; x, z is the cue ball centre at contact.
 * @returns {Object|null} { object: {x, z, scale}, cue: {x, z, scale} | null }: unit directions with a 0..1 scale (share of the shot's speed); null when there is no ball contact.
 * @edge A contact that is not a ball (cushion, pocket) returns null.
 * @edge A head-on hit leaves the cue ball with no tangent: cue is null.
 * @edge An unknown ball id, or a contact centred on the ball, returns null.
 * @example postContact([{id: 0, x: 0, z: 0}, {id: 3, x: 1, z: 0}], 0, {kind: "ball", id: 3, x: 0.9429, z: 0}) // => {object: {x: 1, z: 0, scale: 1}, cue: null}
 * @example postContact([{id: 0, x: 0, z: 0}], 0, {kind: "cushion", x: 1, z: 0}) // => null
 */
export function postContact(balls, angle, contact) {
  if (contact.kind !== "ball") return null;
  const target = balls.find((b) => b.id === contact.id);
  if (!target) return null;
  const dx = Math.cos(angle), dz = Math.sin(angle), nx = target.x - contact.x, nz = target.z - contact.z;
  const length = Math.hypot(nx, nz);
  if (length < 1e-9) return null;
  const ux = nx / length, uz = nz / length, dot = dx * ux + dz * uz;
  const tx = dx - dot * ux, tz = dz - dot * uz, tangent = Math.hypot(tx, tz);
  return {
    object: { x: ux, z: uz, scale: Math.max(0, dot) },
    cue: tangent > 1e-6 ? { x: tx / tangent, z: tz / tangent, scale: tangent } : null,
  };
}
