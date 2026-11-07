# Changelog

Per-module versions follow semver, stored in each module's `Version:` header line. Record every change that affects behaviour or the exported API. A breaking change bumps the major version and says what callers must change.

## 2026-11-07 (later)
- `interaction/pull-gesture` 1.1.0: `reachesMinPull` tolerance widened from 1e-9 to 1e-6. Browsers report pointer coordinates as float32, so an intended exact 5% pull can compute to 0.04999997 (real case: `pullRatio(313, 332.04998779296875, 381)`); 1e-9 wrongly cancelled it and failed the game's CI. Behaviour change: pulls within 1e-6 below the minimum now shoot. Callers needing the old strictness must pass a higher `min`.
- `interaction/aim` 1.0.0, `interaction/cue-hit` 1.0.0, `physics/post-contact` 1.0.0: extracted from the Eight-Ball game.
- Contract parser accepts nested braces in JSDoc types.

## 2026-11-07
- Contracts moved to JSDoc on every export (no behaviour change, versions unchanged); added `Status:` header field, recorded test results and trust labels, new explorer UI with sandboxed Playground, GitHub Pages deploy workflow.
- Repository licensed under Apache-2.0; every module header now carries `License: Apache-2.0` (no behaviour change, versions unchanged).
- `math/clamp` 1.0.0: initial.
- `interaction/pull-gesture` 1.0.0: initial, extracted from the Eight-Ball game. `reachesMinPull` tolerates 1e-9 of float noise at the minimum pull. Now depends on `math/clamp`.
