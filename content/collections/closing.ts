// Awards & Closing Ceremony — shared hackX 11.0 + hackX Jr 9.0 (Main Hall, 5.00–7.20).
// Winner names are NOT in code: pick them in the control panel (Winners box).
import { collection } from "../cues";
import { GUESTS, JUDGES_HACKX, JUDGES_JR, tba } from "../people";

const C = "combined" as const;
const loop = { kind: "loop", brand: C, label: "Main Loop – Combined" } as const;
const still = { kind: "still", brand: C, label: "Main Still – Combined" } as const;
const TOA = "Tokens of Appreciation";

const partnerStill = (id: string, label: string) => ({ kind: "partner", brand: C, partnerIds: [id], motion: false, label }) as const;

export const closing = collection(
  {
    id: "closing",
    name: "Awards & Closing Ceremony",
    brand: C,
    description: "Shared awards and closing — 5.00 to 7.20 p.m.",
    fallback: loop,
  },
  [
    {
      title: "Commencement",
      cues: [
        { ...loop, note: "[Live Start] “Welcome back to the Grand Finals…”" },
        { kind: "video", brand: C, video: "journeyVideo", label: "Journey Video", note: "[Lights dim] “…let's take a look back at how this year's hackX journey unfolded.”" },
        { ...still, note: "[Lights on]" },
      ],
    },
    {
      title: "Speech – Ministry Secretary",
      cues: [{ kind: "person", brand: C, person: GUESTS.secretary, eyebrow: "Address", label: "Secretary – Guest Still" }, still],
    },
    {
      title: "TOA – Judges",
      cues: [
        { kind: "list", brand: "hackx", eyebrow: TOA, title: "hackX 11.0 — Panel of Judges", people: JUDGES_HACKX, label: "hackX Judges – TOA", note: "[Background music] Presenter: NSF Director" },
        { kind: "list", brand: "hackx", eyebrow: TOA, title: "hackX 11.0 — Semi-Finals Judges", people: tba(2, "Judge"), label: "hackX Semi-Final Judges – TOA" },
        { kind: "list", brand: "jr", eyebrow: TOA, title: "hackX Jr 9.0 — Panel of Judges", people: JUDGES_JR, label: "Jr Judges – TOA", note: "Presenters: Dr. Dilani & Dr. Amila" },
        { kind: "list", brand: "jr", eyebrow: TOA, title: "hackX Jr 9.0 — Semi-Finals Judges (innoX)", people: tba(2, "Judge"), label: "Jr Semi-Final Judges – TOA" },
      ],
    },
    {
      title: "TOA – Mentors",
      cues: [
        { kind: "list", brand: "hackx", eyebrow: TOA, title: "hackX 11.0 — Mentors", people: tba(5, "Mentor"), label: "hackX Mentors – TOA", note: "Presenters: Uchintha & Duleeksha" },
        { kind: "list", brand: "jr", eyebrow: TOA, title: "hackX Jr 9.0 — Mentors", people: tba(4, "Mentor"), label: "Jr Mentors – TOA (group 1)", note: "Presenters: Kaveendya & Araliya" },
        { kind: "list", brand: "combined", eyebrow: TOA, title: "Mentors", people: tba(4, "Mentor"), label: "Mentors – TOA (group 2)", note: "Presenters: Wasana & Charith" },
        still,
      ],
    },
    {
      title: "TOA – Dr. Amila",
      cues: [{ kind: "person", brand: C, person: GUESTS.amila, eyebrow: "Token of Appreciation", label: "Dr. Amila – TOA" }],
    },
    {
      title: "Judge Speech",
      cues: [{ kind: "person", brand: C, person: GUESTS.judgeSpeaker, eyebrow: "On behalf of the judges", label: "Judge Speech – Still" }],
    },
    {
      title: "Winners Announcement",
      cues: [
        { ...still, note: "[Award Ceremony Music] — presenters invited on stage" },
        { kind: "list", brand: C, eyebrow: "Award Presenters", title: "Presenting the Awards", people: tba(5, "Guest"), label: "Award Presenters" },

        { kind: "winner", event: "jr", place: "second", slot: "winner.jr.second", prize: 75000, label: "Jr 2nd Runners-Up – Lead-in" , note: "Step 1 = suspense card. Video next, then GO on the reveal." },
        { kind: "video", brand: "jr", video: "revealJr2", label: "Reveal Video – Jr 2nd" },
        { kind: "winner", event: "jr", place: "second", slot: "winner.jr.second", prize: 75000, label: "Jr 2nd Runners-Up – Still", revealed: true },

        still,
        { kind: "winner", event: "hackx", place: "second", slot: "winner.hackx.second", prize: 125000, label: "hackX 2nd Runners-Up – Lead-in" },
        { kind: "video", brand: "hackx", video: "revealHackx2", label: "Reveal Video – hackX 2nd" },
        { kind: "winner", event: "hackx", place: "second", slot: "winner.hackx.second", prize: 125000, label: "hackX 2nd Runners-Up – Still", revealed: true },

        still,
        { kind: "winner", event: "jr", place: "first", slot: "winner.jr.first", prize: 100000, label: "Jr 1st Runners-Up – Lead-in" },
        { kind: "video", brand: "jr", video: "revealJr1", label: "Reveal Video – Jr 1st" },
        { kind: "winner", event: "jr", place: "first", slot: "winner.jr.first", prize: 100000, label: "Jr 1st Runners-Up – Still", revealed: true },

        still,
        { kind: "winner", event: "hackx", place: "first", slot: "winner.hackx.first", prize: 150000, label: "hackX 1st Runners-Up – Lead-in" },
        { kind: "video", brand: "hackx", video: "revealHackx1", label: "Reveal Video – hackX 1st" },
        { kind: "winner", event: "hackx", place: "first", slot: "winner.hackx.first", prize: 150000, label: "hackX 1st Runners-Up – Still", revealed: true },

        still,
        { kind: "winner", event: "jr", place: "champion", slot: "winner.jr.champion", prize: 150000, label: "Jr Champions – Lead-in", note: "[Pause for audience response]" },
        { kind: "video", brand: "jr", video: "revealJrChamp", label: "Reveal Video – Jr Champions" },
        { kind: "winner", event: "jr", place: "champion", slot: "winner.jr.champion", prize: 150000, label: "Jr Champions – Still", revealed: true },

        still,
        { kind: "winner", event: "hackx", place: "champion", slot: "winner.hackx.champion", prize: 200000, label: "hackX Champions – Lead-in", note: "[Pause for audience response]" },
        { kind: "video", brand: "hackx", video: "revealHackxChamp", label: "Reveal Video – hackX Champions" },
        { kind: "winner", event: "hackx", place: "champion", slot: "winner.hackx.champion", prize: 200000, label: "hackX Champions – Still", revealed: true },
      ],
    },
    {
      title: "Most Popular Team",
      cues: [
        { ...still, note: "Presenters: LionBit representatives" },
        { kind: "winner", event: "hackx", place: "popular", slot: "winner.hackx.popular", label: "Most Popular – Lead-in" },
        { kind: "video", brand: "hackx", video: "revealPopular", label: "Reveal Video – Most Popular" },
        { kind: "winner", event: "hackx", place: "popular", slot: "winner.hackx.popular", label: "Most Popular – Still", revealed: true },
        still,
      ],
    },
    {
      title: "Speech by the Minister",
      cues: [{ kind: "person", brand: C, person: GUESTS.minister, eyebrow: "Chief Guest", label: "Minister – Still" }],
    },
    {
      title: "TOA – Partners",
      cues: [
        { ...still, note: "[Background music – low]" },
        partnerStill("ministry", "Ministry Still"),
        partnerStill("nsf", "NSF Still"),
        still,
        partnerStill("evonsys", "Evonsys Still"),
        partnerStill("lionbit", "LionBit Still"),
        partnerStill("nventures", "nVentures Still"),
        still,
        partnerStill("slasscom", "SLASSCOM Still"),
        partnerStill("generation-alpha", "Generation ALPHA Still"),
        partnerStill("virtusa", "Virtusa Still"),
        partnerStill("tie-colombo", "TiE Colombo Still"),
        still,
        partnerStill("escape-the-room", "Escape the Room Still"),
        partnerStill("helakuru", "Helakuru Still"),
        partnerStill("perfect-events", "Perfect Events Still"),
        partnerStill("waters-edge", "Waters Edge Still"),
        { kind: "partnerWall", brand: C, title: "Thank you to our partners", label: "All Partners – Wall" },
      ],
    },
    {
      title: "Vote of Thanks & Ending",
      cues: [
        { kind: "person", brand: C, person: GUESTS.harshana, eyebrow: "Vote of Thanks", label: "Harshana – Vote of Thanks" },
        { kind: "text", brand: C, eyebrow: "Please rise", title: "National Anthem", label: "National Anthem" },
        { kind: "text", brand: C, eyebrow: "Grand Finals 2026", title: "Group Photograph", label: "Group Photograph" },
        still,
        { ...loop, note: "[Live Ends]" },
      ],
    },
  ]
);
