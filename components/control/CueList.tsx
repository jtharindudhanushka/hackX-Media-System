"use client";

import { useEffect, useRef } from "react";
import { stepsOf, type Collection, type Cue, type CueKind } from "@/content/cues";
import { LiveDot } from "@/components/ui/kit";

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

export function CueList({ collection, programId, previewId, onPreview, onTake }: { collection: Collection; programId: string | null; previewId: string | null; onPreview: (id: string) => void; onTake: (c: Cue) => void }) {
  const listRef = useRef<HTMLDivElement>(null);

  // keep the "next" row in view as it moves
  useEffect(() => {
    listRef.current?.querySelector(`[data-cue="${CSS.escape(previewId ?? "")}"]`)?.scrollIntoView({ block: "nearest" });
  }, [previewId]);

  let n = 0;
  return (
    <div ref={listRef} className="px-2 pb-8">
      {collection.sections.map((s) => (
        <div key={s.title}>
          <p className="sticky top-0 z-10 bg-ui-s1 px-3 pb-2 pt-4 text-[12px] font-medium text-ui-muted">{s.title}</p>
          {s.cues.map((c) => {
            n++;
            const live = c.id === programId;
            const next = c.id === previewId;
            const steps = stepsOf(c);
            return (
              <button
                key={c.id}
                data-cue={c.id}
                onClick={() => onPreview(c.id)}
                onDoubleClick={() => onTake(c)}
                className={`flex w-full items-start gap-3 rounded-[10px] px-3 py-2 text-left transition ${
                  next ? "bg-ui-s2 shadow-[0_0_0_1px_rgb(var(--ui-accent)/0.45)]" : live ? "bg-ui-s2" : "hover:bg-ui-s2/60"
                }`}
              >
                <span className="w-5 shrink-0 pt-[3px] text-right text-[12px] tabular-nums text-ui-muted">{n}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={`truncate text-[14px] font-medium ${live || next ? "text-ui-ink" : "text-ui-ink/85"}`}>{c.label}</span>
                    {live && <LiveDot className="shrink-0" />}
                  </span>
                  <span className="mt-0.5 block truncate text-[12px] text-ui-muted">
                    {KIND[c.kind]}
                    {steps > 0 ? ` · ${steps} steps` : ""}
                    {c.note ? ` — ${c.note}` : ""}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
