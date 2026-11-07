"use client";

import { useState } from "react";
import type { TimerState } from "@/lib/types";
import { formatClock, useTimerRemaining } from "@/lib/hooks";
import { timerAdjust, timerReset, timerSet, timerToggle } from "@/lib/actions";
import { Btn, Caption, Card, Field } from "@/components/ui/kit";

// Compact timer for cue-list collections (pitching rooms use PitchControl).
export function TimerPanel({ channelId, timer }: { channelId: string; timer: TimerState }) {
  const remaining = useTimerRemaining(timer);
  const running = timer.status === "running";
  const [mins, setMins] = useState("");
  const tone = remaining < 0 ? "text-[#ff6b5e]" : remaining <= 60 && timer.status !== "idle" ? "text-[#ffd166]" : "text-ui-ink";

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <Caption>Timer</Caption>
        <Caption>{timer.status === "idle" ? "ready" : timer.status}</Caption>
      </div>
      <p className={`ui-display tabular-nums mt-2 text-center text-[56px] ${tone}`}>{formatClock(remaining)}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Btn size="lg" variant="primary" className="col-span-2" onClick={() => timerToggle(channelId, running)}>
          {running ? "Pause" : timer.status === "paused" ? "Resume" : "Start"}
        </Btn>
        <Btn onClick={() => timerAdjust(channelId, -30)}>−30s</Btn>
        <Btn onClick={() => timerAdjust(channelId, 30)}>+30s</Btn>
        <Btn variant="quiet" className="col-span-2" onClick={() => timerReset(channelId)}>
          Reset to {formatClock(timer.duration)}
        </Btn>
      </div>
      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const m = parseFloat(mins);
          if (m > 0) timerSet(channelId, Math.round(m * 60));
          setMins("");
        }}
      >
        <Field value={mins} onChange={(e) => setMins(e.target.value)} placeholder="Set minutes" inputMode="decimal" className="flex-1" />
        <Btn type="submit">Set</Btn>
      </form>
    </Card>
  );
}
