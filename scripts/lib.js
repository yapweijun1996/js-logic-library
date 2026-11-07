// Shared reader: turns modules/**/<name>.js (+ test) into index records. Source of truth is the module files.
import { readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
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


// Parses the JSDoc block above each export into a machine-readable contract.
function parseContract(source) {
  const lines = source.split("\n"), functions = [], constants = [];
  for (let i = 0; i < lines.length; i++) {
    const fn = lines[i].match(/^export const (\w+) = (?:\(([^)]*)\)|(\w+)) =>/) ?? lines[i].match(/^export function (\w+)\(([^)]*)\)/);
    const konst = !fn && lines[i].match(/^export const (\w+) =/);
    if (!fn && !konst) continue;
    let j = i - 1;
    while (j >= 0 && !lines[j].trim().endsWith("*/") && lines[j].trim() === "") j--;
    const doc = [];
    if (j >= 0 && lines[j].trim().endsWith("*/")) {
      while (j >= 0) { doc.unshift(lines[j]); if (lines[j].trim().startsWith("/**")) break; j--; }
    }
    const text = doc.map((l) => l.trim().replace(/^\/\*\*?|\*\/$/g, "").replace(/^\* ?/, "")).filter((l, k, a) => !(l === "" && (k === 0 || k === a.length - 1)));
    const entry = { name: (fn ?? konst)[1], description: "", params: [], returns: null, throws: [], edge: [], examples: [] };
    for (const l of text) {
      let m;
      if ((m = l.match(/^@param \{([^}]+)\} (\[)?([\w.]+)(?:=[^\]]*)?\]? - (.*)$/))) entry.params.push({ name: m[3], type: m[1], optional: !!m[2], description: m[4] });
      else if ((m = l.match(/^@returns? \{([^}]+)\} (.*)$/))) entry.returns = { type: m[1], description: m[2] };
      else if ((m = l.match(/^@throws \{([^}]+)\} (.*)$/))) entry.throws.push({ type: m[1], description: m[2] });
      else if ((m = l.match(/^@edge (.*)$/))) entry.edge.push(m[1]);
      else if ((m = l.match(/^@example (.*)$/))) entry.examples.push(m[1]);
      else if (!l.startsWith("@")) entry.description += (entry.description ? " " : "") + l;
    }
    if (fn) {
      const raw = (fn[2] ?? fn[3] ?? "").split(",").map((p) => p.trim()).filter(Boolean);
      entry.signature = `${entry.name}(${raw.join(", ")})`;
      entry.paramNames = raw.map((p) => p.split("=")[0].trim());
      functions.push(entry);
    } else constants.push(entry);
  }
  return { functions, constants };
}

async function readExamples() {
  const out = [];
  for (const f of (await readdir("examples/node").catch(() => [])).sort()) {
    if (f.endsWith(".mjs")) out.push({ path: `examples/node/${f}`, source: await readFile(`examples/node/${f}`, "utf8") });
  }
  return out;
}

export async function readModules() {
  const examples = await readExamples();
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
    const status = header.find((l) => l.startsWith("Status: "))?.slice(8) ?? "stable";
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
      summary: header[0] ?? "", version: field("Version"), provenance: field("Source"), license: field("License"), status, hash: createHash("sha256").update(source + "\0" + test).digest("hex").slice(0, 12),
      notes: header.slice(1).filter((l) => !/^(Version|Source|License|Status): /.test(l)).join("\n"),
      exports: [...source.matchAll(/^export (?:const|function) (\w+)/gm)].map((m) => m[1]),
      examples: examples.filter((e) => e.source.includes(`modules/${id}.js`)), ...parseContract(source), dependencies, external, source, test,
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
