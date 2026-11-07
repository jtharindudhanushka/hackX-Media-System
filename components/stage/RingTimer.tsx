"use client";

// Glassy ring countdown — the ideaX semi-finals design, on the 1920×1080 stage.
// A raised base ring, a glowing progress arc that retreats counter-clockwise
// toward 12 o'clock, tick dots, and a frosted centre disc holding the time.

import type { EventId } from "@/lib/types";

export type TimerTone = "normal" | "warn" | "over";

// Arc colours per event (same as the semi-finals), and for warn / overtime.
const ARC: Record<EventId, { a: string; b: string }> = {
  hackx: { a: "rgb(var(--ocean))", b: "rgb(var(--glow))" },
  jr: { a: "rgb(var(--jr-fill))", b: "rgb(var(--jr-glow))" },
};
const TONE_ARC = { warn: { a: "#F59E0B", b: "#FCD34D" }, over: { a: "#DC2626", b: "#F87171" } };

// Dark-mode depth from the original: base ring + frosted disc surfaces.
const SURFACE: Record<EventId, { hi: string; lo: string; disc: string }> = {
  hackx: { hi: "var(--trench)", lo: "var(--abyss)", disc: "var(--deep)" },
  jr: { hi: "7 62 82", lo: "var(--jr-abyss)", disc: "var(--jr-deep)" },
};

const TICKS = 12;
const THICKNESS = 0.13; // ring thickness as a fraction of the diameter

export function RingTimer({ event, progress, tone, alert, size, children }: { event: EventId; progress: number; tone: TimerTone; alert?: "flash" | "pulse"; size: number; children: React.ReactNode }) {
  const p = Math.max(0, Math.min(1, progress));
  const { a, b } = tone === "normal" ? ARC[event] : TONE_ARC[tone];
  const s = SURFACE[event];
  const t = size * THICKNESS;

  const donut = `radial-gradient(farthest-side, transparent calc(100% - ${t}px - 1px), #000 calc(100% - ${t}px))`;
  // a full ring uses a symmetric gradient so there's no seam at 12 o'clock
  const arc =
    p >= 0.999
      ? `conic-gradient(from 0deg, ${a}, ${b} 180deg, ${a})`
      : `conic-gradient(from 0deg, ${a} 0deg, ${b} calc(var(--p) * 360deg), transparent calc(var(--p) * 360deg + 0.4deg))`;

  return (
    <div
      className={`relative shrink-0 rounded-full ${alert === "pulse" ? "ring-pulse" : ""}`}
      style={{ ["--p" as string]: p, width: size, height: size, transition: "--p 1s linear" } as React.CSSProperties}
    >
      {/* base ring — raised, softly lit from the top-left */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `linear-gradient(145deg, rgb(${s.hi}), rgb(${s.lo}))`,
          boxShadow: `0 ${size * 0.05}px ${size * 0.12}px rgb(0 0 0 / 0.55), inset 0 2px 1px rgb(255 255 255 / 0.12), inset 0 -10px 30px rgb(0 0 0 / 0.28)`,
        }}
      />

      {/* tick dots */}
      {Array.from({ length: TICKS }).map((_, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full bg-white/25"
          style={{
            width: size * 0.008,
            height: size * 0.008,
            transform: `translate(-50%, -50%) rotate(${i * (360 / TICKS)}deg) translateY(${-(0.5 - THICKNESS / 2) * size}px)`,
          }}
        />
      ))}

      {/* glow — the arc blurred along the ring */}
      <div
        className={`absolute inset-0 rounded-full ${alert === "flash" ? "ring-flash" : ""}`}
        style={{ background: arc, WebkitMaskImage: donut, maskImage: donut, filter: `blur(${size * 0.045}px)`, opacity: 0.9 }}
      />

      {/* crisp arc with a glass sheen */}
      <div
        className={`absolute inset-0 rounded-full ${alert === "flash" ? "ring-flash" : ""}`}
        style={{
          background: `linear-gradient(160deg, rgb(255 255 255 / 0.35), rgb(255 255 255 / 0) 45%), radial-gradient(farthest-side, rgb(255 255 255 / 0.28) calc(100% - ${t}px), rgb(255 255 255 / 0) calc(100% - ${t * 0.35}px), rgb(0 0 0 / 0.08) 100%), ${arc}`,
          WebkitMaskImage: donut,
          maskImage: donut,
        }}
      />

      {/* frosted centre disc */}
      <div
        className="absolute flex flex-col items-center justify-center rounded-full text-center"
        style={{
          inset: t,
          background: `rgb(${s.disc} / 0.55)`,
          backdropFilter: "blur(18px) saturate(1.4)",
          WebkitBackdropFilter: "blur(18px) saturate(1.4)",
          boxShadow: `0 ${size * 0.02}px ${size * 0.06}px rgb(0 0 0 / 0.5), inset 0 1px 0 rgb(255 255 255 / 0.12)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
