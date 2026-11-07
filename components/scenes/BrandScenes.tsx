"use client";

import type { Brand } from "@/lib/types";
import { EVENTS } from "@/content/brand";
import { Backdrop, CornerMark, EventLogos, SeriesLine, TitlePartnersStrip } from "@/components/stage/primitives";

// Main Loop / Main Still. Loop = moving stage video + breathing logos;
// Still = poster frame, no motion (safe to hold for a long speech).
export function BrandScene({ brand, motion, title, subtitle }: { brand: Brand; motion: boolean; title?: string; subtitle?: string }) {
  const single = brand !== "combined";
  return (
    <div className="absolute inset-0">
      <Backdrop brand={brand} still={!motion} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pb-[60px]">
        <div className={motion ? "float" : ""}>
          <EventLogos brand={brand} height={single ? 330 : 250} className={motion ? "breathe" : ""} />
        </div>

        {title ? (
          <div className="rise mt-[70px] text-center">
            <h1 className="font-display text-[110px] font-extrabold leading-none tracking-tight text-white">{title}</h1>
            {subtitle && <p className="mt-6 text-[38px] font-medium text-white/75">{subtitle}</p>}
          </div>
        ) : (
          <div className="mt-[64px] flex flex-col items-center gap-5">
            <SeriesLine />
            <div className="flex items-center gap-6">
              <span className="h-[2px] w-[120px] bg-gradient-to-r from-transparent to-gold" />
              <p className={`font-display text-[64px] font-bold tracking-tight ${brand === "jr" ? "jr-text" : "gold-text"}`}>
                {single ? `${EVENTS[brand].name} · Grand Finals` : "Grand Finals"}
              </p>
              <span className="h-[2px] w-[120px] bg-gradient-to-l from-transparent to-gold" />
            </div>
          </div>
        )}
      </div>
      <TitlePartnersStrip className="absolute bottom-[56px] left-1/2 -translate-x-1/2" />
    </div>
  );
}

export function TextScene({ brand, eyebrow, title, body }: { brand: Brand; eyebrow?: string; title: string; body?: string }) {
  return (
    <div className="absolute inset-0">
      <Backdrop brand={brand} still />
      <CornerMark brand={brand} />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-[200px] text-center">
        {eyebrow && <p className={`eyebrow rise text-[30px] ${brand === "jr" ? "text-amber-jr" : "text-gold"}`}>{eyebrow}</p>}
        <h1 className="rise mt-8 font-display text-[112px] font-extrabold leading-[1.02] tracking-tight" style={{ animationDelay: "0.1s" }}>
          {title}
        </h1>
        {body && (
          <p className="rise mt-10 max-w-[1300px] text-[42px] font-medium leading-snug text-white/80" style={{ animationDelay: "0.25s" }}>
            {body}
          </p>
        )}
      </div>
    </div>
  );
}

export function BlackScene() {
  return <div className="absolute inset-0 bg-black" />;
}
