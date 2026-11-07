"use client";

import { useEffect, useRef, useState } from "react";
import type { Brand } from "@/lib/types";
import { EVENTS, eventsFor, SERIES_NAME, TITLE_PARTNERS, type Partner } from "@/content/brand";
import { VIDEOS, type VideoId } from "@/content/media";
import { serverNow } from "@/lib/clock";
import { useRenderMode } from "./Stage";

export function Img({ src, alt, className = "", style }: { src: string; alt: string; className?: string; style?: React.CSSProperties }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} draggable={false} className={`select-none object-contain ${className}`} style={style} />;
}

// Brand accent colour (RGB var name) per brand.
export function accentVar(brand: Brand) {
  return brand === "jr" ? "--amber-jr" : "--gold";
}

// ── Background ────────────────────────────────────────────────────────────
// Poseidon stage video (or its poster when `still`), tinted per brand.
export function Backdrop({ brand, still = false, video, dim = 0.55 }: { brand: Brand; still?: boolean; video?: VideoId; dim?: number }) {
  const v = VIDEOS[video ?? "stageLoop"];
  const tint =
    brand === "jr"
      ? "radial-gradient(ellipse at 50% 0%, rgb(var(--jr-fill) / 0.35), transparent 60%), linear-gradient(180deg, rgb(var(--jr-abyss) / 0.35), rgb(var(--jr-abyss) / 0.95))"
      : "radial-gradient(ellipse at 50% 0%, rgb(var(--ocean) / 0.3), transparent 60%), linear-gradient(180deg, rgb(var(--abyss) / 0.3), rgb(var(--abyss) / 0.95))";
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: brand === "jr" ? "rgb(var(--jr-abyss))" : "rgb(var(--abyss))" }}>
      {still ? (
        <Img src={v.poster ?? VIDEOS.stageLoop.poster} alt="" className="absolute inset-0 h-full w-full !object-cover" />
      ) : (
        <LoopVideo src={v.src} poster={v.poster} className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div className="absolute inset-0" style={{ background: `rgb(0 0 0 / ${dim})` }} />
      <div className="absolute inset-0" style={{ background: tint }} />
      {/* warm brand glow */}
      <div
        className={`absolute -left-40 top-[30%] h-[900px] w-[900px] rounded-full blur-[140px] ${still ? "" : "drift"}`}
        style={{ background: `rgb(var(${accentVar(brand)}) / 0.13)` }}
      />
      <div
        className={`absolute -right-40 -top-40 h-[800px] w-[800px] rounded-full blur-[160px] ${still ? "" : "drift-alt"}`}
        style={{ background: brand === "jr" ? "rgb(var(--jr-glow) / 0.12)" : "rgb(var(--glow) / 0.12)" }}
      />
      <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 300px 80px rgb(0 0 0 / 0.75)" }} />
    </div>
  );
}

// Muted looping background video. Never carries sound.
export function LoopVideo({ src, poster, className = "" }: { src: string; poster?: string; className?: string }) {
  return <video src={src} poster={poster} className={className} autoPlay muted loop playsInline preload="auto" />;
}

// Foreground video with sound (on the real output, once audio is unlocked).
// Joins at the right point if the page loads mid-video (uses takenAt), and
// calls onEnded so the scene can fall back to a still instead of a black frame.
export function ShowVideo({ id, takenAt, loop = false, onEnded }: { id: VideoId; takenAt: number; loop?: boolean; onEnded?: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const { audio, monitor } = useRenderMode();
  const v = VIDEOS[id];
  const endedRef = useRef(onEnded);
  endedRef.current = onEnded;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const join = () => {
      const elapsed = (serverNow() - takenAt) / 1000;
      if (!loop && Number.isFinite(el.duration) && elapsed > 1.5) {
        // page (re)loaded after this video already finished → straight to the still
        if (elapsed >= el.duration - 0.5) return endedRef.current?.();
        el.currentTime = elapsed;
      }
      el.play().catch(() => {
        // autoplay with sound refused — play muted rather than not at all
        el.muted = true;
        el.play().catch(() => {});
      });
    };
    if (el.readyState >= 1) join();
    else el.addEventListener("loadedmetadata", join, { once: true });
  }, [takenAt, loop]);

  useEffect(() => {
    if (ref.current) ref.current.muted = monitor || !audio;
  }, [audio, monitor]);

  return (
    <div className="absolute inset-0 bg-black">
      <video
        ref={ref}
        src={v.src}
        poster={v.poster}
        className="h-full w-full object-contain"
        playsInline
        preload="auto"
        loop={loop}
        muted={monitor || !audio}
        onEnded={onEnded}
      />
      {"placeholder" in v && v.placeholder ? <PlaceholderTag label={v.label} /> : null}
    </div>
  );
}

export function PlaceholderTag({ label }: { label: string }) {
  return (
    <div className="absolute left-8 top-8 z-50 rounded-xl border-2 border-dashed border-white/50 bg-black/60 px-5 py-3 font-mono text-[22px] text-white/85">
      PLACEHOLDER · {label}
    </div>
  );
}

// ── Logos ─────────────────────────────────────────────────────────────────

export function EventLogos({ brand, height = 220, className = "" }: { brand: Brand; height?: number; className?: string }) {
  const evs = eventsFor(brand);
  return (
    <div className={`flex items-center justify-center gap-[70px] ${className}`}>
      {evs.map((e, i) => (
        <div key={e.id} className="flex items-center gap-[70px]">
          {i > 0 && <div className="w-[3px] rounded-full bg-white/25" style={{ height: height * 0.7 }} />}
          <Img src={e.logo.onDark} alt={e.name} style={{ height }} />
        </div>
      ))}
    </div>
  );
}

// Small corner mark: event logo(s) — used on content slides.
export function CornerMark({ brand }: { brand: Brand }) {
  return (
    <div className="absolute left-[80px] top-[64px] z-10 flex items-center gap-8">
      {eventsFor(brand).map((e) => (
        <Img key={e.id} src={e.logo.onDark} alt={e.name} style={{ height: 78 }} />
      ))}
    </div>
  );
}

export function TitlePartnersStrip({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-5 ${className}`}>
      <p className="eyebrow text-[18px] text-white/60">In collaboration with</p>
      <div className="flex items-center gap-[70px]">
        {TITLE_PARTNERS.map((p) => (
          <Img key={p.id} src={p.onDark ?? p.logo!} alt={p.name} style={{ height: 96 }} />
        ))}
      </div>
    </div>
  );
}

export function SeriesLine({ className = "" }: { className?: string }) {
  return <p className={`eyebrow text-[30px] text-white/85 ${className}`}>{SERIES_NAME}</p>;
}

// Partner logo on its white card, or a typographic stand-in when no file exists.
export function PartnerCard({ partner, height = 300, width = 640, motion = false }: { partner: Partner; height?: number; width?: number; motion?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center rounded-[36px] bg-white ${motion ? "sheen" : ""}`}
      style={{ width, height, padding: height * 0.16, boxShadow: "0 40px 100px rgb(0 0 0 / 0.55), inset 0 1px 0 #fff" }}
    >
      {partner.logo ? (
        <Img src={partner.logo} alt={partner.name} className="max-h-full max-w-full" />
      ) : (
        <div className="text-center">
          <p className="font-display font-extrabold text-ink" style={{ fontSize: height * 0.2 }}>
            {partner.name}
          </p>
          <p className="mt-2 font-mono text-[18px] text-slate">logo placeholder</p>
        </div>
      )}
    </div>
  );
}

export function Monogram({ name, size }: { name: string; size: number }) {
  const initials = name
    .replace(/\[|\]|\(.*?\)|Prof\.|Dr\.|Mr\.|Ms\.|Eng\./g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <div
      className="flex items-center justify-center rounded-full font-display font-bold text-white/90"
      style={{ width: size, height: size, fontSize: size * 0.36, background: "radial-gradient(circle at 30% 25%, rgb(var(--trench)), rgb(var(--abyss)))" }}
    >
      {initials || "?"}
    </div>
  );
}

export function Portrait({ name, photo, size, brand }: { name: string; photo?: string; size: number; brand: Brand }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="spin-slow absolute -inset-[10px] rounded-full" style={{ background: `conic-gradient(from 0deg, rgb(var(${accentVar(brand)})), rgb(var(--ember)), transparent 60%, rgb(var(${accentVar(brand)})))` }} />
      <div className="absolute inset-0 overflow-hidden rounded-full border-[6px] border-black/60">
        {photo ? <Img src={photo} alt={name} className="h-full w-full !object-cover" /> : <Monogram name={name} size={size - 12} />}
      </div>
    </div>
  );
}

export function brandName(brand: Brand) {
  return brand === "combined" ? `${EVENTS.hackx.name} & ${EVENTS.jr.name}` : EVENTS[brand].name;
}

export function formatRs(n: number) {
  return `Rs. ${n.toLocaleString("en-US")}`;
}

// Count up to a number once mounted (prize reveals).
export function CountUp({ to, ms = 1400 }: { to: number; ms?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / ms);
      const eased = 1 - Math.pow(1 - k, 3);
      setV(Math.round((to * eased) / 1000) * 1000);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);
  return <>{formatRs(v)}</>;
}

// Deterministic confetti burst (same on every screen).
export function Confetti({ count = 90, seed = 1 }: { count?: number; seed?: number }) {
  let s = seed * 9301;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const colors = ["rgb(var(--gold))", "rgb(var(--ember))", "#fff", "rgb(var(--glow))", "rgb(var(--amber))"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={
            {
              left: `${rnd() * 100}%`,
              background: colors[i % colors.length],
              animationDuration: `${2.8 + rnd() * 2.5}s`,
              animationDelay: `${rnd() * 0.9}s`,
              "--dx": `${(rnd() - 0.5) * 500}px`,
              "--rot": `${(rnd() - 0.5) * 1440}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
