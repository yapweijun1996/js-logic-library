import test from "node:test";
import assert from "node:assert/strict";
import { aimAngle, dragAngle } from "./aim.js";

test("aim points from the cue ball toward the pointer and keeps the angle at zero length", () => {
  assert.equal(aimAngle({ x: 0, z: 0 }, { x: -1, z: 0 }, 1), Math.PI);
  assert.equal(aimAngle({ x: 0, z: 0 }, { x: 0, z: 1 }, 1), Math.PI / 2);
  assert.equal(aimAngle({ x: 0, z: 0 }, { x: 0, z: 0 }, 1), 1);
});
test("dragging the cue butt aims away from the pointer", () => {
  assert.equal(dragAngle({ x: 0, z: 0 }, { x: -1, z: 0 }, 1), 0);
  assert.equal(dragAngle({ x: 0, z: 0 }, { x: 0, z: -1 }, 1), Math.PI / 2);
  assert.equal(dragAngle({ x: 0, z: 0 }, { x: 0, z: 0 }, 1), 1);
});
