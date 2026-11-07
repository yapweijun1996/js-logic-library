# js-logic-library

Small, dependency-free JavaScript logic modules written so an AI agent (or you) can copy a single file and use it without redesigning anything. See `docs/MODULES.md` for the list and the rules for adding one.

Run the explorer with `npm run dev`. Agents: read `AGENTS.md` first.

```bash
npm test
```

## Design: human + AI first

| Principle | Human developer | AI coding agent | Status |
| --- | --- | --- | --- |
| Discoverable | Browse and search in the explorer (`npm run dev`) | Read `docs/MODULES.md`, `site/llms.txt` or `site/modules.json` | Done |
| Understandable | Header comment, usage example in the test | Explicit Input/Output contract in the header comment | Done (contract is prose, not machine-checked) |
| Reusable | Import or copy one file | Copy `src/<name>.js`, its test, and any sibling listed under dependencies | Copy by hand or via "Copy for AI agent"; no automatic dependency copy yet |
| Testable | `npm test` | Run the copied `tests/<name>.test.mjs` | Done |
| Portable | Browser and Node.js | Any project or framework | Modules avoid DOM and Node APIs; only `pull-gesture` is verified, in Node |
| Maintainable | Git history | Compatibility and change detection | Not built yet: no per-module version or change check |
