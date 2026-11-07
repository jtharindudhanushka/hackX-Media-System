// hackX Media — offline service worker.
//
// Cache-first for everything on this origin: once a device has downloaded the
// app ("Make available offline" in the app, or just by visiting pages), it runs
// with no network at all. New deploys are NOT picked up silently — the app
// shows "Update available" and the operator chooses when to update (that
// re-downloads every file into the same cache, then reloads).
//
// Firebase and other origins are never touched here.

const CACHE = "hxm-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Version check must always see the network when there is one.
  if (url.pathname === "/precache-manifest.json") {
    event.respondWith(fetch(req, { cache: "no-store" }).catch(() => caches.match("/precache-manifest.json")));
    return;
  }
  // Next dev server internals (never cached)
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;

  if (req.headers.has("range")) {
    event.respondWith(rangeResponse(req, url));
    return;
  }
  event.respondWith(cacheFirst(req, url));
});

async function lookup(url, isNav) {
  const cache = await caches.open(CACHE);
  const opts = { ignoreSearch: isNav };
  let res = await cache.match(url.pathname, opts);
  if (!res && isNav && !url.pathname.endsWith("/")) res = await cache.match(url.pathname + "/", opts);
  if (!res && !isNav) res = await cache.match(url.href);
  return res;
}

async function cacheFirst(req, url) {
  const isNav = req.mode === "navigate";
  const hit = await lookup(url, isNav);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok && res.status === 200 && res.type === "basic" && !res.redirected) {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(url.pathname + (isNav ? "" : url.search), copy));
    }
    return res;
  } catch (err) {
    if (isNav) {
      const home = await lookup(new URL("/", url), true);
      if (home) return home;
      return new Response("<h1>Offline</h1><p>This page was not downloaded for offline use yet.</p>", { headers: { "Content-Type": "text/html" } });
    }
    throw err;
  }
}

// Videos are requested in byte ranges; serve them from the cached full file.
async function rangeResponse(req, url) {
  const cached = await lookup(url, false);
  if (!cached) {
    // Not cached yet: stream from network, and cache the full file in the background.
    fetch(url.pathname)
      .then((full) => {
        if (full.ok && full.status === 200) return caches.open(CACHE).then((c) => c.put(url.pathname, full));
      })
      .catch(() => {});
    return fetch(req);
  }
  const buf = await cached.arrayBuffer();
  const size = buf.byteLength;
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get("range") || "");
  let start = m && m[1] ? parseInt(m[1], 10) : 0;
  let end = m && m[2] ? parseInt(m[2], 10) : size - 1;
  if (m && !m[1] && m[2]) {
    start = size - parseInt(m[2], 10);
    end = size - 1;
  }
  end = Math.min(end, size - 1);
  if (start >= size || start > end) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  }
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      "Content-Type": cached.headers.get("Content-Type") || "video/mp4",
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Content-Length": String(end - start + 1),
      "Accept-Ranges": "bytes",
    },
  });
}
