# Changelog

Per-module versions follow semver, stored in each module's `Version:` header line. Record every change that affects behaviour or the exported API. A breaking change bumps the major version and says what callers must change.

## 2026-11-07
- Repository licensed under Apache-2.0; every module header now carries `License: Apache-2.0` (no behaviour change, versions unchanged).
- `math/clamp` 1.0.0: initial.
- `interaction/pull-gesture` 1.0.0: initial, extracted from the Eight-Ball game. `reachesMinPull` tolerates 1e-9 of float noise at the minimum pull. Now depends on `math/clamp`.
