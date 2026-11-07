import test from "node:test";
import assert from "node:assert/strict";
import { postContact } from "./post-contact.js";

test("head-on sends the object ball straight and leaves no cue tangent", () => {
  const balls = [{ id: 0, x: 0, z: 0 }, { id: 3, x: 1, z: 0 }];
  const r = postContact(balls, 0, { kind: "ball", id: 3, x: 1 - 0.0571, z: 0 });
  assert.ok(Math.abs(r.object.x - 1) < 1e-9 && Math.abs(r.object.z) < 1e-9);
  assert.equal(r.cue, null);
  assert.equal(postContact(balls, 0, { kind: "cushion" }), null);
});
test("cut shot splits object and cue directions at right angles", () => {
  const balls = [{ id: 0, x: 0, z: 0 }, { id: 3, x: 1, z: 0.03 }];
  const r = postContact(balls, 0, { kind: "ball", id: 3, x: 0.95, z: 0 });
  assert.ok(Math.abs(r.object.x * r.cue.x + r.object.z * r.cue.z) < 1e-9);
  assert.ok(r.cue.scale > 0);
});
test("unknown ball id returns null", () => {
  assert.equal(postContact([{ id: 0, x: 0, z: 0 }], 0, { kind: "ball", id: 9, x: 1, z: 0 }), null);
});
