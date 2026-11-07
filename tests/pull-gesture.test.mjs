import test from "node:test";
import assert from "node:assert/strict";
import { pullRatio, shotStrength, reachesMinPull } from "../src/pull-gesture.js";

test("pullRatio clamps to 0..1 and handles a zero-length track", () => {
  assert.equal(pullRatio(100, 150, 100), 0.5);
  assert.equal(pullRatio(100, 50, 100), 0);
  assert.equal(pullRatio(100, 900, 100), 1);
  assert.equal(pullRatio(100, 150, 0), 0);
});
test("shotStrength is monotonic and reaches 1", () => {
  assert.equal(shotStrength(0), 0);
  assert.equal(shotStrength(1), 1);
  assert.ok(shotStrength(0.5) < 0.5);
});
test("reachesMinPull accepts exact 5% despite float noise, rejects less", () => {
  assert.equal(reachesMinPull(0.05), true);
  assert.equal(reachesMinPull(0.05 - 1e-12), true);
  assert.equal(reachesMinPull(0.049), false);
  assert.equal(reachesMinPull(0), false);
  for (let d = 100; d < 600; d++) assert.equal(reachesMinPull(((123.5 + d * 0.05) - 123.5) / d), true);
});
