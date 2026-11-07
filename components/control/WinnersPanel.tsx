"use client";

import { allCues, type Collection } from "@/content/cues";
import { teamsOf } from "@/content/teams";
import { EVENTS } from "@/content/brand";
import { setOverride } from "@/lib/actions";
import { Caption, Card } from "@/components/ui/kit";

const PLACE = { champion: "Champions", first: "1st Runners-Up", second: "2nd Runners-Up", popular: "Most Popular" } as const;

// Results are picked here on the day (synced to every screen), never in code.
export function WinnersPanel({ channelId, collection, overrides }: { channelId: string; collection: Collection; overrides: Record<string, string> }) {
  const slots = new Map<string, { event: "hackx" | "jr"; place: keyof typeof PLACE }>();
  for (const c of allCues(collection)) if (c.kind === "winner") slots.set(c.slot, { event: c.event, place: c.place });
  const set = [...slots.keys()].filter((k) => overrides[k]).length;

  return (
    <Card className="p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="ui-display text-[22px]">Winners</h3>
        <Caption>
          {set}/{slots.size} set
        </Caption>
      </div>
      <Caption className="mt-1">Pick before each reveal. Screens update instantly.</Caption>
      <div className="mt-4 space-y-3">
        {[...slots.entries()].map(([slot, { event, place }]) => (
          <label key={slot} className="block">
            <span className="text-[12px] text-ui-muted">
              {EVENTS[event].name} · {PLACE[place]}
            </span>
            <select
              value={overrides[slot] ?? ""}
              onChange={(e) => setOverride(channelId, slot, e.target.value)}
              className={`mt-1 h-10 w-full rounded-[10px] bg-ui-canvas px-3 text-[14px] focus:outline-none ${overrides[slot] ? "text-ui-ink shadow-[0_0_0_1px_rgb(var(--ui-accent)/0.45)]" : "text-ui-muted"}`}
            >
              <option value="">Not set</option>
              {teamsOf(event).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </Card>
  );
}
