import { ref, onValue } from "firebase/database";
import { getDb, isFirebaseConfigured } from "./firebase";

// Offset between this device's clock and Firebase server time, so every screen
// computes the same remaining time even if device clocks disagree. The last
// known offset is remembered, so a reload while offline stays in sync.
const OFFSET_KEY = "hxm:server-offset";
let serverOffsetMs = 0;
let subscribed = false;

function ensureOffset() {
  if (subscribed || typeof window === "undefined") return;
  subscribed = true;
  try {
    serverOffsetMs = Number(window.localStorage.getItem(OFFSET_KEY)) || 0;
  } catch {}
  if (!isFirebaseConfigured) return;
  onValue(ref(getDb(), ".info/serverTimeOffset"), (snap) => {
    serverOffsetMs = snap.val() ?? 0;
    try {
      window.localStorage.setItem(OFFSET_KEY, String(serverOffsetMs));
    } catch {}
  });
}

export function serverNow(): number {
  ensureOffset();
  return Date.now() + serverOffsetMs;
}
