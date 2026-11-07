"use client";

import type { Brand } from "@/lib/types";
import type { Person } from "@/content/people";
import type { VideoId } from "@/content/media";
import { accentVar, Backdrop, CornerMark, Portrait, ShowVideo } from "@/components/stage/primitives";

const accentText = (b: Brand) => (b === "jr" ? "text-amber-jr" : "text-gold");

// Speaker / guest still. With `video`, the video plays full screen with a
// name lower-third (judge intro videos).
export function PersonScene({ brand, person, eyebrow, video, takenAt }: { brand: Brand; person: Person; eyebrow?: string; video?: VideoId; takenAt: number }) {
  if (video) {
    return (
      <div className="absolute inset-0">
        <ShowVideo id={video} takenAt={takenAt} loop />
        <LowerThird brand={brand} person={person} eyebrow={eyebrow} />
      </div>
    );
  }
  return (
    <div className="absolute inset-0">
      <Backdrop brand={brand} still />
      <CornerMark brand={brand} />
      <div className="absolute inset-0 flex items-center gap-[110px] px-[170px] pt-[40px]">
        <div className="pop">
          <Portrait name={person.name} photo={person.photo} size={540} brand={brand} />
        </div>
        <div className="min-w-0 flex-1">
          {eyebrow && <p className={`eyebrow rise text-[28px] ${accentText(brand)}`}>{eyebrow}</p>}
          <h1 className="rise mt-6 font-display text-[104px] font-extrabold leading-[1.02] tracking-tight" style={{ animationDelay: "0.12s" }}>
            {person.name}
          </h1>
          <div className="wipe mt-9 h-[6px] w-[260px] rounded-full" style={{ background: `linear-gradient(90deg, rgb(var(${accentVar(brand)})), rgb(var(--ember)))`, animationDelay: "0.3s" }} />
          <p className="rise mt-9 text-[42px] font-semibold leading-snug text-white/90" style={{ animationDelay: "0.35s" }}>
            {person.title}
          </p>
          {person.org && (
            <p className="rise mt-3 text-[36px] font-medium text-white/60" style={{ animationDelay: "0.45s" }}>
              {person.org}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function LowerThird({ brand, person, eyebrow }: { brand: Brand; person: Person; eyebrow?: string }) {
  return (
    <div className="absolute bottom-[90px] left-[90px] flex items-stretch overflow-hidden rounded-[22px]" style={{ boxShadow: "0 30px 80px rgb(0 0 0 / 0.6)" }}>
      <div className="wipe w-[16px]" style={{ background: `rgb(var(${accentVar(brand)}))` }} />
      <div className="rise bg-abyss/85 px-[44px] py-[28px] backdrop-blur-md">
        {eyebrow && <p className={`eyebrow text-[20px] ${accentText(brand)}`}>{eyebrow}</p>}
        <p className="mt-2 font-display text-[56px] font-extrabold leading-tight">{person.name}</p>
        <p className="mt-1 text-[28px] font-medium text-white/75">
          {person.title}
          {person.org ? ` · ${person.org}` : ""}
        </p>
      </div>
    </div>
  );
}

// Judging panel grid — GO reveals one person at a time (step = number shown).
export function PanelScene({ brand, eyebrow, title, people, step }: { brand: Brand; eyebrow?: string; title: string; people: readonly Person[]; step: number }) {
  const size = people.length > 4 ? 250 : 290;
  return (
    <div className="absolute inset-0">
      <Backdrop brand={brand} still />
      <CornerMark brand={brand} />
      <div className="absolute inset-x-0 top-[190px] text-center">
        {eyebrow && <p className={`eyebrow text-[26px] ${accentText(brand)}`}>{eyebrow}</p>}
        <h1 className="mt-4 font-display text-[84px] font-extrabold tracking-tight">{title}</h1>
      </div>
      <div className="absolute inset-x-[80px] top-[440px] flex justify-center gap-[56px]">
        {people.map((p, i) => (
          <div key={p.id} className="flex w-[320px] flex-col items-center text-center transition-all duration-700" style={{ opacity: i < step ? 1 : 0.08, transform: i < step ? "none" : "translateY(30px)", filter: i < step ? "none" : "blur(6px)" }}>
            <Portrait name={p.name} photo={p.photo} size={size} brand={brand} />
            <p className="mt-9 font-display text-[34px] font-bold leading-tight">{p.name}</p>
            <p className="mt-3 text-[22px] font-medium leading-snug text-white/70">{p.title}</p>
            {p.org && <p className="mt-1 text-[22px] text-white/50">{p.org}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// Tokens-of-appreciation style name list.
export function ListScene({ brand, eyebrow, title, people }: { brand: Brand; eyebrow?: string; title: string; people: readonly Person[] }) {
  const cols = people.length > 5 ? 2 : 1;
  return (
    <div className="absolute inset-0">
      <Backdrop brand={brand} still />
      <CornerMark brand={brand} />
      <div className="absolute inset-x-[160px] top-[200px]">
        {eyebrow && <p className={`eyebrow rise text-[26px] ${accentText(brand)}`}>{eyebrow}</p>}
        <h1 className="rise mt-4 font-display text-[80px] font-extrabold leading-tight tracking-tight" style={{ animationDelay: "0.1s" }}>
          {title}
        </h1>
        <div className="mt-[60px] grid gap-x-[80px] gap-y-[34px]" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {people.map((p, i) => (
            <div key={p.id} className="rise flex items-center gap-7 border-l-[6px] pl-7" style={{ animationDelay: `${0.25 + i * 0.08}s`, borderColor: `rgb(var(${accentVar(brand)}))` }}>
              <div className="min-w-0">
                <p className="truncate font-display text-[44px] font-bold leading-tight">{p.name}</p>
                <p className="truncate text-[26px] text-white/65">
                  {p.title}
                  {p.org ? ` · ${p.org}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
