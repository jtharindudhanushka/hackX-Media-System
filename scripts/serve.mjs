// Zero-dependency static server for the built app (out/). Use it to run the
// whole system from a laptop with no internet:  npm run build && npm start
// Supports byte ranges (video seeking) and the trailing-slash page URLs.
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "out");
const PORT = Number(process.env.PORT) || 3000;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".webmanifest": "application/manifest+json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime",
  ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8", ".mp3": "audio/mpeg",
};

function resolve(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split("?")[0])).replace(/^(\.\.[\\/])+/, "");
  let p = join(ROOT, clean);
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, "index.html");
  else if (!existsSync(p) && existsSync(p + ".html")) p += ".html";
  return existsSync(p) && statSync(p).isFile() ? p : null;
}

createServer((req, res) => {
  const url = req.url || "/";
  // pages live at /path/ (trailingSlash) — redirect /path → /path/
  if (!url.includes(".") && !url.split("?")[0].endsWith("/")) {
    const [path, q] = url.split("?");
    res.writeHead(308, { Location: path + "/" + (q ? "?" + q : "") });
    return res.end();
  }
  const file = resolve(url) ?? resolve("/404.html");
  if (!file) {
    res.writeHead(404);
    return res.end("Not found");
  }
  const size = statSync(file).size;
  const headers = { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream", "Accept-Ranges": "bytes" };
  if (/\/(sw\.js|precache-manifest\.json)$/.test(file.replace(/\\/g, "/"))) headers["Cache-Control"] = "no-cache";
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || "");
  if (m) {
    const start = m[1] ? +m[1] : size - +m[2];
    const end = m[1] && m[2] ? Math.min(+m[2], size - 1) : size - 1;
    res.writeHead(206, { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": end - start + 1 });
    return createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { ...headers, "Content-Length": size });
  createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`hackX Media → http://localhost:${PORT}`));
