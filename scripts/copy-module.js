// Copy a module, its test and every module it imports into another folder, keeping relative layout.
// Usage: node scripts/copy-module.js <module-id> <dest-dir>   e.g. interaction/pull-gesture ../my-app/logic
import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { readModules, withDependencies } from "./lib.js";

const [id, dest] = process.argv.slice(2);
if (!id || !dest) { console.error("usage: copy-module <module-id> <dest-dir>"); process.exit(2); }
const modules = await readModules();
const set = withDependencies(modules, id);
const external = set.flatMap((m) => m.external);
if (external.length) console.warn(`note: also needs external imports: ${[...new Set(external)].join(", ")}`);
for (const m of set) {
  for (const file of [m.path, m.testPath].filter(Boolean)) {
    const target = join(dest, file.replace(/^modules\//, ""));
    await mkdir(dirname(target), { recursive: true });
    await copyFile(file, target);
    console.log(`copied ${target}`);
  }
}
