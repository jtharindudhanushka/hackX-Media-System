"use client";

import type { Brand } from "@/lib/types";
import { partner, PARTNERS } from "@/content/brand";
import { Backdrop, CornerMark, PartnerCard } from "@/components/stage/primitives";

// One partner (or a group of the same tier) on white cards with the tier name.
// motion = "loop" version (moving stage + light sweep); otherwise a still.
export function PartnerScene({ brand, partnerIds, tier, motion }: { brand: Brand; partnerIds: readonly string[]; tier?: string; motion: boolean }) {
  const ps = partnerIds.map(partner);
  const heading = tier ?? (ps.every((p) => p.tier === ps[0].tier) ? ps[0].tier + (ps.length > 1 && !ps[0].tier.endsWith("s") ? "s" : "") : "Partners");
  const big = ps.length === 1;
  const card = big ? { width: 1000, height: 480 } : ps.length === 2 ? { width: 760, height: 400 } : { width: 400, height: 250 };
  return (
    <div className="absolute inset-0">
      <Backdrop brand={brand} still={!motion} />
      <CornerMark brand={brand} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[64px] pt-[40px]">
        <p className="eyebrow rise text-center text-[34px] text-gold">{heading}</p>
        <div className="flex items-center justify-center gap-[48px]">
          {ps.map((p, i) => (
            <div key={p.id} className={`pop ${motion ? "float" : ""}`} style={{ animationDelay: `${0.1 + i * 0.12}s` }}>
              <PartnerCard partner={p} motion={motion} {...card} />
            </div>
          ))}
        </div>
        {big && <p className="rise text-[40px] font-semibold text-white/85" style={{ animationDelay: "0.35s" }}>{ps[0].name}</p>}
      </div>
    </div>
  );
}

// Every partner, grouped by tier, on one screen.
export function PartnerWallScene({ brand, title }: { brand: Brand; title?: string }) {
  const tiers: { tier: string; ids: string[] }[] = [];
  for (const p of PARTNERS) {
    const key = p.tier.replace(/^Official /, "");
    const t = tiers.find((x) => x.tier === key);
    if (t) t.ids.push(p.id);
    else tiers.push({ tier: key, ids: [p.id] });
  }
  return (
    <div className="absolute inset-0">
      <Backdrop brand={brand} still />
      <CornerMark brand={brand} />
      <p className="eyebrow absolute inset-x-0 top-[80px] text-center text-[30px] text-gold">{title ?? "Our Partners"}</p>
      <div className="absolute inset-x-[90px] top-[190px] flex flex-wrap justify-center gap-x-[44px] gap-y-[40px]">
        {tiers.map((t, ti) => (
          <div key={t.tier} className="rise flex flex-col items-center gap-4" style={{ animationDelay: `${ti * 0.07}s` }}>
            <p className="eyebrow text-[16px] text-white/60">{t.tier}</p>
            <div className="flex gap-5">
              {t.ids.map((id) => (
                <PartnerCard key={id} partner={partner(id)} width={t.ids.length > 2 ? 250 : 330} height={t.ids.length > 2 ? 150 : 180} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
