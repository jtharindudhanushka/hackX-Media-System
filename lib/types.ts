export type Brand = "combined" | "hackx" | "jr";
export type EventId = "hackx" | "jr";

export type TimerStatus = "idle" | "running" | "paused";

export interface TimerState {
  status: TimerStatus;
  duration: number;       // seconds the timer was loaded with
  remaining: number;      // seconds — authoritative while not running
  endsAt: number | null;  // server-time ms when it hits 0 (while running)
}

// Pitching rooms are driven by scene + team + timer instead of a cue list.
export type PitchScene = "still" | "loop" | "intro" | "timer" | "video";
export interface PitchState {
  scene: PitchScene;
  sceneAt: number;          // when the scene was switched (videos join from here)
  teamId: string | null;    // null = no team name on screen
  phase: "pitch" | "qa";
  pitchSec: number;         // 0 = event default
  qaSec: number;            // 0 = event default
}

export const DEFAULT_PITCH: PitchState = { scene: "still", sceneAt: 0, teamId: null, phase: "pitch", pitchSec: 0, qaSec: 0 };

export type Overlay = "none" | "black" | "panic";

// Live state of one channel (one output / hall). Small on purpose: the whole
// object is written at once, and the newest `updatedAt` wins everywhere.
export interface ChannelState {
  collectionId: string;
  program: { cueId: string | null; step: number; takenAt: number };
  timer: TimerState;
  pitch: PitchState;
  overlay: Overlay;
  overrides: Record<string, string>; // e.g. winner names: "winner.jr.2" → team id
  updatedAt: number;
  by: string;
}

export const IDLE_TIMER: TimerState = { status: "idle", duration: 0, remaining: 0, endsAt: null };
