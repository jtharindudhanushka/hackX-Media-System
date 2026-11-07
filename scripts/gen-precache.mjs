// After `next build` (static export to out/): list every file the app needs,
// with a content-hash version, into out/precache-manifest.json. The app
// downloads exactly this list for offline use and compares `version` to know
// when an update is available.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = "out";
const SKIP = new Set(["precache-manifest.json", "sw.js"]);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const hash = createHash("sha1");
const files = [];
let totalBytes = 0;

for (const path of walk(OUT).sort()) {
  const rel = relative(OUT, path).split(sep).join("/");
  if (SKIP.has(rel) || rel.endsWith(".map")) continue;
  const data = readFileSync(path);
  hash.update(rel).update(data);
  totalBytes += data.length;
  // pages are requested as /dir/ (trailingSlash), so cache them under that URL
  const url = rel === "index.html" ? "/" : rel.endsWith("/index.html") ? "/" + rel.slice(0, -"index.html".length) : "/" + rel;
  files.push({ url, size: data.length });
}

const version = hash.digest("hex").slice(0, 10);
writeFileSync(join(OUT, "precache-manifest.json"), JSON.stringify({ version, builtAt: new Date().toISOString(), totalBytes, files }, null, 0));
console.log(`precache: ${files.length} files, ${(totalBytes / 1e6).toFixed(1)} MB, version ${version}`);
