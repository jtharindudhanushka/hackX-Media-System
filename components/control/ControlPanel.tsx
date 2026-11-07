"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CHANNELS, getChannel } from "@/lib/channels";
import { useChannel } from "@/lib/hooks";
import { serverNow } from "@/lib/clock";
import { setCollection, setOverlay, setStep, take, timerReset, timerToggle } from "@/lib/actions";
import { COLLECTIONS, getCollection, findCue } from "@/content/collections";
import { allCues, stepsOf } from "@/content/cues";
import type { ChannelState } from "@/lib/types";
import { Stage, RenderModeContext } from "@/components/stage/Stage";
import { CueRenderer, ProgramView } from "@/components/scenes/CueRenderer";
import { Btn, Caption, Card, Kbd, LiveDot, Select } from "@/components/ui/kit";
import { ControlGate } from "./ControlGate";
import { CueList } from "./CueList";
import { TimerPanel } from "./TimerPanel";
import { WinnersPanel } from "./WinnersPanel";
import { StatusPills } from "./StatusPills";
import { DisplayPicker } from "./DisplayPicker";
import { PitchControl } from "./PitchControl";

export function ControlPanel({ channelId }: { channelId: string }) {
  if (!getChannel(channelId)) return <p className="ui p-10 text-xl">Unknown channel “{channelId}”.</p>;
  return <ControlGate>{(user) => <Panel channelId={channelId} userLabel={user.label} signOut={user.signOut} />}</ControlGate>;
}

function Panel({ channelId, userLabel, signOut }: { channelId: string; userLabel: string; signOut: (() => void) | null }) {
  const state = useChannel(channelId);
  const coll = getCollection(state.collectionId);
  return (
    <div className="ui flex h-dvh flex-col">
      <TopBar channelId={channelId} state={state} userLabel={userLabel} signOut={signOut} />
      {coll.mode === "pitch" && coll.event ? <PitchControl channelId={channelId} event={coll.event} state={state} /> : <CueControl channelId={channelId} state={state} />}
    </div>
  );
}

function TopBar({ channelId, state, userLabel, signOut }: { channelId: string; state: ChannelState; userLabel: string; signOut: (() => void) | null }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-ui-line px-3">
      <a href="/" className="mr-1 flex items-center rounded-full px-2 py-1 hover:bg-ui-s1" title="Home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/hackx/logo-on-dark.png" alt="hackX" className="h-7" />
      </a>
      <Select value={channelId} onChange={(e) => (window.location.href = `/control/${e.target.value}/`)} title="Channel — which screen you control">
        {CHANNELS.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
      <Select
        value={state.collectionId}
        onChange={(e) => {
          if (confirm(`Load “${getCollection(e.target.value).name}” on ${getChannel(channelId)?.name}? The screen switches to its loop.`)) setCollection(channelId, e.target.value);
        }}
        title="Scene collection"
      >
        {COLLECTIONS.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
      <StatusPills />
      <div className="ml-auto flex items-center gap-2">
        <DisplayPicker channelId={channelId} />
        <Btn size="sm" variant="quiet" onClick={() => window.open(`/output/${channelId}/`, "_blank")} title="Open the output in a normal tab (e.g. for window capture)">
          Output tab ↗
        </Btn>
        <span className="mx-1 h-5 w-px bg-ui-line" />
        <span className="max-w-[180px] truncate text-[13px] text-ui-muted">{userLabel}</span>
        {signOut && (
          <Btn size="sm" variant="quiet" onClick={signOut}>
            Sign out
          </Btn>
        )}
      </div>
    </header>
  );
}

// ── Cue-list control (opening & closing ceremonies) ──────────────────────

function CueControl({ channelId, state }: { channelId: string; state: ChannelState }) {
  const coll = getCollection(state.collectionId);
  const cues = useMemo(() => allCues(coll), [coll]);
  const program = findCue(state.collectionId, state.program.cueId);
  const programIndex = program ? cues.findIndex((c) => c.id === program.id) : -1;

  // Preview is local to this operator (not synced).
  const [previewId, setPreviewId] = useState<string | null>(null);
  const preview = cues.find((c) => c.id === previewId) ?? cues[programIndex + 1] ?? cues[0];
  const previewIndex = cues.indexOf(preview);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const previewTakenAt = useMemo(() => serverNow(), [preview?.id]);
  useEffect(() => setPreviewId(null), [state.collectionId]);

  const programSteps = program ? stepsOf(program) : 0;
  const stepsLeft = program ? programSteps - state.program.step : 0;

  const takePreview = useCallback(() => {
    if (!preview) return;
    take(channelId, preview);
    setPreviewId(cues[previewIndex + 1]?.id ?? preview.id);
  }, [channelId, preview, previewIndex, cues]);

  const go = useCallback(() => {
    if (program && state.program.step < programSteps) return setStep(channelId, state.program.step + 1);
    takePreview();
  }, [channelId, program, programSteps, state.program.step, takePreview]);

  const movePreview = useCallback((d: number) => setPreviewId(cues[Math.max(0, Math.min(cues.length - 1, previewIndex + d))]?.id ?? null), [cues, previewIndex]);

  const keyRef = useRef<(e: KeyboardEvent) => void>();
  keyRef.current = (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA" || e.metaKey || e.ctrlKey) return;
    const k = e.key.toLowerCase();
    if (e.key === " ") {
      e.preventDefault();
      go();
    } else if (e.key === "Enter") takePreview();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      movePreview(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      movePreview(-1);
    } else if (e.key === "ArrowLeft" && program && state.program.step > 0) setStep(channelId, state.program.step - 1);
    else if (k === "b") setOverlay(channelId, state.overlay === "black" ? "none" : "black");
    else if (k === "p" || e.key === "Escape") setOverlay(channelId, state.overlay === "panic" ? "none" : "panic");
    else if (k === "s") timerToggle(channelId, state.timer.status === "running");
    else if (k === "r") timerReset(channelId);
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => keyRef.current?.(e);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const hasTimer = cues.some((c) => c.kind === "timer");
  const hasWinners = cues.some((c) => c.kind === "winner");

  return (
    <div className="flex min-h-0 flex-1 gap-3 p-3">
      <Card className="thin-scroll w-[360px] shrink-0 overflow-y-auto">
        <CueList
          collection={coll}
          programId={program?.id ?? null}
          previewId={preview?.id ?? null}
          onPreview={setPreviewId}
          onTake={(c) => {
            take(channelId, c);
            setPreviewId(cues[cues.indexOf(c) + 1]?.id ?? c.id);
          }}
        />
      </Card>

      <main className="thin-scroll flex min-w-0 flex-1 flex-col gap-3 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          <Monitor label="Next" sub={preview?.label} live={false}>
            {preview && <CueRenderer cue={preview} step={stepsOf(preview)} state={state} takenAt={previewTakenAt} fallbackBrand={coll.brand} />}
          </Monitor>
          <Monitor label="On air" sub={state.overlay !== "none" ? `${state.overlay} on` : (program?.label ?? `${coll.name} — loop`)} live>
            <ProgramView state={state} />
          </Monitor>
        </div>

        <div className="flex items-stretch gap-2">
          <button onClick={go} className="group flex min-w-0 flex-1 items-center gap-5 rounded-full bg-white py-3 pl-7 pr-3 text-left text-black transition active:scale-[0.99]">
            <span className="ui-display text-[34px]">Go</span>
            <span className="min-w-0 flex-1 truncate text-[15px] text-black/60">
              {stepsLeft > 0 ? `Reveal next — ${stepsLeft} step${stepsLeft > 1 ? "s" : ""} left` : preview ? preview.label : "—"}
            </span>
            <span className="rounded-full bg-black/5 px-3 py-1.5 font-mono text-[12px] text-black/50">Space</span>
          </button>
          <Btn size="xl" variant={state.overlay === "panic" ? "live" : "secondary"} onClick={() => setOverlay(channelId, state.overlay === "panic" ? "none" : "panic")}>
            {state.overlay === "panic" ? "Panic on" : "Panic"}
          </Btn>
          <Btn size="xl" variant={state.overlay === "black" ? "primary" : "secondary"} onClick={() => setOverlay(channelId, state.overlay === "black" ? "none" : "black")}>
            {state.overlay === "black" ? "Black on" : "Black"}
          </Btn>
          {program && programSteps > 0 && (
            <Btn size="xl" variant="quiet" onClick={() => setStep(channelId, state.program.step - 1)} disabled={state.program.step === 0}>
              Step back
            </Btn>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Note label="On air — note" text={program?.note} />
          <Note label="Next — note" text={preview?.note} />
        </div>

        <p className="px-1 text-[12px] leading-relaxed text-ui-muted">
          <Kbd>Space</Kbd> go · <Kbd>Enter</Kbd> take next · <Kbd>↑</Kbd><Kbd>↓</Kbd> choose next · <Kbd>←</Kbd> step back · <Kbd>P</Kbd> panic · <Kbd>B</Kbd> black · double-click a cue to take it now
        </p>
      </main>

      {(hasTimer || hasWinners) && (
        <aside className="thin-scroll w-[320px] shrink-0 space-y-3 overflow-y-auto">
          {hasTimer && <TimerPanel channelId={channelId} timer={state.timer} />}
          {hasWinners && <WinnersPanel channelId={channelId} collection={coll} overrides={state.overrides} />}
        </aside>
      )}
    </div>
  );
}

function Monitor({ label, sub, live, children }: { label: string; sub?: string; live: boolean; children: React.ReactNode }) {
  return (
    <Card className="p-2">
      <div className="mb-2 flex items-center gap-2 px-2 pt-1">
        {live ? <LiveDot /> : <span className="h-2 w-2 rounded-full bg-ui-accent" />}
        <Caption className="!text-ui-ink">{label}</Caption>
        <span className="min-w-0 truncate text-[12px] text-ui-muted">{sub}</span>
      </div>
      <div className={`aspect-video overflow-hidden rounded-[12px] bg-black ${live ? "shadow-[0_0_0_1px_rgb(var(--ui-live)/0.6)]" : ""}`}>
        <RenderModeContext.Provider value={{ monitor: true, audio: false }}>
          <Stage>{children}</Stage>
        </RenderModeContext.Provider>
      </div>
    </Card>
  );
}

function Note({ label, text }: { label: string; text?: string }) {
  return (
    <Card className="px-4 py-3">
      <Caption>{label}</Caption>
      <p className="mt-1 text-[14px] leading-snug text-ui-ink/90">{text ?? "—"}</p>
    </Card>
  );
}
