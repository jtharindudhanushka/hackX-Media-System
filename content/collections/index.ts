// All scene collections, in running order of the day.
import type { Collection } from "../cues";
import { opening } from "./opening";
import { jrPitch, hackxPitch } from "./pitching";
import { closing } from "./closing";

export const COLLECTIONS: Collection[] = [opening, jrPitch, hackxPitch, closing];

export function getCollection(id: string): Collection {
  return COLLECTIONS.find((c) => c.id === id) ?? COLLECTIONS[0];
}

export function findCue(collectionId: string, cueId: string | null) {
  if (!cueId) return null;
  const c = getCollection(collectionId);
  if (c.fallback.id === cueId) return c.fallback;
  for (const s of c.sections) for (const cue of s.cues) if (cue.id === cueId) return cue;
  return null;
}
