// Runnable example: node examples/node/pull-gesture.mjs
import assert from "node:assert/strict";
import { pullRatio, shotStrength, reachesMinPull } from "../../modules/interaction/pull-gesture.js";

const ratio = pullRatio(100, 150, 100); // dragged 50px along a 100px track
assert.equal(ratio, 0.5);
assert.equal(reachesMinPull(ratio), true);
console.log(`ratio ${ratio} -> strength ${shotStrength(ratio).toFixed(3)}`);
