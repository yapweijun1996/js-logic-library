// Builds the explorer data: site/modules.json (humans + agents) and site/llms.txt (agents).
// Source of truth is src/*.js and tests/*.test.mjs; nothing is written by hand.
import { readdir, readFile, writeFile } from "node:fs/promises";

const names = (await readdir("src")).filter((f) => f.endsWith(".js")).sort();
const modules = [];
for (const file of names) {
  const id = file.replace(/\.js$/, "");
  const source = await readFile(`src/${file}`, "utf8");
  const test = await readFile(`tests/${id}.test.mjs`, "utf8").catch(() => "");
  const header = [];
  for (const line of source.split("\n")) {
    if (!line.startsWith("//")) break;
    header.push(line.replace(/^\/\/ ?/, ""));
  }
  const exports = [...source.matchAll(/^export (?:const|function) (\w+)/gm)].map((m) => m[1]);
  const imports = [...source.matchAll(/^import .* from "(.+)"/gm)].map((m) => m[1]);
  modules.push({
    id, path: `src/${file}`, testPath: test ? `tests/${id}.test.mjs` : null,
    summary: header[0] ?? "", notes: header.slice(1).join("\n"), exports, dependencies: imports, source, test,
  });
}
await writeFile("site/modules.json", JSON.stringify({ generated: new Date().toISOString(), modules }, null, 2));
const txt = [
  "# js-logic-library",
  "Pure, dependency-free JS modules. Copy one file from src/ (plus its test) and use it; do not redesign.",
  "Machine-readable index with full source: modules.json",
  "",
  ...modules.map((m) => `- ${m.id}: ${m.summary} | exports: ${m.exports.join(", ")} | deps: ${m.dependencies.join(", ") || "none"} | file: ${m.path}`),
  "",
].join("\n");
await writeFile("site/llms.txt", txt);
console.log(`indexed ${modules.length} module(s)`);
