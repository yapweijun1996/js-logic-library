// Shared reader: turns modules/**/<name>.js (+ test) into index records. Source of truth is the module files.
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, posix } from "node:path";

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.name.endsWith(".js") && !e.name.endsWith(".test.js")) out.push(p);
  }
  return out.sort();
}

export async function readModules() {
  const files = await walk("modules");
  const known = new Set(files.map((f) => f.split("\\").join("/")));
  const modules = [];
  for (const file of files) {
    const path = file.split("\\").join("/");
    const id = path.replace(/^modules\//, "").replace(/\.js$/, "");
    const source = await readFile(path, "utf8");
    const testPath = path.replace(/\.js$/, ".test.js");
    const test = await readFile(testPath, "utf8").catch(() => "");
    const header = [];
    for (const line of source.split("\n")) {
      if (!line.startsWith("//")) break;
      header.push(line.replace(/^\/\/ ?/, ""));
    }
    const field = (name) => header.find((l) => l.startsWith(`${name}: `))?.slice(name.length + 2) ?? "";
    const imports = [...source.matchAll(/^import .* from "(.+)";?$/gm)].map((m) => m[1]);
    const dependencies = [], external = [];
    for (const spec of imports) {
      if (!spec.startsWith(".")) { external.push(spec); continue; }
      const target = posix.normalize(posix.join(dirname(path), spec));
      if (known.has(target)) dependencies.push(target.replace(/^modules\//, "").replace(/\.js$/, ""));
      else external.push(spec);
    }
    modules.push({
      id, category: id.split("/")[0], path, testPath: test ? testPath : null,
      summary: header[0] ?? "", version: field("Version"), provenance: field("Source"),
      notes: header.slice(1).filter((l) => !/^(Version|Source): /.test(l)).join("\n"),
      exports: [...source.matchAll(/^export (?:const|function) (\w+)/gm)].map((m) => m[1]),
      dependencies, external, source, test,
    });
  }
  return modules;
}

// Module plus everything it imports, transitively, dependencies first.
export function withDependencies(modules, id, seen = new Set()) {
  const m = modules.find((x) => x.id === id);
  if (!m) throw new Error(`unknown module: ${id}`);
  if (seen.has(id)) return [];
  seen.add(id);
  return [...m.dependencies.flatMap((d) => withDependencies(modules, d, seen)), m];
}
