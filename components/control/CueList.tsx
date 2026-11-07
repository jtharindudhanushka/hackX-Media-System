"use client";

import { useEffect, useRef } from "react";
import { stepsOf, type Collection, type Cue, type CueKind } from "@/content/cues";

const KIND: Record<CueKind, string> = {
  loop: "Loop",
  still: "Still",
  video: "Video",
  person: "Person",
  panel: "Panel",
  list: "List",
  partner: "Partner",
  partnerWall: "Partners",
  text: "Text",
  guidelines: "Rules",
  prizes: "Prizes",
  team: "Team",
  timer: "Timer",
  winner: "Winner",
  black: "Black",
};

// Cue list for ceremony collections. Each script section is its own block;
// the cue on air is red, the one GO will take next is blue, played cues dim.
export function CueList({ collection, programId, previewId, onPreview, onTake }: { collection: Collection; programId: string | null; previewId: string | null; onPreview: (id: string) => void; onTake: (c: Cue) => void }) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.querySelector(`[data-cue="${CSS.escape(previewId ?? "")}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [previewId]);

  const order = collection.sections.flatMap((s) => s.cues.map((c) => c.id));
  const liveIndex = programId ? order.indexOf(programId) : -1;

  let n = 0;
  return (
    <div ref={listRef} className="space-y-2 p-2 pb-8">
      {collection.sections.map((s, si) => {
        const hasLive = s.cues.some((c) => c.id === programId);
        const hasNext = s.cues.some((c) => c.id === previewId);
        const allDone = liveIndex >= 0 && s.cues.every((c) => order.indexOf(c.id) < liveIndex);
        return (
          <section
            key={s.title}
            className={`overflow-hidden rounded-[15px] bg-ui-canvas transition ${hasLive ? "shadow-[0_0_0_1px_rgb(var(--ui-live)/0.45)]" : ""}`}
          >
            <header className="flex items-center gap-2.5 px-3 pb-1.5 pt-3">
              <span className="text-[11px] font-medium tabular-nums text-ui-muted">{String(si + 1).padStart(2, "0")}</span>
              <h3 className={`min-w-0 flex-1 truncate text-[13px] font-semibold tracking-[-0.01em] ${allDone ? "text-ui-muted" : "text-ui-ink"}`}>{s.title}</h3>
              {hasLive ? (
                <span className="rounded-full bg-ui-live/15 px-2 py-0.5 text-[11px] font-medium text-[#ff8a80]">On air</span>
              ) : hasNext ? (
                <span className="rounded-full bg-ui-accent/15 px-2 py-0.5 text-[11px] font-medium text-[#66c2ff]">Next</span>
              ) : (
                <span className="text-[11px] tabular-nums text-ui-muted">{s.cues.length}</span>
              )}
            </header>
            <div className="px-1.5 pb-1.5">
              {s.cues.map((c) => {
                n++;
                const live = c.id === programId;
                const next = c.id === previewId && !live;
                const done = liveIndex >= 0 && order.indexOf(c.id) < liveIndex;
                const steps = stepsOf(c);
                return (
                  <button
                    key={c.id}
                    data-cue={c.id}
                    onClick={() => onPreview(c.id)}
                    onDoubleClick={() => onTake(c)}
                    className={`relative flex w-full items-center gap-3 rounded-[10px] py-2 pl-3 pr-2.5 text-left transition ${
                      live ? "bg-ui-live/[0.13]" : next ? "bg-ui-s2 shadow-[0_0_0_1px_rgb(var(--ui-accent)/0.55)]" : "hover:bg-ui-s1"
                    }`}
                  >
                    {live && <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-ui-live" />}
                    <span className={`w-5 shrink-0 text-right text-[12px] tabular-nums ${live ? "text-[#ff8a80]" : next ? "text-[#66c2ff]" : "text-ui-muted"}`}>{n}</span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-[14px] font-medium ${live || next ? "text-ui-ink" : done ? "text-ui-muted" : "text-ui-ink/90"}`}>{c.label}</span>
                      <span className={`mt-0.5 block truncate text-[12px] ${done && !live ? "text-ui-muted/60" : "text-ui-muted"}`}>
                        {KIND[c.kind]}
                        {steps > 0 ? ` · ${steps} steps` : ""}
                        {c.note ? ` — ${c.note}` : ""}
                      </span>
                    </span>
                    {live ? (
                      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[#ff8a80]">On air</span>
                    ) : next ? (
                      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[#66c2ff]">Next</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
