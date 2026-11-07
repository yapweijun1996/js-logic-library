// Explorer UI. Everything shown comes from modules.json (derived from modules/) and test-results.json.
// All module-provided text is rendered with textContent, never as HTML.
const $ = (s) => document.querySelector(s);
const el = (tag, props = {}, ...kids) => {
  const n = Object.assign(document.createElement(tag), props);
  n.append(...kids.flat().filter((k) => k != null));
  return n;
};
const TABS = ["Overview", "Code", "Playground", "Tests", "Examples", "AI Agent"];

const index = await fetch("modules.json").then((r) => (r.ok ? r.json() : null)).catch(() => null);
if (!index) { $("#detail").replaceChildren(el("p", { className: "empty" }, "Could not load modules.json. Run `npm run build`.")); throw new Error("no index"); }
const recorded = await fetch("test-results.json").then((r) => (r.ok ? r.json() : null)).catch(() => null);
const modules = index.modules;
let current = null, tab = "Overview", category = "", fnName = null;

// Trust is derived from evidence, never from the mere existence of a test file.
function trust(m) {
  if (m.status === "deprecated") return { label: "Deprecated", why: "Marked Status: deprecated in the module header." };
  if (!m.testPath) return { label: "Untested", why: "No test file." };
  const r = recorded?.results?.[m.id];
  if (!r) return { label: "Tested", why: "Test file exists, but no recorded run is available." };
  if (r.hash !== m.hash) return { label: "Tested", why: "Recorded results are for different code (stale); rebuild to refresh." };
  if (r.failed) return { label: "Failing", why: `${r.failed} recorded test(s) failed.` };
  if (!r.passed) return { label: "Tested", why: "Recorded run found no passing tests." };
  return { label: "Verified", why: `All ${r.passed} tests passed in a recorded run on ${recorded.node} (${recorded.recordedAt}); results match the current code.` };
}
const badge = (m) => { const t = trust(m); return el("span", { className: `badge ${t.label.toLowerCase()}`, title: t.why }, t.label); };

function toast(msg) { const t = el("div", { className: "toast", role: "status" }, msg); document.body.append(t); setTimeout(() => t.remove(), 1700); }
async function copy(text, label) {
  try { await navigator.clipboard.writeText(text); toast(`Copied ${label}`); }
  catch { toast("Copy blocked by the browser; select the text and copy manually"); }
}
function withDeps(m, seen = new Set()) {
  if (seen.has(m.id)) return [];
  seen.add(m.id);
  return [...m.dependencies.flatMap((d) => withDeps(modules.find((x) => x.id === d), seen)), m];
}
const contract = (m) => ({
  id: m.id, version: m.version, status: m.status, trust: trust(m).label, license: m.license, source: m.provenance,
  files: withDeps(m).flatMap((x) => [x.path, x.testPath].filter(Boolean)), dependencies: m.dependencies,
  copy: `npm run copy -- ${m.id} <dest-dir>`, verify: "npm test",
  functions: m.functions.map(({ name, signature, description, params, returns, throws, edge, examples }) => ({ name, signature, description, params, returns, throws, edge, examples })),
  constants: m.constants.map(({ name, description }) => ({ name, description })),
});
function agentPrompt(m) {
  return `Use these modules as-is; do not redesign them. Copy each file with its test (keep the relative layout and header comments), run the tests, then call ${m.id}.\n` +
    `Contract:\n${JSON.stringify(contract(m), null, 2)}\n\n` +
    withDeps(m).map((x) => `--- ${x.path} ---\n${x.source}\n--- ${x.testPath ?? "no test"} ---\n${x.test}`).join("\n");
}

// ---- registry (left + middle) ----
function filtered() {
  const q = $("#q").value.trim().toLowerCase();
  return modules.filter((m) =>
    (!category || m.category === category) &&
    (!$("#f-verified").checked || trust(m).label === "Verified") &&
    (!$("#f-nodeps").checked || !m.dependencies.length) &&
    (!q || [m.id, m.summary, ...m.exports].join(" ").toLowerCase().includes(q)));
}
function renderRegistry() {
  const cats = [...new Set(modules.map((m) => m.category))].sort();
  const btn = (label, value, n) => el("li", {}, el("button", { type: "button", ariaPressed: String(category === value), onclick: () => { category = value; document.body.dataset.view = "list"; renderRegistry(); } }, label, el("span", {}, String(n))));
  $("#cats").replaceChildren(btn("All modules", "", modules.length), ...cats.map((c) => btn(c, c, modules.filter((m) => m.category === c).length)));
  const shown = filtered();
  $("#count").textContent = `${shown.length} of ${modules.length} modules`;
  $("#list").replaceChildren(...shown.map((m) => el("li", {}, el("button", { type: "button", ariaCurrent: String(m.id === current?.id), onclick: () => select(m.id) },
    el("span", { className: "row" }, el("b", {}, m.id.split("/")[1]), badge(m)),
    el("small", {}, `${m.category} / ${m.path.split("/").pop()} · v${m.version}`),
    el("span", {}, m.summary)))));
  if (!shown.length) $("#list").append(el("li", { className: "empty" }, "No match. Try another word or clear the filters."));
}
function select(id) {
  current = modules.find((m) => m.id === id) ?? null;
  tab = "Overview"; fnName = current?.functions[0]?.name ?? null;
  if (current) { history.replaceState(null, "", `#${current.id}`); document.body.dataset.view = "detail"; }
  renderRegistry(); renderDetail();
}

// ---- workspace (right) ----
const table = (head, rows) => el("table", {}, el("thead", {}, el("tr", {}, ...head.map((h) => el("th", {}, h)))), el("tbody", {}, ...rows.map((r) => el("tr", {}, ...r.map((c) => el("td", {}, c))))));
const code = (t) => el("code", {}, t);

function overviewTab(m) {
  const out = [];
  if (m.notes) out.push(el("div", { className: "card" }, el("p", {}, m.notes)));
  for (const f of m.functions) {
    out.push(el("div", { className: "card" },
      el("h3", {}, code(f.signature)),
      el("p", {}, f.description),
      f.params.length ? table(["Name", "Type", "Description"], f.params.map((p) => [code(p.name + (p.optional ? "?" : "")), code(p.type), p.description])) : null,
      f.returns ? el("p", { className: "note" }, "Returns ", code(f.returns.type), `: ${f.returns.description}`) : null,
      f.edge.length || f.throws.length ? el("ul", { className: "plain" }, ...f.edge.map((e) => el("li", {}, e)), ...f.throws.map((t) => el("li", {}, `Throws ${t.type}: ${t.description}`))) : null,
      f.examples.length ? el("pre", {}, f.examples.join("\n")) : null));
  }
  for (const c of m.constants) out.push(el("div", { className: "card" }, el("h3", {}, code(c.name)), el("p", {}, c.description)));
  return out;
}
function codeTab(m) {
  return [el("p", { className: "note" }, `${m.path} · ${m.source.split("\n").length} lines · Dependencies: ${m.dependencies.join(", ") || "none"}`),
    el("div", { className: "actions" }, el("button", { type: "button", className: "act", onclick: () => copy(m.source, m.path) }, "Copy file")),
    el("pre", {}, code(m.source))];
}
function testsTab(m) {
  const t = trust(m), r = recorded?.results?.[m.id];
  return [el("div", { className: "card" }, el("h3", {}, "Trust: ", badge(m)), el("p", {}, t.why),
      el("p", { className: "note" }, "Results are recorded when the site is built; they are not executed in your browser.")),
    r && r.hash === m.hash ? el("div", { className: "card" }, el("h3", {}, `${r.passed}/${r.passed + r.failed} passed`),
      table(["Test", "Result", "ms"], r.tests.map((x) => [x.name, el("span", { className: x.ok ? "pass" : "fail" }, x.ok ? "pass" : "fail"), String(x.ms)]))) : null,
    m.testPath ? el("pre", {}, code(m.test)) : el("p", { className: "empty" }, "No test file.")];
}
function examplesTab(m) {
  const out = [];
  for (const f of m.functions) if (f.examples.length) out.push(el("div", { className: "card" }, el("h3", {}, f.name), el("pre", {}, f.examples.join("\n"))));
  out.push(...m.examples.map((e) => el("div", { className: "card" }, el("h3", {}, e.path), el("pre", {}, code(e.source)),
    el("div", { className: "actions" }, el("button", { type: "button", className: "act", onclick: () => copy(e.source, e.path) }, "Copy example")))));
  if (!out.length) out.push(el("p", { className: "empty" }, "No examples yet."));
  out.unshift(el("p", { className: "note" }, "The @example lines and example files are executed by `npm test`, so they stay true."));
  return out;
}
function agentTab(m) {
  const json = JSON.stringify(contract(m), null, 2);
  return [el("div", { className: "actions" },
      el("button", { type: "button", className: "act primary", onclick: () => copy(agentPrompt(m), "agent prompt") }, "Copy prompt (with dependencies and tests)"),
      el("button", { type: "button", className: "act", onclick: () => copy(json, "contract JSON") }, "Copy contract JSON")),
    el("p", { className: "note" }, "Same data as modules.json, narrowed to this module."), el("pre", {}, code(json))];
}

// ---- sandboxed playground ----
// Only data (JSON arguments) crosses into the sandbox; the bundled module code is the repository's own.
function bundle(m) {
  return withDeps(m).map((x) => x.source.split("\n").filter((l) => !/^import /.test(l)).join("\n").replace(/^export /gm, "")).join("\n");
}
function callInSandbox(m, fn, args, ms = 2000) {
  return new Promise((resolve, reject) => {
    const frame = el("iframe", { hidden: true });
    frame.setAttribute("sandbox", "allow-scripts"); // no same-origin: cannot touch this page, storage or cookies
    frame.srcdoc = `<script>onmessage=e=>{try{const f=new Function(e.data.code+"\\nreturn "+e.data.fn+";")();const r=f(...e.data.args);parent.postMessage({ok:true,text:typeof r==="number"?String(r):JSON.stringify(r)??"undefined"},"*")}catch(err){parent.postMessage({ok:false,text:String(err)},"*")}}<\/script>`;
    const done = (fnc, v) => { clearTimeout(timer); removeEventListener("message", onMsg); frame.remove(); fnc(v); };
    const onMsg = (e) => { if (e.source === frame.contentWindow) done(e.data.ok ? resolve : reject, e.data.text); };
    const timer = setTimeout(() => done(reject, `Timed out after ${ms} ms; sandbox discarded.`), ms);
    addEventListener("message", onMsg);
    frame.onload = () => frame.contentWindow.postMessage({ code: bundle(m), fn, args }, "*");
    document.body.append(frame);
  });
}
function parseArg(p, raw) {
  if (raw === "" && p.optional) return undefined;
  if (raw === "") throw new Error(`${p.name} is required`);
  if (p.type === "number") { const n = Number(raw); if (Number.isNaN(n) && raw.trim() !== "NaN") throw new Error(`${p.name} must be a number`); return n; }
  if (p.type === "boolean") return raw === "true";
  if (p.type === "string") return raw;
  try { return JSON.parse(raw); } catch { throw new Error(`${p.name} must be valid JSON`); }
}
function defaultsFor(f) {
  try { const call = f.examples[0].split(" // => ")[0]; return new Function(`const ${f.name}=(...a)=>a;return ${call};`)().map(String); }
  catch { return []; }
}
function playgroundTab(m) {
  if (!m.functions.length) return [el("p", { className: "empty" }, "This module exports no functions to run.")];
  const f = m.functions.find((x) => x.name === fnName) ?? m.functions[0];
  const select = el("select", { ariaLabel: "Function", onchange: (e) => { fnName = e.target.value; renderDetail(); } }, ...m.functions.map((x) => el("option", { value: x.name, selected: x.name === f.name }, x.name)));
  const defs = defaultsFor(f), inputs = f.params.map((p, i) => {
    const input = p.type === "boolean" ? el("select", {}, el("option", { value: "true" }, "true"), el("option", { value: "false" }, "false")) : el("input", { type: "text", value: defs[i] ?? "", placeholder: p.optional ? "(optional)" : "" });
    input.setAttribute("aria-label", p.name);
    return { p, input };
  });
  const result = el("div", { className: "result", role: "status" }, "Result appears here.");
  const run = async () => {
    try {
      const args = inputs.map(({ p, input }) => parseArg(p, input.value));
      result.className = "result"; result.textContent = "Running…";
      result.textContent = await callInSandbox(m, f.name, args);
    } catch (e) { result.className = "result err"; result.textContent = String(e.message ?? e); }
  };
  return [el("div", { className: "card" }, el("h3", {}, "Playground"), el("div", { className: "fields" }, el("label", {}, "function", select), ...inputs.map(({ p, input }) => el("label", {}, `${p.name}: ${p.type}`, input))),
    el("button", { type: "button", className: "act primary", onclick: run }, "Run"), result,
    el("p", { className: "note" }, "Runs in a sandboxed iframe with no access to this page or its storage, and a 2 second limit. Inputs are data only (numbers, strings, booleans, JSON), never code.")),
    f.examples.length ? el("div", { className: "card" }, el("h3", {}, "Documented examples"), el("pre", {}, f.examples.join("\n"))) : null];
}

function renderDetail() {
  const m = current, box = $("#detail");
  if (!m) { box.replaceChildren(el("p", { className: "empty" }, "Select a module.")); return; }
  const views = { Overview: overviewTab, Code: codeTab, Playground: playgroundTab, Tests: testsTab, Examples: examplesTab, "AI Agent": agentTab };
  box.replaceChildren(
    el("button", { type: "button", className: "act back", onclick: () => { document.body.dataset.view = "list"; } }, "← All modules"),
    el("p", { className: "crumb" }, `${m.category} › ${m.id.split("/")[1]}`),
    el("div", { className: "head" }, el("h2", {}, m.id.split("/")[1]), badge(m), el("span", { className: "badge" }, `v${m.version}`)),
    el("p", { className: "summary" }, m.summary),
    el("ul", { className: "chips" }, el("li", {}, m.category), el("li", {}, m.dependencies.length ? `Depends on ${m.dependencies.join(", ")}` : "No dependencies"), el("li", {}, m.license), el("li", {}, `Source: ${m.provenance}`)),
    el("div", { className: "actions" },
      el("button", { type: "button", className: "act primary", onclick: () => copy(withDeps(m).map((x) => `// ${x.path}\n${x.source}\n\n// ${x.testPath ?? ""}\n${x.test}`).join("\n\n"), "module, tests and dependencies") }, "Copy module"),
      el("button", { type: "button", className: "act", onclick: () => copy(`npm run copy -- ${m.id} <dest-dir>`, "CLI command") }, "Copy CLI command")),
    el("div", { className: "tabs", role: "tablist" }, ...TABS.map((t) => el("button", { type: "button", role: "tab", ariaSelected: String(t === tab), onclick: () => { tab = t; renderDetail(); } }, t))),
    ...views[tab](m).filter(Boolean));
}

$("#q").addEventListener("input", () => { document.body.dataset.view = "list"; renderRegistry(); });
for (const id of ["#f-verified", "#f-nodeps"]) $(id).addEventListener("change", renderRegistry);
addEventListener("keydown", (e) => { if (e.key === "/" && document.activeElement !== $("#q")) { e.preventDefault(); $("#q").focus(); } });
renderRegistry();
const first = location.hash.slice(1);
if (modules.some((m) => m.id === first)) select(first); else { current = modules[0] ?? null; fnName = current?.functions[0]?.name ?? null; renderRegistry(); renderDetail(); }
