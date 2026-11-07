"use client";

// Everything the operator can do to a channel. Each is one atomic state write.
import type { Cue } from "@/content/cues";
import { serverNow } from "./clock";
import { timerRemaining } from "./hooks";
import { updateChannel } from "./sync";
import type { Overlay, PitchScene, TimerState } from "./types";
import { DEFAULT_PITCH } from "./types";
import { getCollection } from "@/content/collections";
import { PITCH_RULES } from "@/content/teams";

export function take(ch: string, cue: Cue) {
  updateChannel(ch, (s) => {
    const same = s.program.cueId === cue.id;
    return {
      program: { cueId: cue.id, step: 0, takenAt: serverNow() },
      overlay: "none",
      // a timer cue loads its duration (paused at full time); re-taking the
      // same cue keeps a running clock instead of resetting it
      ...(cue.kind === "timer" && !same ? { timer: loaded(cue.seconds) } : {}),
    };
  });
}

export function setStep(ch: string, step: number) {
  updateChannel(ch, (s) => ({ program: { ...s.program, step: Math.max(0, step) } }));
}

export function setOverlay(ch: string, overlay: Overlay) {
  updateChannel(ch, () => ({ overlay }));
}

export function setCollection(ch: string, collectionId: string) {
  const ev = getCollection(collectionId).event;
  updateChannel(ch, () => ({
    collectionId,
    program: { cueId: null, step: 0, takenAt: serverNow() },
    overlay: "none",
    // pitch collections start on the still, no team, a loaded pitch clock
    ...(ev ? { pitch: { ...DEFAULT_PITCH, sceneAt: serverNow() }, timer: loaded(PITCH_RULES[ev].pitch) } : {}),
  }));
}

export function setOverride(ch: string, key: string, value: string) {
  updateChannel(ch, (s) => {
    const overrides = { ...s.overrides };
    if (value) overrides[key] = value;
    else delete overrides[key];
    return { overrides };
  });
}

// ── timer ────────────────────────────────────────────────────────────────

const loaded = (seconds: number): TimerState => ({ status: "idle", duration: seconds, remaining: seconds, endsAt: null });

export function timerStart(ch: string) {
  updateChannel(ch, (s) => {
    if (s.timer.status === "running") return {};
    return { timer: { ...s.timer, status: "running", endsAt: serverNow() + s.timer.remaining * 1000 } };
  });
}

export function timerPause(ch: string) {
  updateChannel(ch, (s) => {
    if (s.timer.status !== "running") return {};
    return { timer: { ...s.timer, status: "paused", remaining: timerRemaining(s.timer), endsAt: null } };
  });
}

export function timerToggle(ch: string, running: boolean) {
  if (running) timerPause(ch);
  else timerStart(ch);
}

export function timerReset(ch: string) {
  updateChannel(ch, (s) => ({ timer: loaded(s.timer.duration) }));
}

export function timerAdjust(ch: string, deltaSec: number) {
  updateChannel(ch, (s) => {
    const t = s.timer;
    if (t.status === "running" && t.endsAt != null) return { timer: { ...t, endsAt: t.endsAt + deltaSec * 1000 } };
    return { timer: { ...t, remaining: t.remaining + deltaSec } };
  });
}

export function timerSet(ch: string, seconds: number) {
  updateChannel(ch, () => ({ timer: loaded(seconds) }));
}

export function timerSetRemaining(ch: string, seconds: number) {
  updateChannel(ch, (s) => ({ timer: { ...s.timer, remaining: Math.max(0, Math.min(99 * 60 + 59, Math.round(seconds))) } }));
}

// ── pitch mode ───────────────────────────────────────────────────────────

export function pitchScene(ch: string, scene: PitchScene) {
  updateChannel(ch, (s) => ({ pitch: { ...s.pitch, scene, sceneAt: serverNow() }, overlay: "none" }));
}

// Picking a team loads a fresh pitch clock unless one is running.
export function pitchTeam(ch: string, teamId: string | null, pitchSeconds: number) {
  updateChannel(ch, (s) => ({
    pitch: { ...s.pitch, teamId, phase: s.timer.status === "running" ? s.pitch.phase : "pitch" },
    ...(s.timer.status === "running" ? {} : { timer: loaded(pitchSeconds) }),
  }));
}

export function pitchPhase(ch: string, phase: "pitch" | "qa", seconds: number) {
  updateChannel(ch, (s) => ({ pitch: { ...s.pitch, phase }, timer: loaded(seconds) }));
}

// Change a default duration; if that phase's clock hasn't started, it follows.
export function pitchDuration(ch: string, phase: "pitch" | "qa", seconds: number) {
  updateChannel(ch, (s) => ({
    pitch: { ...s.pitch, ...(phase === "pitch" ? { pitchSec: seconds } : { qaSec: seconds }) },
    ...(s.pitch.phase === phase && s.timer.status === "idle" ? { timer: loaded(seconds) } : {}),
  }));
}
