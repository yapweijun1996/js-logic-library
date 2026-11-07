// Explorer UI. All module text is rendered with textContent, never as HTML.
const $ = (s) => document.querySelector(s);
const el = (tag, props = {}, ...kids) => {
  const n = Object.assign(document.createElement(tag), props);
  n.append(...kids);
  return n;
};
let modules = [], current = null, tab = "source";

const res = await fetch("modules.json").catch(() => null);
if (!res?.ok) { $("#detail").replaceChildren(el("p", { className: "empty" }, "Could not load modules.json. Run `npm run build` first.")); throw new Error("no index"); }
modules = (await res.json()).modules;

function toast(msg) {
  const t = el("div", { className: "toast", role: "status" }, msg);
  document.body.append(t);
  setTimeout(() => t.remove(), 1600);
}
async function copy(text, label) {
  try { await navigator.clipboard.writeText(text); toast(`Copied ${label}`); }
  catch { toast("Copy blocked by the browser; select the code and copy manually"); }
}
const matches = (m, q) => !q || [m.id, m.summary, ...m.exports].join(" ").toLowerCase().includes(q.toLowerCase());

function renderList() {
  const q = $("#q").value.trim(), shown = modules.filter((m) => matches(m, q));
  $("#count").textContent = `${shown.length} of ${modules.length} modules`;
  $("#list").replaceChildren(...shown.map((m) => el("li", {},
    el("button", { type: "button", onclick: () => select(m.id), ariaCurrent: String(m.id === current?.id) },
      el("b", {}, m.id), el("small", {}, m.summary)))));
  if (!shown.length) $("#list").append(el("li", { className: "empty" }, "No match. Try a function name."));
}

function withDeps(m, seen = new Set()) {
  if (seen.has(m.id)) return [];
  seen.add(m.id);
  return [...m.dependencies.flatMap((d) => withDeps(modules.find((x) => x.id === d), seen)), m];
}
function agentPrompt(m) {
  const set = withDeps(m);
  return `Use these modules as-is; do not redesign them. Copy each file (keep the relative layout and header comments) with its test, run the tests, then call ${m.id}.\n` +
    `Exports: ${m.exports.join(", ")}\nVersion: ${m.version}\n\n` +
    set.map((x) => `--- ${x.path} ---\n${x.source}\n--- ${x.testPath ?? "no test"} ---\n${x.test}`).join("\n");
}

function select(id) {
  current = modules.find((m) => m.id === id) ?? null;
  if (current) history.replaceState(null, "", `#${current.id}`);
  tab = "source";
  renderList(); renderDetail();
}

function renderDetail() {
  const m = current, box = $("#detail");
  if (!m) { box.replaceChildren(el("p", { className: "empty" }, "Select a module on the left.")); return; }
  const code = el("pre", {}, el("code", {}, m.source));
  const tabs = el("div", { className: "tabs", role: "tablist" });
  const views = { source: [m.path, m.source], test: [m.testPath ?? "no test", m.test || "// No test file for this module."] };
  const draw = () => {
    tabs.replaceChildren(...Object.entries(views).map(([k, [label]]) =>
      el("button", { type: "button", role: "tab", ariaSelected: String(k === tab), onclick: () => { tab = k; draw(); } }, label)));
    code.firstChild.textContent = views[tab][1];
  };
  box.replaceChildren(
    el("h1", {}, m.id),
    el("p", { className: "summary" }, m.summary),
    el("ul", { className: "chips", ariaLabel: "Exports" }, ...m.exports.map((x) => el("li", {}, x))),
    el("p", { className: "meta" }, `v${m.version} · Dependencies: ${m.dependencies.join(", ") || "none"} · Source: ${m.provenance} · ${m.source.split("\n").length} lines`),
    ...(m.notes ? [el("p", { className: "notes" }, m.notes)] : []),
    el("div", { className: "actions" },
      el("button", { type: "button", className: "act primary", onclick: () => copy(m.source, m.path) }, "Copy file"),
      el("button", { type: "button", className: "act", onclick: () => copy(withDeps(m).map((x) => x.source + "\n\n" + x.test).join("\n\n"), "file + test + dependencies") }, "Copy with dependencies + tests"),
      el("button", { type: "button", className: "act", onclick: () => copy(agentPrompt(m), "agent prompt") }, "Copy for AI agent")),
    tabs, code);
  draw();
  box.focus({ preventScroll: true });
}

$("#q").addEventListener("input", renderList);
addEventListener("keydown", (e) => {
  if (e.key === "/" && document.activeElement !== $("#q")) { e.preventDefault(); $("#q").focus(); }
});
renderList();
select(location.hash.slice(1) || modules[0]?.id);
