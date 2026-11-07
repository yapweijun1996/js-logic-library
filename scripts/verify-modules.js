// Contract check for every module. Run by `npm test` before the unit tests.
import { readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { readModules } from "./lib.js";

const modules = await readModules(), errors = [];
for (const m of modules) {
  if (!m.summary) errors.push(`${m.id}: first header line must be a one-line purpose`);
  if (!/^\d+\.\d+\.\d+$/.test(m.version)) errors.push(`${m.id}: header needs "Version: x.y.z"`);
  if (!m.provenance) errors.push(`${m.id}: header needs "Source: ..." (provenance)`);
  if (m.license !== "Apache-2.0") errors.push(`${m.id}: header needs "License: Apache-2.0"`);
  if (!m.testPath) errors.push(`${m.id}: missing ${m.path.replace(/\.js$/, ".test.js")}`);
  if (!m.exports.length) errors.push(`${m.id}: no named exports`);
  if (m.external.length) errors.push(`${m.id}: imports outside the library (${m.external.join(", ")}); declare it deliberately before allowing`);
  if (/\b(document|window|localStorage)\b|Date\.now\(\)|Math\.random\(\)/.test(m.source.replace(/\/\/.*$/gm, "")))
    errors.push(`${m.id}: touches DOM/global state, time or randomness; pass them in as arguments`);
}
// Executable examples must run.
for (const f of await readdir("examples/node").catch(() => [])) {
  if (!f.endsWith(".mjs")) continue;
  try { execFileSync(process.execPath, [`examples/node/${f}`], { stdio: "pipe" }); }
  catch (e) { errors.push(`example examples/node/${f} failed: ${e.stderr?.toString().split("\n")[0] ?? e.message}`); }
}
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`verified ${modules.length} module(s) and examples`);
