// Contract check for every module. Run by `npm test` before the unit tests.
import { readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { deepStrictEqual } from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
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
// Every export is documented, and every @example is executed and must produce its stated result.
for (const m of modules) {
  const mod = await import(pathToFileURL(resolve(m.path)).href);
  if (!["stable", "deprecated"].includes(m.status)) errors.push(`${m.id}: Status must be stable or deprecated`);
  for (const f of m.functions) {
    if (!f.description) errors.push(`${m.id}.${f.name}: missing JSDoc description`);
    if (f.params.map((p) => p.name).join() !== f.paramNames.join()) errors.push(`${m.id}.${f.name}: @param list must match the signature (${f.paramNames.join(", ")})`);
    if (!f.returns) errors.push(`${m.id}.${f.name}: missing @returns`);
    if (!f.examples.length) errors.push(`${m.id}.${f.name}: needs at least one @example`);
    for (const ex of f.examples) {
      const [expr, expected] = ex.split(" // => ");
      if (expected === undefined) { errors.push(`${m.id}.${f.name}: @example must look like "call(...) // => result"`); continue; }
      try {
        const run = (code) => new Function(...Object.keys(mod), `return (${code});`)(...Object.values(mod));
        deepStrictEqual(run(expr), run(expected));
      } catch (e) { errors.push(`${m.id}.${f.name}: @example failed: ${ex} (${e.message.split("\n")[0]})`); }
    }
  }
  for (const c of m.constants) if (!c.description) errors.push(`${m.id}.${c.name}: missing JSDoc description`);
}
// Executable examples must run.
for (const f of await readdir("examples/node").catch(() => [])) {
  if (!f.endsWith(".mjs")) continue;
  try { execFileSync(process.execPath, [`examples/node/${f}`], { stdio: "pipe" }); }
  catch (e) { errors.push(`example examples/node/${f} failed: ${e.stderr?.toString().split("\n")[0] ?? e.message}`); }
}
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`verified ${modules.length} module(s) and examples`);
