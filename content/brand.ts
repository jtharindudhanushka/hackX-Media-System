// Event branding + partners. Logo paths are relative to /public.
import type { Brand, EventId } from "@/lib/types";

export interface EventBrand {
  id: EventId;
  name: string; // "hackX 11.0"
  short: string; // "hackX"
  edition: string; // "11.0"
  logo: { onDark: string; onLight: string };
}

export const EVENTS: Record<EventId, EventBrand> = {
  hackx: {
    id: "hackx",
    name: "hackX 11.0",
    short: "hackX",
    edition: "11.0",
    logo: { onDark: "/brand/hackx/logo-on-dark.png", onLight: "/brand/hackx/logo-on-light.png" },
  },
  jr: {
    id: "jr",
    name: "hackX Jr 9.0",
    short: "hackX Jr",
    edition: "9.0",
    logo: { onDark: "/brand/hackx-jr/logo-on-dark.png", onLight: "/brand/hackx-jr/logo-on-light.png" },
  },
};

export const SERIES_NAME = "The National Hackathon Series 2026";
export const ORGANISER = "Industrial Management Science Students’ Association · University of Kelaniya";

export function eventsFor(brand: Brand) {
  return brand === "combined" ? [EVENTS.hackx, EVENTS.jr] : [EVENTS[brand]];
}

// ── Partners ──────────────────────────────────────────────────────────────
// `logo` = version for WHITE backgrounds (all partner logos are). `onDark`
// only where a dark-background version exists. `logo: null` = no file yet —
// a typographic placeholder is shown until one is added.

export interface Partner {
  id: string;
  name: string;
  tier: string;
  logo: string | null;
  onDark?: string;
}

export const PARTNERS: Partner[] = [
  { id: "ministry", name: "Ministry of Science & Technology", tier: "Title Partner", logo: "/partners/ministry-of-science-and-technology.png", onDark: "/sponsors/ministry-of-science-and-technology/on-dark.png" },
  { id: "nsf", name: "National Science Foundation", tier: "Title Partner", logo: "/partners/national-science-foundation.png", onDark: "/sponsors/national-science-foundation/on-dark.png" },
  { id: "evonsys", name: "Evonsys", tier: "Bronze Partner", logo: "/partners/evonsys.png" },
  { id: "lionbit", name: "LionBit", tier: "Official Knowledge & Community Award Partner", logo: "/partners/lionbit.png" },
  { id: "nventures", name: "nVentures", tier: "Investment Partner", logo: "/partners/nventures.png" },
  { id: "slasscom", name: "SLASSCOM", tier: "Knowledge Partner", logo: "/partners/slasscom.png" },
  { id: "generation-alpha", name: "Generation ALPHA", tier: "Knowledge Partner", logo: "/partners/generation-alpha.png" },
  { id: "virtusa", name: "Virtusa", tier: "Knowledge Partner", logo: "/partners/virtusa.png" },
  { id: "tie-colombo", name: "TiE Colombo", tier: "Knowledge Partner", logo: "/partners/tie-colombo.png" },
  { id: "escape-the-room", name: "Escape the Room", tier: "Official Gift Partner", logo: null },
  { id: "helakuru", name: "Helakuru", tier: "Official Digital Media Partner", logo: null },
  { id: "waters-edge", name: "Waters Edge", tier: "Official Venue Partner", logo: null },
  { id: "perfect-events", name: "Perfect Events", tier: "Official Event Partner", logo: null },
];

export function partner(id: string): Partner {
  const p = PARTNERS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown partner "${id}" — add it to content/brand.ts`);
  return p;
}

export const TITLE_PARTNERS = ["ministry", "nsf"].map(partner);
