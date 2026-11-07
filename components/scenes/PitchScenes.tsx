"use client";

import type { EventId, TimerState } from "@/lib/types";
import { EVENTS } from "@/content/brand";
import { teamById } from "@/content/teams";
import { formatClock, useTimerRemaining } from "@/lib/hooks";
import { accentVar, Backdrop, CornerMark, Img } from "@/components/stage/primitives";

const textGrad = (e: EventId) => (e === "jr" ? "jr-text" : "gold-text");
const accentText = (e: EventId) => (e === "jr" ? "text-amber-jr" : "text-gold");

// Team intro loop — shown while the host announces the team.
export function TeamScene({ teamId, index, total }: { teamId: string; index?: number; total?: number }) {
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
          {team.solo ? "Participant" : "Team"} {index != null ? `${String(index).padStart(2, "0")}${total ? ` / ${total}` : ""}` : ""}
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

// Pitch / Q&A timer. Q&A uses the Q&A video as the background.
export function TimerScene({ event, teamId, phase, timer }: { event: EventId; teamId?: string; phase: "pitch" | "qa"; timer: TimerState }) {
  const remaining = useTimerRemaining(timer);
  const team = teamById(teamId);
  const ev = EVENTS[event];
  const duration = timer.duration || 1;
  const progress = Math.max(0, Math.min(1, remaining / duration));
  const tone = remaining < 0 ? "over" : remaining <= 60 && timer.status !== "idle" ? "warn" : "normal";
  const color = tone === "over" ? "rgb(var(--danger))" : tone === "warn" ? "rgb(var(--warn))" : "#fff";

  return (
    <div className="absolute inset-0">
      <Backdrop brand={event} video={phase === "qa" ? "qaVideo" : undefined} dim={0.65} />
      {tone === "warn" && timer.status === "running" && <div className="edge-warn pointer-events-none absolute inset-0" />}
      {tone === "over" && <div className="edge-over pointer-events-none absolute inset-0" />}

      <div className="absolute left-[110px] right-[110px] top-[90px] flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Img src={ev.logo.onDark} alt={ev.name} style={{ height: 110 }} />
          <span className="h-[70px] w-[3px] bg-white/25" />
          <div>
            <p className={`eyebrow text-[24px] ${accentText(event)}`}>{phase === "qa" ? "Q&A Session" : "Pitching"}</p>
            <p className="mt-1 font-display text-[54px] font-extrabold leading-tight">{team?.name ?? ev.name}</p>
          </div>
        </div>
        {timer.status === "paused" && <p className="eyebrow rounded-full border-2 border-white/40 px-8 py-3 text-[26px] text-white/80">Paused</p>}
      </div>

      <div className="absolute inset-x-0 top-[300px] flex flex-col items-center">
        <p className="tabular font-display font-extrabold leading-none tracking-tight transition-colors duration-500" style={{ fontSize: 420, color, textShadow: "0 20px 80px rgb(0 0 0 / 0.6)" }}>
          {formatClock(remaining)}
        </p>
        <p className="eyebrow mt-4 text-[30px]" style={{ color: tone === "normal" ? "rgb(255 255 255 / 0.65)" : color }}>
          {tone === "over" ? "Time is up" : tone === "warn" ? "Final minute" : phase === "qa" ? "Questions from the judges" : "Time remaining"}
        </p>
      </div>

      <div className="absolute bottom-[110px] left-[160px] right-[160px] h-[22px] overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full transition-[width] duration-300 ease-linear" style={{ width: `${progress * 100}%`, background: tone === "normal" ? `linear-gradient(90deg, rgb(var(--ember)), rgb(var(${accentVar(event)})))` : color }} />
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
