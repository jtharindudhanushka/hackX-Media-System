import type { ChannelState } from "./types";
import { DEFAULT_PITCH, IDLE_TIMER } from "./types";

// A channel = one output screen (usually one hall's projector). Any scene
// collection can be loaded on any channel from the control panel.
export interface ChannelConfig {
  id: string;
  name: string;
  defaultCollection: string;
}

export const CHANNELS: ChannelConfig[] = [
  { id: "main", name: "Main Hall", defaultCollection: "opening" },
  { id: "hall-2", name: "Hall 2", defaultCollection: "hackx-pitch" },
  { id: "spare", name: "Spare / Rehearsal", defaultCollection: "opening" },
];

export const CHANNEL_IDS = CHANNELS.map((c) => c.id);

export function getChannel(id: string): ChannelConfig | null {
  return CHANNELS.find((c) => c.id === id) ?? null;
}

export function defaultState(channelId: string): ChannelState {
  return {
    collectionId: getChannel(channelId)?.defaultCollection ?? "opening",
    program: { cueId: null, step: 0, takenAt: 0 },
    timer: { ...IDLE_TIMER },
    pitch: { ...DEFAULT_PITCH },
    overlay: "none",
    overrides: {},
    updatedAt: 0,
    by: "",
  };
}
