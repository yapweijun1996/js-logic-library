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
modules/<category>/<name>.js         code + header docs (purpose, Input/Output, Version, Source)
modules/<category>/<name>.test.js    its tests
examples/node/                       runnable examples (executed by npm test)
scripts/                             build-index, verify-modules, copy-module
MODULES.md, site/*                   generated from modules/, never hand-edited
```

## Rules
- **One source of truth.** Each piece of logic has one authoritative implementation. Indexes, the explorer and prompts are generated from `modules/`; `npm test` fails if they are stale.
- **Pure by default.** Pass time, randomness and state in as arguments. Verified by `npm test`.
- **Dependencies allowed, never hidden.** A module may import other library modules; the import is the declaration, shown in `MODULES.md`, and `npm run copy` brings them along. Imports from outside the library are rejected for now.
- **Copy or import.** No npm package yet; publish only when there is a need.
- **Versioned contracts.** Every module has a `Version:`; `CHANGELOG.md` records changes and breaking changes.
- **Executable examples.** Examples in `examples/` run as part of `npm test`.
- **Provenance.** Every module states its `Source:`.

## Status
Done: explorer, generated indexes, dependency-aware copy, contract check, runnable Node example. Not done: React and vanilla-JS examples, a license (owner decision, see below), automatic breaking-change detection, browser verification.

**License: undecided.** No license file exists yet, so others have no legal right to reuse this code. Choose one (for example MIT) before publishing.
