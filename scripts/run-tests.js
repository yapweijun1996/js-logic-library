// Runs each module's test file and records per-test results in site/test-results.json.
// Each record carries the module hash it ran against, so the explorer can tell fresh results from stale ones.
import { run } from "node:test";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { readModules } from "./lib.js";

const modules = await readModules(), results = {};
let failed = 0;
for (const m of modules) {
  if (!m.testPath) continue;
  const tests = [];
  for await (const ev of run({ files: [resolve(m.testPath)] })) {
    if ((ev.type === "test:pass" || ev.type === "test:fail") && ev.data.nesting === 0 && ev.data.details?.type !== "suite")
      tests.push({ name: ev.data.name, ok: ev.type === "test:pass", ms: Math.round((ev.data.details?.duration_ms ?? 0) * 100) / 100 });
  }
  const bad = tests.filter((t) => !t.ok).length;
  failed += bad;
  results[m.id] = { hash: m.hash, passed: tests.length - bad, failed: bad, tests };
  console.log(`${bad ? "FAIL" : "ok  "} ${m.id}: ${tests.length - bad}/${tests.length}`);
}
await writeFile("site/test-results.json", JSON.stringify({ node: process.version, recordedAt: new Date().toISOString(), results }, null, 2) + "\n");
process.exit(failed ? 1 : 0);
