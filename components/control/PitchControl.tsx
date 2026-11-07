"use client";

// Pitching-room control: three columns, left to right —
//   SCENE  what the screen shows (Still · Team intro · Pitching …)
//   TEAM   which team's name is used (or none)
//   TIMER  phase, start/pause, nudge, live-editable durations

import { useEffect, useRef, useState } from "react";
import type { ChannelState, EventId, PitchScene } from "@/lib/types";
import { formatClock, useTimerRemaining } from "@/lib/hooks";
import { pitchDuration, pitchPhase, pitchScene, pitchTeam, setOverlay, timerAdjust, timerReset, timerSetRemaining, timerToggle } from "@/lib/actions";
import { EVENTS } from "@/content/brand";
import { PITCH_RULES, teamById, teamsOf } from "@/content/teams";
import { Stage, RenderModeContext } from "@/components/stage/Stage";
import { ProgramView } from "@/components/scenes/CueRenderer";
import { Btn, Caption, Card, ConfirmBtn, Field, Kbd, LiveDot, Segmented } from "@/components/ui/kit";

const SCENES: { id: PitchScene; title: string; hint: string; key: string; primary?: boolean }[] = [
  { id: "still", title: "Still", hint: "Event logo, no motion", key: "1", primary: true },
  { id: "intro", title: "Team intro", hint: "Selected team, animated", key: "2", primary: true },
  { id: "timer", title: "Pitching", hint: "Timer + team name", key: "3", primary: true },
  { id: "loop", title: "Loop", hint: "Breaks, lunch, tea", key: "4" },
  { id: "video", title: "Pitching begins video", hint: "Plays once, then still", key: "5" },
];

function parseDuration(v: string): number {
  const t = v.trim();
  if (!t) return 0;
  if (t.includes(":")) {
    const [m, s] = t.split(":");
    return (parseInt(m, 10) || 0) * 60 + (parseInt(s, 10) || 0);
  }
  return Math.round(parseFloat(t) * 60) || 0;
}

export function PitchControl({ channelId, event, state }: { channelId: string; event: EventId; state: ChannelState }) {
  const p = state.pitch;
  const teams = teamsOf(event);
  const team = teamById(p.teamId);
  const rules = PITCH_RULES[event];
  const pitchSec = p.pitchSec || rules.pitch;
  const qaSec = team?.translator ? rules.qaTranslator : p.qaSec || rules.qa;
  const running = state.timer.status === "running";
  const teamIndex = teams.findIndex((t) => t.id === p.teamId);
  const nextTeam = teams[teamIndex + 1] ?? null;

  const selectTeam = (id: string | null) => {
    if (running && !confirm("The timer is running. Switch team anyway? (the clock keeps running)")) return;
    pitchTeam(channelId, id, pitchSec);
  };
  const setPhase = (ph: "pitch" | "qa") => {
    if (ph === p.phase) return;
    if (running && !confirm("The timer is running. Switch phase and load a fresh clock?")) return;
    pitchPhase(channelId, ph, ph === "pitch" ? pitchSec : qaSec);
  };

  // A channel that never had a clock shows the phase time and loads it on Start.
  const phaseSec = p.phase === "pitch" ? pitchSec : qaSec;
  const toggle = () => {
    if (state.timer.duration === 0) pitchPhase(channelId, p.phase, phaseSec);
    timerToggle(channelId, running);
  };

  // keyboard
  const keys = useRef<(e: KeyboardEvent) => void>();
  keys.current = (e) => {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA" || e.metaKey || e.ctrlKey) return;
    const sc = SCENES.find((s) => s.key === e.key);
    if (sc) return pitchScene(channelId, sc.id);
    const k = e.key.toLowerCase();
    if (k === "s" || e.key === " ") {
      e.preventDefault();
      toggle();
    } else if (k === "q") setPhase(p.phase === "pitch" ? "qa" : "pitch");
    else if (k === "p" || e.key === "Escape") setOverlay(channelId, state.overlay === "panic" ? "none" : "panic");
    else if (k === "b") setOverlay(channelId, state.overlay === "black" ? "none" : "black");
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => keys.current?.(e);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[minmax(320px,1fr)_minmax(300px,1fr)_minmax(340px,1.05fr)] gap-3 p-3">
      {/* ── SCENE ─────────────────────────────────────────── */}
      <section className="thin-scroll flex min-h-0 flex-col gap-3 overflow-y-auto">
        <ColumnHead n="1" title="Scene" />
        <Card className="p-2">
          <div className="mb-2 flex items-center gap-2 px-2 pt-1">
            <LiveDot />
            <Caption className="!text-ui-ink">On air</Caption>
            {state.overlay !== "none" && <span className="ml-auto rounded-full bg-ui-live px-2 py-0.5 text-[11px] font-semibold uppercase">{state.overlay}</span>}
          </div>
          <div className="aspect-video overflow-hidden rounded-[12px] bg-black">
            <RenderModeContext.Provider value={{ monitor: true, audio: false }}>
              <Stage>
                <ProgramView state={state} />
              </Stage>
            </RenderModeContext.Provider>
          </div>
        </Card>

        <div className="flex flex-col gap-1.5">
          {SCENES.map((s) => {
            const on = p.scene === s.id;
            const needsTeam = s.id === "intro" && !team;
            return (
              <button
                key={s.id}
                onClick={() => pitchScene(channelId, s.id)}
                className={`group flex items-center gap-4 rounded-[15px] px-4 text-left transition ${s.primary ? "h-[68px]" : "h-12"} ${on ? "bg-ui-s2 shadow-[0_0_0_1px_rgb(var(--ui-accent)/0.45)]" : "bg-ui-s1 hover:bg-ui-s2"}`}
              >
                <span className="min-w-0 flex-1">
                  <span className={`block font-medium tracking-[-0.02em] ${s.primary ? "text-[19px]" : "text-[15px]"} ${on ? "text-ui-ink" : "text-ui-ink/85"}`}>{s.title}</span>
                  {s.primary && <span className="block truncate text-[13px] text-ui-muted">{needsTeam ? "Pick a team first — shows the loop until then" : s.hint}</span>}
                </span>
                {on ? <LiveDot /> : <Kbd>{s.key}</Kbd>}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Btn variant={state.overlay === "panic" ? "live" : "secondary"} onClick={() => setOverlay(channelId, state.overlay === "panic" ? "none" : "panic")}>
            {state.overlay === "panic" ? "Panic on" : "Panic → loop"} <Kbd>P</Kbd>
          </Btn>
          <Btn variant={state.overlay === "black" ? "primary" : "secondary"} onClick={() => setOverlay(channelId, state.overlay === "black" ? "none" : "black")}>
            {state.overlay === "black" ? "Black on" : "Black"} <Kbd>B</Kbd>
          </Btn>
        </div>
      </section>

      {/* ── TEAM ──────────────────────────────────────────── */}
      <section className="flex min-h-0 flex-col gap-3">
        <ColumnHead n="2" title="Team" right={<span className="text-[13px] text-ui-muted">{teams.length} teams</span>} />
        <Card className="thin-scroll flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2">
          <TeamRow selected={!p.teamId} onClick={() => selectTeam(null)} title="No team name" sub="Timer shows the event name only" />
          <div className="mx-3 my-1 h-px bg-ui-line" />
          {teams.map((t, i) => (
            <TeamRow
              key={t.id}
              n={i + 1}
              selected={t.id === p.teamId}
              onClick={() => selectTeam(t.id)}
              title={t.name}
              sub={t.project}
              tags={[t.solo && "Solo", t.translator && "Translator · Q&A 10:00"].filter(Boolean) as string[]}
            />
          ))}
        </Card>
        <ConfirmBtn
          size="lg"
          variant="secondary"
          disabled={!nextTeam}
          confirmLabel={nextTeam ? `Tap again — ${nextTeam.name} intro` : ""}
          onConfirm={() => {
            if (!nextTeam) return;
            pitchTeam(channelId, nextTeam.id, pitchSec);
            pitchScene(channelId, "intro");
          }}
        >
          {nextTeam ? (
            <>
              {team ? "Next team" : "First team"} <span className="text-ui-muted">→ {nextTeam.name}</span>
            </>
          ) : (
            "Last team"
          )}
        </ConfirmBtn>
      </section>

      {/* ── TIMER ─────────────────────────────────────────── */}
      <section className="thin-scroll flex min-h-0 flex-col gap-3 overflow-y-auto">
        <ColumnHead n="3" title="Timer" />
        <TimerCard channelId={channelId} state={state} teamName={team?.name ?? EVENTS[event].name} emptySeconds={phaseSec} onToggle={toggle} />
        <Segmented
          size="lg"
          value={p.phase}
          onChange={setPhase}
          options={[
            { value: "pitch", label: `Pitch · ${formatClock(pitchSec)}` },
            { value: "qa", label: `Q&A · ${formatClock(qaSec)}` },
          ]}
        />
        <Card className="p-4">
          <Caption>Durations — saved live; a clock that hasn’t started follows</Caption>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <DurationField label="Pitch" seconds={pitchSec} onSave={(s) => pitchDuration(channelId, "pitch", s)} />
            <DurationField label="Q&A" seconds={p.qaSec || rules.qa} onSave={(s) => pitchDuration(channelId, "qa", s)} />
          </div>
          {team?.translator && <p className="mt-3 text-[13px] text-ui-muted">{team.name} has translator support — Q&A uses {formatClock(rules.qaTranslator)}.</p>}
        </Card>
        <p className="px-1 text-[12px] leading-relaxed text-ui-muted">
          <Kbd>1</Kbd>–<Kbd>5</Kbd> scenes · <Kbd>S</Kbd>/<Kbd>Space</Kbd> start/pause · <Kbd>Q</Kbd> pitch ↔ Q&A · <Kbd>P</Kbd> panic · <Kbd>B</Kbd> black
        </p>
      </section>
    </div>
  );
}

function ColumnHead({ n, title, right }: { n: string; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2.5 px-1 pt-1">
      <span className="text-[13px] tabular-nums text-ui-muted">{n}</span>
      <h2 className="ui-display text-[28px]">{title}</h2>
      <span className="ml-auto">{right}</span>
    </div>
  );
}

function TeamRow({ n, title, sub, tags = [], selected, onClick }: { n?: number; title: string; sub?: string; tags?: string[]; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left transition ${selected ? "bg-ui-s2 shadow-[0_0_0_1px_rgb(var(--ui-accent)/0.45)]" : "hover:bg-ui-s2/60"}`}
    >
      <span className="w-6 shrink-0 text-right text-[13px] tabular-nums text-ui-muted">{n != null ? String(n).padStart(2, "0") : "—"}</span>
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-[15px] font-medium ${selected ? "text-ui-ink" : "text-ui-ink/90"}`}>{title}</span>
        {(sub || tags.length > 0) && (
          <span className="block truncate text-[12px] text-ui-muted">
            {tags.length > 0 && <span className="text-ui-ink/70">{tags.join(" · ")}{sub ? " — " : ""}</span>}
            {sub}
          </span>
        )}
      </span>
      <span className={`h-4 w-4 shrink-0 rounded-full border ${selected ? "border-[5px] border-ui-accent" : "border-ui-line"}`} />
    </button>
  );
}

function TimerCard({ channelId, state, teamName, emptySeconds, onToggle }: { channelId: string; state: ChannelState; teamName: string; emptySeconds: number; onToggle: () => void }) {
  const t = state.timer.duration === 0 ? { ...state.timer, duration: emptySeconds, remaining: emptySeconds } : state.timer;
  const remaining = useTimerRemaining(t);
  const running = t.status === "running";
  const [scrub, setScrub] = useState<number | null>(null);
  const shown = scrub ?? remaining;
  const tone = shown < 0 ? "text-[#ff6b5e]" : shown <= 60 && t.status !== "idle" ? "text-[#ffd166]" : "text-white";
  const progress = t.duration > 0 ? Math.max(0, Math.min(1, remaining / t.duration)) : 0;
  const commit = () => {
    if (scrub != null) timerSetRemaining(channelId, scrub);
    setScrub(null);
  };

  return (
    <div className="ui-spotlight rounded-[30px] p-6">
      <div className="flex items-center justify-between text-[13px] text-white/75">
        <span className="truncate">{teamName}</span>
        <span className="shrink-0">{state.pitch.phase === "qa" ? "Q&A" : "Pitch"} · {t.status === "idle" ? "ready" : t.status}</span>
      </div>
      <p className={`ui-display tabular-nums mt-3 text-center text-[96px] ${tone}`}>{formatClock(shown)}</p>

      <div className="mt-4 h-[64px]">
        {running ? (
          <div>
            <div className="h-1.5 overflow-hidden rounded-full bg-black/30">
              <div className="h-full rounded-full bg-white transition-[width] duration-300 ease-linear" style={{ width: `${progress * 100}%` }} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Btn size="sm" className="bg-black/25 text-white hover:bg-black/40" onClick={() => timerAdjust(channelId, -30)}>−30s</Btn>
              <Btn size="sm" className="bg-black/25 text-white hover:bg-black/40" onClick={() => timerAdjust(channelId, 30)}>+30s</Btn>
            </div>
          </div>
        ) : (
          <div>
            <input
              type="range"
              min={0}
              max={Math.max(t.duration, shown, 60)}
              step={5}
              value={Math.max(0, shown)}
              onChange={(e) => setScrub(Number(e.target.value))}
              onPointerUp={commit}
              onKeyUp={commit}
              onBlur={commit}
              aria-label="Set time remaining"
              className="h-1.5 w-full cursor-pointer accent-white"
            />
            <div className="mt-2 grid grid-cols-4 gap-2">
              {[-30, -10, 10, 30].map((d) => (
                <Btn key={d} size="sm" className="bg-black/25 tabular-nums text-white hover:bg-black/40" onClick={() => timerSetRemaining(channelId, remaining + d)}>
                  {d > 0 ? `+${d}s` : `−${-d}s`}
                </Btn>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Btn size="xl" variant="primary" className={`col-span-2 ${running ? "!bg-black/35 !text-white" : ""}`} onClick={onToggle}>
          {running ? "Pause" : t.status === "paused" ? "Resume" : "Start"}
        </Btn>
        <ConfirmBtn size="xl" className="bg-black/25 text-white hover:bg-black/40" confirmLabel="Reset?" disabled={t.status === "idle" && t.remaining === t.duration} onConfirm={() => timerReset(channelId)}>
          Reset
        </ConfirmBtn>
      </div>
    </div>
  );
}

function DurationField({ label, seconds, onSave }: { label: string; seconds: number; onSave: (s: number) => void }) {
  const [v, setV] = useState(formatClock(seconds));
  useEffect(() => setV(formatClock(seconds)), [seconds]);
  const save = () => {
    const s = parseDuration(v);
    if (s > 0 && s !== seconds) onSave(s);
    else setV(formatClock(seconds));
  };
  return (
    <label className="block">
      <span className="text-[13px] text-ui-muted">{label}</span>
      <Field value={v} onChange={(e) => setV(e.target.value)} onBlur={save} onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()} className="mt-1 w-full tabular-nums" inputMode="numeric" />
    </label>
  );
}
