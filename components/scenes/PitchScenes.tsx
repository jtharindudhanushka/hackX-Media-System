"use client";

import type { EventId, TimerState } from "@/lib/types";
import { EVENTS, TITLE_PARTNERS } from "@/content/brand";
import { teamById } from "@/content/teams";
import { useTimerRemaining } from "@/lib/hooks";
import { RingTimer, type TimerTone } from "@/components/stage/RingTimer";
import { accentVar, Backdrop, CornerMark, Img } from "@/components/stage/primitives";

const textGrad = (e: EventId) => (e === "jr" ? "jr-text" : "gold-text");
const accentText = (e: EventId) => (e === "jr" ? "text-amber-jr" : "text-gold");

// Team intro loop — shown while the host announces the team.
// The running order is shown as a number only — never "x of y".
export function TeamScene({ teamId, index }: { teamId: string; index?: number; total?: number }) {
  const team = teamById(teamId);
  if (!team) return <MissingTeam id={teamId} />;
  const ev = EVENTS[team.event];
  const long = team.name.length > 14;
  return (
    <div className="absolute inset-0">
      <Backdrop brand={team.event} />
      {/* big outline number behind */}
      {index != null && (
        <p className="pointer-events-none absolute -right-[30px] bottom-[-120px] font-display text-[720px] font-extrabold leading-none text-transparent" style={{ WebkitTextStroke: `3px rgb(var(${accentVar(team.event)}) / 0.25)` }}>
          {String(index).padStart(2, "0")}
        </p>
      )}
      <div className="absolute left-[130px] top-[110px] flex items-center gap-8">
        <Img src={ev.logo.onDark} alt={ev.name} style={{ height: 120 }} />
        <span className="h-[80px] w-[3px] bg-white/25" />
        <p className="eyebrow text-[26px] text-white/75">Grand Finals · Pitching</p>
      </div>
      <div className="absolute inset-x-[130px] top-[360px]">
        <p className={`eyebrow rise text-[34px] ${accentText(team.event)}`}>
          {team.solo ? "Participant" : "Team"} {index != null ? String(index).padStart(2, "0") : ""}
        </p>
        <h1 className={`slam mt-6 font-display font-extrabold leading-[0.95] tracking-tight ${textGrad(team.event)}`} style={{ fontSize: long ? 150 : 200 }}>
          {team.name}
        </h1>
        {team.project && (
          <p className="rise mt-12 max-w-[1250px] text-[46px] font-medium leading-snug text-white/85" style={{ animationDelay: "0.5s" }}>
            {team.project}
          </p>
        )}
        {team.members && team.members.length > 0 && (
          <div className="rise mt-10 flex flex-wrap gap-4" style={{ animationDelay: "0.7s" }}>
            {team.members.map((m) => (
              <span key={m} className="rounded-full border border-white/25 bg-white/10 px-7 py-3 text-[30px] font-semibold">
                {m}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MissingTeam({ id }: { id: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-abyss text-[40px] text-white/70">
      Team “{id}” not found in content/teams.ts
    </div>
  );
}

// Pitch / Q&A timer — the ideaX ring design. Q&A uses the Q&A video as backdrop.
function formatTime(sec: number) {
  const abs = Math.abs(Math.round(sec));
  return `${sec < 0 ? "-" : ""}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}

export function TimerScene({ event, teamId, phase, timer }: { event: EventId; teamId?: string; phase: "pitch" | "qa"; timer: TimerState }) {
  const remaining = useTimerRemaining(timer);
  const team = teamById(teamId);
  const ev = EVENTS[event];
  const duration = timer.duration;
  const over = remaining < 0;
  const tone: TimerTone = over ? "over" : remaining <= 60 && timer.status !== "idle" ? "warn" : "normal";
  // overtime: full red ring, gently pulsing
  const progress = over ? 1 : duration > 0 ? remaining / duration : 1;
  const alert = over ? "pulse" : timer.status === "running" && remaining <= 30 ? "flash" : undefined;
  const size = 860;
  const timeColor = tone === "over" ? "#F87171" : tone === "warn" ? "#FCD34D" : "#fff";
  const status = over
    ? { label: "Time's up", color: "#F87171" }
    : timer.status === "paused"
      ? { label: "Paused", color: "#FCD34D" }
      : timer.status === "idle"
        ? { label: "Ready", color: "rgb(255 255 255 / 0.55)" }
        : null;

  return (
    <div className="absolute inset-0">
      <Backdrop brand={event} video={phase === "qa" ? "qaVideo" : undefined} dim={0.65} />
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 55% at 50% 50%, rgb(255 255 255 / 0.06), transparent 70%)" }} />
      {alert === "flash" && <div className="edge-warn pointer-events-none absolute inset-0" />}
      {alert === "pulse" && <div className="edge-over pointer-events-none absolute inset-0" />}

      <Img src={ev.logo.onDark} alt={ev.name} className="absolute left-[80px] top-[64px]" style={{ height: 96 }} />

      {/* title partners, top right */}
      <div className="absolute right-[80px] top-[64px] flex items-center gap-[40px]">
        {TITLE_PARTNERS.map((p) => (
          <Img key={p.id} src={p.onDark ?? p.logo!} alt={p.name} style={{ height: 84 }} />
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center pt-[40px]">
        <RingTimer event={event} progress={progress} tone={tone} alert={alert} size={size}>
          {team && (
            <p className="mb-[22px] line-clamp-2 max-w-[78%] font-display font-bold leading-[1.05] tracking-[-0.02em] text-white/90" style={{ fontSize: size * (team.name.length > 16 ? 0.05 : 0.06) }}>
              {team.name}
            </p>
          )}
          <div className="tabular font-display font-extrabold leading-none tracking-[-0.04em] transition-colors duration-500" style={{ fontSize: size * (over ? 0.17 : 0.205), color: timeColor }}>
            {formatTime(remaining)}
          </div>
          <p className="mt-[20px] font-extrabold uppercase tracking-[0.2em]" style={{ fontSize: size * 0.032 }}>
            <span style={{ color: event === "jr" ? "rgb(var(--jr-glow))" : "rgb(var(--glow))" }}>{phase === "qa" ? "Q&A" : "Pitch"}</span>
            {status ? <span style={{ color: status.color }}> · {status.label}</span> : <span className="text-white/55"> / {formatTime(duration)}</span>}
          </p>
        </RingTimer>
      </div>
    </div>
  );
}

export function GuidelinesScene({ event, title, bullets }: { event: EventId; title?: string; bullets: readonly string[] }) {
  const ev = EVENTS[event];
  const two = bullets.length > 6;
  return (
    <div className="absolute inset-0">
      <Backdrop brand={event} />
      <div className="absolute left-[120px] right-[120px] top-[80px] flex items-center gap-8">
        <Img src={ev.logo.onDark} alt={ev.name} style={{ height: 120 }} />
        <span className="h-[80px] w-[3px] bg-white/25" />
        <div>
          <p className={`eyebrow text-[24px] ${accentText(event)}`}>Grand Finals</p>
          <h1 className="font-display text-[68px] font-extrabold leading-tight tracking-tight">{title ?? `${ev.name} Guidelines`}</h1>
        </div>
      </div>
      <ol className={`absolute left-[120px] right-[120px] top-[300px] grid gap-x-[70px] gap-y-[30px] ${two ? "grid-cols-2" : "grid-cols-1"}`}>
        {bullets.map((b, i) => (
          <li key={i} className="rise flex items-start gap-7" style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
            <span className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-2xl font-display text-[30px] font-extrabold text-abyss" style={{ background: `rgb(var(${accentVar(event)}))` }}>
              {i + 1}
            </span>
            <p className={`${two ? "text-[31px]" : "text-[38px]"} pt-[6px] font-medium leading-snug text-white/90`}>{b}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
