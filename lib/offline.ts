"use client";

// "Make available offline" + "Update available": downloads every file listed in
// /precache-manifest.json (generated at build) into the service worker cache.

import { useCallback, useEffect, useState } from "react";

const CACHE = "hxm-v1";
const VERSION_KEY = "/__hxm_version";

interface Manifest {
  version: string;
  builtAt: string;
  totalBytes: number;
  files: { url: string; size: number }[];
}

export interface OfflineState {
  supported: boolean;
  installedVersion: string | null; // version fully downloaded on this device
  latestVersion: string | null; // version on the server (null if offline / dev)
  busy: boolean;
  progress: number; // 0..1 while downloading
  error: string | null;
}

async function fetchManifest(): Promise<Manifest | null> {
  try {
    const res = await fetch("/precache-manifest.json", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Manifest;
  } catch {
    return null;
  }
}

async function installedVersion(): Promise<string | null> {
  try {
    const res = await (await caches.open(CACHE)).match(VERSION_KEY);
    return res ? await res.text() : null;
  } catch {
    return null;
  }
}

export function useOffline() {
  const [s, setS] = useState<OfflineState>({ supported: false, installedVersion: null, latestVersion: null, busy: false, progress: 0, error: null });

  const refresh = useCallback(async () => {
    const supported = typeof window !== "undefined" && "caches" in window && "serviceWorker" in navigator;
    if (!supported) return setS((p) => ({ ...p, supported: false }));
    const [inst, manifest] = await Promise.all([installedVersion(), fetchManifest()]);
    setS((p) => ({ ...p, supported: true, installedVersion: inst, latestVersion: manifest?.version ?? null }));
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 60_000);
    window.addEventListener("online", refresh);
    return () => {
      clearInterval(id);
      window.removeEventListener("online", refresh);
    };
  }, [refresh]);

  // Download (or re-download, for an update) every file, then mark the version.
  const download = useCallback(async (reloadAfter = false) => {
    setS((p) => ({ ...p, busy: true, progress: 0, error: null }));
    try {
      const manifest = await fetchManifest();
      if (!manifest) throw new Error("Can't reach the server to download (are you online? in dev mode run a build).");
      const cache = await caches.open(CACHE);
      let done = 0;
      const queue = [...manifest.files];
      const worker = async () => {
        for (let f = queue.shift(); f; f = queue.shift()) {
          const res = await fetch(f.url, { cache: "reload" });
          if (!res.ok) throw new Error(`${f.url}: HTTP ${res.status}`);
          await cache.put(f.url, res);
          done += f.size;
          setS((p) => ({ ...p, progress: done / manifest.totalBytes }));
        }
      };
      await Promise.all(Array.from({ length: 6 }, worker));
      await cache.put("/precache-manifest.json", new Response(JSON.stringify(manifest), { headers: { "Content-Type": "application/json" } }));
      await cache.put(VERSION_KEY, new Response(manifest.version));
      setS((p) => ({ ...p, busy: false, progress: 1, installedVersion: manifest.version, latestVersion: manifest.version }));
      if (reloadAfter) window.location.reload();
    } catch (e) {
      setS((p) => ({ ...p, busy: false, error: e instanceof Error ? e.message : String(e) }));
    }
  }, []);

  const ready = !!s.installedVersion;
  const updateAvailable = !!(s.installedVersion && s.latestVersion && s.installedVersion !== s.latestVersion);
  return { ...s, ready, updateAvailable, download, refresh };
}
