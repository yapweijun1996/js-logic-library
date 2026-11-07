import test from "node:test";
import assert from "node:assert/strict";
import { pullRatio, shotStrength, reachesMinPull } from "./pull-gesture.js";

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
test("reachesMinPull accepts an exact 5% despite float32 pointer coordinates, rejects weak pulls", () => {
  assert.equal(reachesMinPull(0.05), true);
  // Real pointer data that broke the game's CI: float32 coordinate, 381px track.
  const actual = pullRatio(313, 332.04998779296875, 381);
  assert.ok(actual < 0.05);
  assert.equal(reachesMinPull(actual), true);
  assert.equal(reachesMinPull(0.049), false);
  assert.equal(reachesMinPull(0.04), false);
  assert.equal(reachesMinPull(0), false);
});
