"use client";

// Channel state sync — two paths at once:
//
//   control window ──┬── Firebase RTDB ───────→ every device, anywhere
//                    └── BroadcastChannel ─────→ other windows on THIS machine
//
// Every copy of a channel's state carries `updatedAt` (server-corrected time)
// and the newest copy wins wherever it arrives. The last state is kept in
// localStorage, so a reload while offline shows the right scene at once, and
// a change made while offline is marked "dirty" and pushed to Firebase as
// soon as the connection comes back (it survives a reload too).

import { onValue, ref, set } from "firebase/database";
import { getDb, isFirebaseConfigured } from "./firebase";
import { serverNow } from "./clock";
import { defaultState } from "./channels";
import type { ChannelState } from "./types";

type Listener = (s: ChannelState) => void;

export interface SyncStatus {
  mode: "firebase" | "local";
  connected: boolean;  // to Firebase (always true in local mode)
  pending: boolean;    // a local change Firebase hasn't confirmed yet
  error: string | null;
}

const stateKey = (id: string) => `hxm:ch:${id}`;
const dirtyKey = (id: string) => `hxm:dirty:${id}`;
const fbPath = (id: string) => `channels/${id}/state`;

function ls<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

let deviceId = "";
export function getDeviceId(): string {
  if (deviceId) return deviceId;
  deviceId = ls(() => window.localStorage.getItem("hxm:device"), null) ?? "";
  if (!deviceId) {
    deviceId = Math.random().toString(36).slice(2, 10);
    ls(() => window.localStorage.setItem("hxm:device", deviceId), undefined);
  }
  return deviceId;
}

function isNewer(a: ChannelState, b: ChannelState) {
  return a.updatedAt > b.updatedAt || (a.updatedAt === b.updatedAt && a.by > b.by);
}

// Firebase drops empty objects; fill any gaps from the default.
function normalize(id: string, raw: unknown): ChannelState | null {
  if (!raw || typeof raw !== "object") return null;
  const d = defaultState(id);
  const r = raw as Partial<ChannelState>;
  return {
    ...d,
    ...r,
    program: { ...d.program, ...(r.program ?? {}) },
    timer: { ...d.timer, ...(r.timer ?? {}), endsAt: r.timer?.endsAt ?? null },
    pitch: { ...d.pitch, ...(r.pitch ?? {}), teamId: r.pitch?.teamId ?? null },
    overrides: r.overrides ?? {},
  };
}

// ── per-channel store ────────────────────────────────────────────────────

interface Store {
  id: string;
  state: ChannelState;
  listeners: Set<Listener>;
  dirty: boolean;
  started: boolean;
}

const stores = new Map<string, Store>();
const statusListeners = new Set<(s: SyncStatus) => void>();
let status: SyncStatus = {
  mode: isFirebaseConfigured ? "firebase" : "local",
  connected: !isFirebaseConfigured,
  pending: false,
  error: null,
};

function setStatus(patch: Partial<SyncStatus>) {
  status = { ...status, ...patch };
  statusListeners.forEach((cb) => cb(status));
}

function refreshPending() {
  setStatus({ pending: [...stores.values()].some((s) => s.dirty) });
}

let bc: BroadcastChannel | null = null;
function channelBus(): BroadcastChannel | null {
  if (bc || typeof BroadcastChannel === "undefined") return bc;
  bc = new BroadcastChannel("hxm-sync");
  bc.onmessage = (e) => {
    const { id, state } = e.data ?? {};
    const store = stores.get(id);
    const incoming = normalize(id, state);
    if (store && incoming) accept(store, incoming, "bus");
  };
  return bc;
}

function persist(store: Store) {
  ls(() => window.localStorage.setItem(stateKey(store.id), JSON.stringify(store.state)), undefined);
  ls(() => window.localStorage.setItem(dirtyKey(store.id), store.dirty ? "1" : ""), undefined);
}

function accept(store: Store, incoming: ChannelState, source: "local" | "bus" | "firebase"): boolean {
  if (!isNewer(incoming, store.state)) {
    // Firebase holds something older than ours (we changed it offline): push ours.
    if (source === "firebase" && store.dirty) pushToFirebase(store);
    return false;
  }
  store.state = incoming;
  if (source === "firebase") store.dirty = false;
  persist(store);
  store.listeners.forEach((cb) => cb(store.state));
  return true;
}

function pushToFirebase(store: Store) {
  if (!isFirebaseConfigured) return;
  const snapshot = store.state;
  set(ref(getDb(), fbPath(store.id)), snapshot)
    .then(() => {
      if (store.state === snapshot) {
        store.dirty = false;
        persist(store);
      }
      setStatus({ error: null });
      refreshPending();
    })
    .catch((err: Error) => {
      setStatus({ error: err?.message?.includes("PERMISSION") ? "No permission to control (sign in)" : String(err?.message ?? err) });
    });
}

let connectionWatched = false;
function watchConnection() {
  if (connectionWatched || !isFirebaseConfigured) return;
  connectionWatched = true;
  onValue(ref(getDb(), ".info/connected"), (snap) => {
    const connected = snap.val() === true;
    setStatus({ connected });
    if (connected) stores.forEach((s) => s.dirty && pushToFirebase(s));
  });
}

function getStore(id: string): Store {
  let store = stores.get(id);
  if (store) return store;
  const saved = normalize(id, ls(() => JSON.parse(window.localStorage.getItem(stateKey(id)) ?? "null"), null));
  store = {
    id,
    state: saved ?? defaultState(id),
    listeners: new Set(),
    dirty: ls(() => window.localStorage.getItem(dirtyKey(id)) === "1", false),
    started: false,
  };
  stores.set(id, store);
  return store;
}

function start(store: Store) {
  if (store.started) return;
  store.started = true;
  channelBus();
  // other tabs that don't support BroadcastChannel still get storage events
  window.addEventListener("storage", (e) => {
    if (e.key !== stateKey(store.id) || !e.newValue) return;
    const incoming = normalize(store.id, ls(() => JSON.parse(e.newValue!), null));
    if (incoming) accept(store, incoming, "bus");
  });
  if (isFirebaseConfigured) {
    watchConnection();
    onValue(ref(getDb(), fbPath(store.id)), (snap) => {
      const incoming = normalize(store.id, snap.val());
      if (incoming) accept(store, incoming, "firebase");
      else if (store.dirty) pushToFirebase(store);
    });
  }
  refreshPending();
}

// ── public API ───────────────────────────────────────────────────────────

export function subscribeChannel(id: string, cb: Listener): () => void {
  const store = getStore(id);
  store.listeners.add(cb);
  start(store);
  cb(store.state);
  return () => {
    store.listeners.delete(cb);
  };
}

export function getChannelState(id: string): ChannelState {
  return getStore(id).state;
}

// Apply a change from this device: newest timestamp, local first, then out.
export function updateChannel(id: string, change: (s: ChannelState) => Partial<ChannelState>) {
  const store = getStore(id);
  start(store);
  const prev = store.state;
  const next: ChannelState = {
    ...prev,
    ...change(prev),
    updatedAt: Math.max(serverNow(), prev.updatedAt + 1),
    by: getDeviceId(),
  };
  store.dirty = isFirebaseConfigured;
  accept(store, next, "local");
  channelBus()?.postMessage({ id, state: next });
  refreshPending();
  pushToFirebase(store);
}

export function subscribeSyncStatus(cb: (s: SyncStatus) => void): () => void {
  statusListeners.add(cb);
  cb(status);
  return () => {
    statusListeners.delete(cb);
  };
}
