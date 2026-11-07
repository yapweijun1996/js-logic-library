# js-logic-library

Universal JavaScript logic library: small pure-function modules with one source, one set of docs and one set of tests. Humans, AI agents and CI all read and run the same files; AI agents are one kind of user, not a separate product.

| | Human | AI agent |
| --- | --- | --- |
| Flow | Search → Read → Copy → Test → Use | Discover → Match → Copy → Verify → Integrate |
| Entry | Explorer (`npm run dev`), this README, the tests | `AGENTS.md`, `MODULES.md`, `site/llms.txt` |

## Use a module
```bash
npm run copy -- interaction/pull-gesture ../my-app/logic   # module + test + every dependency
```
Or `import` it directly from `modules/`. Copy the folder layout as is, because dependencies are relative imports.

## Layout
```
modules/<category>/<name>.js         code + header docs (purpose, Version, Source, License) + JSDoc contract per export
modules/<category>/<name>.test.js    its tests
examples/node/                       runnable examples (executed by npm test)
scripts/                             build-index, run-tests, verify-modules, copy-module, serve
.github/workflows/deploy.yml         test, build and deploy the explorer to GitHub Pages
MODULES.md, site/*                   generated from modules/, never hand-edited
```

## Rules
- **One source of truth.** Each piece of logic has one authoritative implementation. Indexes, the explorer and prompts are generated from `modules/`; `npm test` fails if they are stale.
- **Contracts are JSDoc.** Each export has `@param`, `@returns`, `@edge` and `@example` lines in the source. The API table, the Playground inputs and the AI Agent tab are generated from them; `npm test` fails if a signature and its `@param` list disagree, and it executes every `@example` and compares the result.
- **Trust comes from evidence.** `Verified` means a recorded test run exists for exactly the current code and all tests passed. `Tested` means a test file exists but no fresh passing record. `Failing` and `Deprecated` (`Status: deprecated` in the header) are shown as such. Results are recorded at build time, not in your browser.
- **Pure by default.** Pass time, randomness and state in as arguments. Verified by `npm test`.
- **Dependencies allowed, never hidden.** A module may import other library modules; the import is the declaration, shown in `MODULES.md`, and `npm run copy` brings them along. Imports from outside the library are rejected for now.
- **Copy or import.** No npm package yet; publish only when there is a need.
- **Versioned contracts.** Every module has a `Version:`; `CHANGELOG.md` records changes and breaking changes.
- **Executable examples.** Examples in `examples/` run as part of `npm test`.
- **Provenance and license.** Every module states its `Source:` and `License: Apache-2.0` in its own header, so a single copied file stays legally clear. Apache-2.0 requires keeping the license notice when redistributing; the header line and `LICENSE` serve that purpose.

## Explorer and deployment
`npm run dev` serves the explorer locally. It has a category sidebar, search, a module list and a workspace with Overview, Code, Playground, Tests, Examples and AI Agent tabs; desktop is three columns, tablet two, phone one with a back button. The Playground runs a function in a sandboxed iframe (no access to the page or its storage, 2 second limit, inputs are data only).

`.github/workflows/deploy.yml` runs `npm test` and `npm run build` on every push to `main` and publishes `site/` to GitHub Pages. One-time setup by the owner: repository Settings → Pages → Source: GitHub Actions.

## Status
Done: explorer with trust states and sandboxed Playground, generated indexes, JSDoc contracts with executed examples, dependency-aware copy, contract check, recorded test results, runnable Node example, Pages workflow (written; first run pending).

Not done: React and vanilla-JS examples, automatic breaking-change detection (a version bump is not enforced when code changes), browser-side verification of the modules, Playground does not stop a module that loops forever beyond discarding the sandbox after 2 seconds.

**License:** Apache-2.0 (see `LICENSE`).
