// Pitching sessions — one per event. These run in PITCH MODE: the operator
// picks a scene (Still / Team intro / Pitching…), a team (or none) and runs the
// timer, instead of stepping through a cue list. See components/control/PitchControl.
// Teams come from content/teams.ts; timer defaults from PITCH_RULES there.
import { collection } from "../cues";
import { EVENTS } from "../brand";
import type { EventId } from "@/lib/types";

function pitchCollection(event: EventId, id: string, description: string) {
  const ev = EVENTS[event];
  return collection(
    {
      id,
      name: `${ev.name} Pitching`,
      brand: event,
      mode: "pitch",
      event,
      description,
      fallback: { kind: "loop", brand: event, label: `${ev.short} Loop` },
    },
    []
  );
}

export const jrPitch = pitchCollection("jr", "jr-pitch", "hackX Jr 9.0 pitching — Main Hall, 15 teams, 7 min pitch + 4 min Q&A (10 with translator)");
export const hackxPitch = pitchCollection("hackx", "hackx-pitch", "hackX 11.0 pitching — Hall 2, 15 teams, 7 min pitch + 5 min Q&A");
