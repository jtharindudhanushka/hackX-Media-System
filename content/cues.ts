// Cue model. A collection is an ordered list of sections, each a list of cues
// (one cue = one thing on screen). Templates live in components/scenes/.
// To add a new kind of slide: add a variant here + a case in CueRenderer.

import type { Brand, EventId } from "@/lib/types";
import type { VideoId } from "./media";
import type { Person } from "./people";

export type WinnerPlace = "champion" | "first" | "second" | "popular";

export type CueBody =
  | { kind: "loop"; brand: Brand; title?: string; subtitle?: string }
  | { kind: "still"; brand: Brand; title?: string; subtitle?: string }
  | { kind: "video"; brand: Brand; video: VideoId; loop?: boolean }
  | { kind: "person"; brand: Brand; person: Person; eyebrow?: string; video?: VideoId }
  | { kind: "panel"; brand: Brand; eyebrow?: string; title: string; people: readonly Person[] }
  | { kind: "list"; brand: Brand; eyebrow?: string; title: string; people: readonly Person[] }
  | { kind: "partner"; brand: Brand; partnerIds: readonly string[]; tier?: string; motion?: boolean }
  | { kind: "partnerWall"; brand: Brand; title?: string }
  | { kind: "text"; brand: Brand; eyebrow?: string; title: string; body?: string }
  | { kind: "guidelines"; event: EventId; title?: string; bullets: readonly string[] }
  | { kind: "prizes"; brand: Brand; groups: readonly { event: EventId; places: readonly { label: string; amount: number }[] }[] }
  | { kind: "team"; teamId: string; index?: number; total?: number }
  | { kind: "timer"; event: EventId; teamId?: string; phase: "pitch" | "qa"; seconds: number }
  | { kind: "winner"; event: EventId; place: WinnerPlace; slot: string; prize?: number; revealed?: boolean }
  | { kind: "black" };

export type CueKind = CueBody["kind"];

export type Cue = CueBody & {
  id: string;
  label: string;   // shown in the control panel cue list
  note?: string;   // MC line / operator hint from the script
};

export interface Section {
  title: string;
  cues: Cue[];
}

export interface Collection {
  id: string;
  name: string;
  brand: Brand;
  description: string;
  mode?: "cues" | "pitch"; // pitch = scene/team/timer control instead of a cue list
  event?: EventId;
  sections: Section[];
  fallback: Cue; // what PANIC shows
}

// How many extra GO presses a cue takes before moving on (step-by-step reveals).
export function stepsOf(cue: Cue): number {
  switch (cue.kind) {
    case "panel":
      return cue.people.length;
    case "prizes":
      return cue.groups.reduce((n, g) => n + g.places.length, 0);
    case "winner":
      return cue.revealed ? 0 : 1;
    default:
      return 0;
  }
}

export function brandOf(cue: Cue): Brand {
  if ("brand" in cue) return cue.brand;
  if ("event" in cue) return cue.event;
  if (cue.kind === "team") return cue.teamId.startsWith("jr-") ? "jr" : "hackx";
  return "combined";
}

// ── builder ───────────────────────────────────────────────────────────────
// Cue ids come from the collection + section + label, so they stay stable
// while you edit other cues (the live program refers to cues by id).

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export type CueInput = CueBody & { label: string; note?: string };

export function collection(
  meta: Omit<Collection, "sections" | "fallback"> & { fallback: CueInput },
  sections: readonly { title: string; cues: readonly CueInput[] }[]
): Collection {
  const seen = new Map<string, number>();
  const make = (sectionTitle: string, c: CueInput): Cue => {
    const base = `${meta.id}:${slug(sectionTitle)}:${slug(c.label)}`;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return { ...c, id: n > 1 ? `${base}-${n}` : base } as Cue;
  };
  return {
    ...meta,
    fallback: make("fallback", meta.fallback),
    sections: sections.map((s) => ({ title: s.title, cues: s.cues.map((c) => make(s.title, c)) })),
  };
}

export function allCues(c: Collection): Cue[] {
  return c.sections.flatMap((s) => s.cues);
}
