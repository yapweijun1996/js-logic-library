# Modules

Copy one file from `src/` (and its test from `tests/`) into your project. Every module is pure: no DOM, no globals, no dependencies.

| Module | Purpose | Exports | Depends on |
| --- | --- | --- | --- |
| `src/pull-gesture.js` | Pull-to-shoot drag math | `PULL`, `pullRatio`, `shotStrength`, `reachesMinPull` | none |

## Rules for a new module
1. Pure functions only; pass time, randomness and config in as arguments.
2. Header comment states purpose, units and coordinate system.
3. One test file per module that doubles as a usage example.
4. Add one row to the table above.
