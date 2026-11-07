"use client";

import type { Brand, EventId } from "@/lib/types";
import type { WinnerPlace } from "@/content/cues";
import { EVENTS } from "@/content/brand";
import { teamById } from "@/content/teams";
import { accentVar, Backdrop, Confetti, CornerMark, CountUp, formatRs, Img } from "@/components/stage/primitives";

const PLACE_LABEL: Record<WinnerPlace, string> = {
  champion: "Champions",
  first: "First Runners-Up",
  second: "Second Runners-Up",
  popular: "Most Popular Team",
};

// Cash prizes — GO reveals one place at a time, in group order.
export function PrizesScene({ brand, groups, step }: { brand: Brand; groups: readonly { event: EventId; places: readonly { label: string; amount: number }[] }[]; step: number }) {
  let n = 0;
  return (
    <div className="absolute inset-0">
      <Backdrop brand={brand} still />
      <CornerMark brand={brand} />
      <p className="eyebrow absolute inset-x-0 top-[90px] text-center text-[30px] text-gold">Grand Finals</p>
      <h1 className="absolute inset-x-0 top-[140px] text-center font-display text-[92px] font-extrabold tracking-tight">Cash Prizes</h1>
      <div className="absolute inset-x-[120px] top-[330px] flex justify-center gap-[80px]">
        {groups.map((g) => {
          const ev = EVENTS[g.event];
          return (
            <div key={g.event} className="w-[780px]">
              <div className="mb-8 flex h-[130px] items-center justify-center">
                <Img src={ev.logo.onDark} alt={ev.name} style={{ height: 120 }} />
              </div>
              <div className="flex flex-col gap-6">
                {g.places
                  .map((p) => ({ ...p, i: n++ }))
                  .map((p) => {
                    const shown = p.i < step;
                    const champ = /champion/i.test(p.label);
                    return (
                      <div
                        key={p.label}
                        className="flex items-center justify-between gap-6 rounded-[28px] border px-9 transition-all duration-700"
                        style={{
                          height: champ ? 170 : 140,
                          opacity: shown ? 1 : 0.18,
                          transform: shown ? "none" : "scale(0.97)",
                          borderColor: champ && shown ? `rgb(var(${accentVar(g.event)}))` : "rgb(255 255 255 / 0.15)",
                          background: champ && shown ? `linear-gradient(90deg, rgb(var(${accentVar(g.event)}) / 0.25), rgb(255 255 255 / 0.04))` : "rgb(255 255 255 / 0.05)",
                        }}
                      >
                        <p className={`whitespace-nowrap font-display font-bold ${champ ? "text-[42px]" : "text-[32px]"}`}>{p.label}</p>
                        <p className={`tabular font-display font-extrabold ${champ ? "gold-text text-[62px]" : "text-[46px]"}`}>{shown ? <CountUp to={p.amount} /> : "Rs. ———"}</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Winner — step 0: suspense card ("And the team is…"), step 1: the reveal.
// The team comes from the control panel (overrides[slot]), never hard-coded.
export function WinnerScene({ event, place, teamId, prize, revealed }: { event: EventId; place: WinnerPlace; teamId?: string; prize?: number; revealed: boolean }) {
  const ev = EVENTS[event];
  const team = teamById(teamId);
  const label = PLACE_LABEL[place];
  const champ = place === "champion";

  if (!revealed) {
    return (
      <div className="absolute inset-0">
        <Backdrop brand={event} dim={0.7} />
        <div className="rays spin-slow absolute left-1/2 top-1/2 h-[2400px] w-[2400px] -translate-x-1/2 -translate-y-1/2 opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <Img src={ev.logo.onDark} alt={ev.name} className="rise" style={{ height: 170 }} />
          <p className="eyebrow rise mt-14 text-[36px] text-white/75" style={{ animationDelay: "0.15s" }}>
            {ev.name}
          </p>
          <h1 className={`rise mt-4 font-display text-[130px] font-extrabold leading-none tracking-tight ${event === "jr" ? "jr-text" : "gold-text"}`} style={{ animationDelay: "0.3s" }}>
            {label}
          </h1>
          <p className="pulse-glow mt-16 font-display text-[56px] font-semibold text-white/90">And the team is…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <Backdrop brand={event} dim={0.6} />
      <div className="rays spin-slow absolute left-1/2 top-[48%] h-[2600px] w-[2600px] -translate-x-1/2 -translate-y-1/2" />
      <div className="pulse-glow absolute left-1/2 top-[48%] h-[900px] w-[1500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" style={{ background: `rgb(var(${accentVar(event)}) / 0.35)` }} />
      <Confetti seed={place.length + event.length} count={champ ? 140 : 90} />
      <div className="absolute left-[110px] top-[80px]">
        <Img src={ev.logo.onDark} alt={ev.name} style={{ height: 110 }} />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-[100px] text-center">
        <p className={`eyebrow rise text-[40px] ${event === "jr" ? "text-amber-jr" : "text-gold"}`}>
          {ev.name} · {label}
        </p>
        <h1 className="slam mt-8 font-display font-extrabold leading-[0.95] tracking-tight text-white" style={{ fontSize: (team?.name.length ?? 10) > 14 ? 170 : 220, textShadow: "0 20px 90px rgb(0 0 0 / 0.7)" }}>
          {team ? team.name : "[Team Name]"}
        </h1>
        {team?.project && (
          <p className="rise mt-10 max-w-[1300px] text-[40px] font-medium text-white/80" style={{ animationDelay: "0.6s" }}>
            {team.project}
          </p>
        )}
        {prize != null && (
          <div className="rise mt-14 rounded-full border-2 px-14 py-5" style={{ animationDelay: "0.9s", borderColor: `rgb(var(${accentVar(event)}))`, background: "rgb(0 0 0 / 0.35)" }}>
            <p className="tabular gold-text font-display text-[64px] font-extrabold">{formatRs(prize)}</p>
          </div>
        )}
        {!team && <p className="mt-10 font-mono text-[24px] text-white/50">Pick the team in the control panel → Winners</p>}
      </div>
    </div>
  );
}
