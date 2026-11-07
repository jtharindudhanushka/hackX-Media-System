"use client";

import { useEffect, useState } from "react";
import { subscribeChannel, subscribeSyncStatus, type SyncStatus } from "./sync";
import { defaultState } from "./channels";
import { serverNow } from "./clock";
import type { ChannelState, TimerState } from "./types";

export function useChannel(id: string): ChannelState {
  const [state, setState] = useState<ChannelState>(() => defaultState(id));
  useEffect(() => subscribeChannel(id, setState), [id]);
  return state;
}

export function useSyncStatus(): SyncStatus | null {
  const [s, setS] = useState<SyncStatus | null>(null);
  useEffect(() => subscribeSyncStatus(setS), []);
  return s;
}

// Whole seconds left (negative = overtime).
export function timerRemaining(t: TimerState): number {
  if (t.status === "running" && t.endsAt != null) return Math.ceil((t.endsAt - serverNow()) / 1000);
  return t.remaining;
}

// Live countdown derived from endsAt — ticks locally, no per-second writes.
export function useTimerRemaining(t: TimerState): number {
  const [, tick] = useState(0);
  useEffect(() => {
    if (t.status !== "running") return;
    const id = setInterval(() => tick((n) => n + 1), 200);
    return () => clearInterval(id);
  }, [t.status, t.endsAt]);
  return timerRemaining(t);
}

// Keeps a display from sleeping while open (re-requested when tab returns).
export function useWakeLock(enabled = true) {
  useEffect(() => {
    if (!enabled || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let active = true;
    const request = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        lock = await navigator.wakeLock.request("screen");
        if (!active) lock.release().catch(() => {});
      } catch {}
    };
    const onVis = () => {
      if (document.visibilityState === "visible") request();
    };
    request();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVis);
      lock?.release().catch(() => {});
    };
  }, [enabled]);
}

export function formatClock(sec: number): string {
  const s = Math.abs(sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${sec < 0 ? "+" : ""}${m}:${String(r).padStart(2, "0")}`;
}
