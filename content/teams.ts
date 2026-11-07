// Finalist teams, in pitching order (from the DRAFT script). `project` is the
// one-liner shown on the team intro; `members` and `photo` are optional.
import type { EventId } from "@/lib/types";

export interface Team {
  id: string;
  event: EventId;
  name: string;
  project?: string;
  members?: string[];
  solo?: boolean;
  translator?: boolean; // Jr: Q&A extended to 10 minutes
  photo?: string;
}

const t = (event: EventId, id: string, name: string, project?: string, extra: Partial<Team> = {}): Team => ({ id: `${event}-${id}`, event, name, project, ...extra });

export const TEAMS_HACKX: Team[] = [
  t("hackx", "blind-bandits", "Blind Bandits", "BhumiSaara — blockchain-backed transparency for fertiliser subsidy distribution"),
  t("hackx", "division-zero", "Division Zero", "An alternative credit scoring platform"),
  t("hackx", "team-x", "Team X"),
  t("hackx", "sotercare", "SoterCare"),
  t("hackx", "inox", "INOX", "Smart protective workwear with adaptive ventilation"),
  t("hackx", "triple-i", "Triple I", "A monitoring system for elderly residents"),
  t("hackx", "novalith", "NOVALITH", "Health monitoring for expectant mothers and their babies"),
  t("hackx", "1024", "1024", "Smart drowsiness detection for road safety"),
  t("hackx", "tidex", "Tidex", "A floating platform that collects plastic from coastal waters"),
  t("hackx", "vector-0", "Vector 0", "A wearable assistive device for the visually impaired"),
  t("hackx", "sliit-kandy-uni", "SLIIT KANDY UNI", "Connecting farmers, buyers and logistics providers"),
  t("hackx", "newvax", "NewvaX", "Smart drainage monitoring to prevent flooding"),
  t("hackx", "crisis-crew", "Crisis Crew", "Kaduna"),
  t("hackx", "vision-path", "Vision Path", "Wearable navigation for the visually impaired"),
  t("hackx", "medai", "MedAI", "AI-assisted smartphone system to support clinicians"),
];

export const TEAMS_JR: Team[] = [
  t("jr", "aura-nexus", "Aura Nexus", "A medical device for early lump detection", { solo: true, members: ["Sineth"] }),
  t("jr", "dcc-brothers", "DCC Brothers", "Flood detection with early warnings"),
  t("jr", "black-eagle", "Black Eagle", "A Smart Cane for the visually impaired", { solo: true, members: ["Janidu"] }),
  t("jr", "delta-spark", "Delta Spark", "Virtual lab simulations for A/L practicals", { solo: true, members: ["Damasara"] }),
  t("jr", "cyber-tech", "Cyber Tech", "An automated smart greenhouse"),
  t("jr", "aquatrash", "Aquatrash", "An automatic water-cleaning boat for floating waste", { solo: true, members: ["Zuha"], translator: true }),
  t("jr", "nextgen-apex", "NextGen Apex", "SignBridge — AI-powered sign language translation"),
  t("jr", "dcc-tech-craft", "DCC Tech Craft", "AgroGuard — detecting wild animals to protect crops"),
  t("jr", "vani-sparks", "Vani Sparks", "Supporting small-scale farmers", { translator: true }),
  t("jr", "smart-inventors", "Smart Inventors", "Creative plastic waste recycling", { translator: true }),
  t("jr", "vision-sphere", "Vision Sphere", "Accessible eye screening", { solo: true, members: ["Pasindi"] }),
  t("jr", "inventionx", "InventionX", "A smart communication device for the elderly"),
  t("jr", "smart-bikers", "Smart Bikers", "ResQ — a smart cycling safety system", { solo: true, members: ["Kabisith"] }),
  t("jr", "digital-titans", "Digital Titans", "A smart early warning system for road safety"),
  t("jr", "nextgen-minds", "Nextgen Minds", "All-in-one disaster management and alerts"),
];

export const ALL_TEAMS = [...TEAMS_HACKX, ...TEAMS_JR];

export function teamById(id: string | undefined | null): Team | null {
  return ALL_TEAMS.find((x) => x.id === id) ?? null;
}

export function teamsOf(event: EventId): Team[] {
  return event === "hackx" ? TEAMS_HACKX : TEAMS_JR;
}

// Pitch rules from the guidelines (seconds).
export const PITCH_RULES: Record<EventId, { pitch: number; qa: number; qaTranslator: number }> = {
  hackx: { pitch: 7 * 60, qa: 5 * 60, qaTranslator: 5 * 60 },
  jr: { pitch: 7 * 60, qa: 4 * 60, qaTranslator: 10 * 60 },
};
