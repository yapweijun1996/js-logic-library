// Tiny static server for the explorer: node scripts/serve.mjs [port]
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".txt": "text/plain" };
const port = Number(process.argv[2]) || 5300;
createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  const file = join("site", path.endsWith("/") ? path + "index.html" : path);
  try {
    const body = await readFile(file);
    res.writeHead(200, { "cache-control": "no-cache", "content-type": `${types[extname(file)] ?? "text/plain"}; charset=utf-8` });
    res.end(body);
  } catch { res.writeHead(404).end("not found"); }
}).listen(port, "127.0.0.1", () => console.log(`http://127.0.0.1:${port}/`));
