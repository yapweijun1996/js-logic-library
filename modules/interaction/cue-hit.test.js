import test from "node:test";
import assert from "node:assert/strict";
import { hitsCue } from "./cue-hit.js";

test("cue hit test covers the shaft behind the ball only", () => {
  const c = { x: 0, z: 0 }, r = 0.02857;
  assert.ok(hitsCue(c, 0, { x: -0.5, z: 0 }, r));
  assert.ok(hitsCue(c, 0, { x: -1.2, z: 0.03 }, r));
  assert.ok(!hitsCue(c, 0, { x: 0.5, z: 0 }, r));
  assert.ok(!hitsCue(c, 0, { x: -0.5, z: 0.2 }, r));
  assert.ok(!hitsCue(c, 0, { x: -2, z: 0 }, r));
});
test("a pulled-back cue moves the grab window with it", () => {
  const c = { x: 0, z: 0 }, r = 0.02857;
  assert.ok(!hitsCue(c, 0, { x: -0.04, z: 0 }, r, 0.12));
  assert.ok(hitsCue(c, 0, { x: -0.2, z: 0 }, r, 0.12));
});
