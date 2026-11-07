# AGENTS.md — js-logic-library

Read this first if you are an AI agent. Goal: reuse existing logic instead of redesigning it.

## What this repo is
A library of small, pure, dependency-free JavaScript (ES modules) logic files. Each file in `src/` is designed to be copied alone into another project. There is no framework and no package to install.

## How to use it (do this, in order)
1. Read `docs/MODULES.md` (human table) or `site/llms.txt` (one line per module: purpose, exports, dependencies, path). Full source of every module is in `site/modules.json`.
2. Pick the module whose purpose matches your need. If one matches, use it as-is. Do not rewrite or "improve" it.
3. Copy `src/<name>.js` and `tests/<name>.test.mjs` into the target project. Keep the header comment (it states units and coordinate systems).
4. Run the copied test (`node --test`). It must pass in the new project before you build on it.
5. If nothing fits, add a new module here following the rules below, then copy it.

## Layout
- `src/*.js` — one module per file; pure functions only.
- `tests/<name>.test.mjs` — one test file per module; doubles as a usage example. Runner: `node --test`.
- `docs/MODULES.md` — human-readable module table (keep in sync when adding a module).
- `site/` — the explorer UI (`index.html`, `app.js`, `style.css`) and generated `modules.json`, `llms.txt`.
- `scripts/build-index.mjs` — regenerates `site/modules.json` and `site/llms.txt` from `src/` and `tests/`. Never edit those two files by hand.
- `scripts/serve.mjs` — local static server for the explorer.

## Commands
- `npm test` — run all module tests.
- `npm run build` — regenerate the index.
- `npm run dev` — build, then serve the explorer at http://127.0.0.1:5300/.

## Rules for a new module
1. Pure functions: no DOM, no `window`, no `Date.now()` or randomness inside; pass time, config and randomness as arguments.
2. No dependencies. Imports of sibling modules are allowed only if listed in the header.
3. The first comment lines of the file are its documentation and its Input/Output contract: line 1 is a one-line purpose; following lines state `Input:`, `Output:`, units, coordinate system and edge cases. The index builder reads these.
4. Export named functions/constants only.
5. Add `tests/<name>.test.mjs` covering normal cases and boundaries (zero, exact thresholds, float noise).
6. Add one row to `docs/MODULES.md`, run `npm run build`, run `npm test`.

## Do not
- Add npm dependencies or a bundler.
- Put UI or browser code in `src/`.
- Duplicate an existing module under another name.
- Push or open PRs unless the owner asks.

## Provenance
`pull-gesture` came from the Blender-3D-Gallery Eight-Ball game (`src/game/interaction.js`). The 1e-9 tolerance in `reachesMinPull` exists because an exact 5% pull computed from pixel coordinates can land at 0.04999999 and wrongly cancel the shot.

## Status of the design goals
Discoverable, understandable (prose contract), reusable by copy and testable are in place. Not built yet: automatic copying of dependencies, per-module version or change detection, and verification outside Node. Do not claim these exist.
