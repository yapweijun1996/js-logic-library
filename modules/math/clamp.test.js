import test from "node:test";
import assert from "node:assert/strict";
import { clamp } from "./clamp.js";

test("clamp limits to the range and keeps in-range values", () => {
  assert.equal(clamp(1.5, 0, 1), 1);
  assert.equal(clamp(-2, 0, 1), 0);
  assert.equal(clamp(0.25, 0, 1), 0.25);
  assert.equal(clamp(0, 0, 1), 0);
  assert.equal(clamp(1, 0, 1), 1);
});
