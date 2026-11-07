# AGENTS.md — js-logic-library

Reuse existing logic instead of redesigning it. Same files serve humans and agents; there is no agent-only copy.

## Use
1. Read `MODULES.md` (or `site/llms.txt`; full source in `site/modules.json`).
2. If a module matches, use it as-is. Do not rewrite or "improve" it.
3. `npm run copy -- <module-id> <dest-dir>` copies the module, its test and all dependencies, keeping relative layout. Example id: `interaction/pull-gesture`.
4. Run the copied tests in the destination. They must pass before you build on it.
5. Nothing fits? Add a module here (rules below), then copy it.

## Commands
- `npm test` — checks generated files are fresh, verifies every module's contract (JSDoc, executed `@example`s, purity rules), runs examples, runs unit tests.
- `npm run build` — regenerate `MODULES.md` and `site/*`, and record per-test results in `site/test-results.json` (not committed).
- `npm run dev` — build and serve the explorer at http://127.0.0.1:5300/.

## New module rules
1. Path `modules/<category>/<name>.js` with `modules/<category>/<name>.test.js` beside it.
2. Header comment lines: purpose; units and notes; `Version: x.y.z`; `Source: ...`; `License: Apache-2.0`. Keep the license line when copying a module.
3. Every export has a JSDoc block: description, `@param {type} name - text` for each parameter in signature order, `@returns {type} text`, `@edge text` lines, and at least one `@example call(...) // => result` (functions). Examples are executed by `npm test`. Named exports only; pure functions; time, randomness and state come in as arguments.
4. Depend only on other library modules, via relative imports (that is the declaration).
5. Tests cover normal cases and boundaries (zero, exact thresholds, float noise).
6. Add an entry to `CHANGELOG.md`; bump `Version:` on any behaviour or API change, major on breaking change.
7. Run `npm run build` then `npm test`. Never hand-edit `MODULES.md` or `site/modules.json`/`llms.txt`.

## Do not
- Add npm dependencies or a bundler; put UI/browser code in `modules/`; duplicate a module under another name; push or open PRs unless the owner asks.
- Claim features that are not built (see Status in `README.md`).

## Trust labels
`Verified` = recorded test run matches the current code and passed. `Tested` = test file only or stale record. Do not describe a module as verified from the existence of a test file.
