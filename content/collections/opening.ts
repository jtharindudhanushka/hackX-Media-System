// Opening Ceremony — shared hackX 11.0 + hackX Jr 9.0 (Main Hall, 9.00–10.30).
// Follows the draft Grand Final script, section by section.
import { collection } from "../cues";
import { GUESTS, JUDGES_HACKX, JUDGES_JR } from "../people";

const C = "combined" as const;
const loop = { kind: "loop", brand: C, label: "Main Loop – Combined" } as const;
const still = { kind: "still", brand: C, label: "Main Still – Combined" } as const;

const partnerLoop = (ids: string[], label: string, note?: string) =>
  ({ kind: "partner", brand: C, partnerIds: ids, motion: true, label, note }) as const;

export const opening = collection(
  {
    id: "opening",
    name: "Opening Ceremony",
    brand: C,
    description: "Shared opening for hackX & hackX Jr — 9.00 to 10.30 a.m.",
    fallback: loop,
  },
  [
    {
      title: "Event Commencement",
      cues: [
        { ...loop, note: "[Live Start] — before the hosts walk on" },
        { ...still, note: "Speaker 1: “Good morning, ladies and gentlemen!”" },
        { kind: "video", brand: C, video: "introVideo", label: "hackX & Jr Intro Video", note: "[Lights off] after “Welcome to hackX: The National Hackathon Series 2026!”" },
        { ...still, note: "[Lights on]" },
      ],
    },
    {
      title: "Lighting the Oil Lamp",
      cues: [{ ...still, note: "Keep the still up for the whole oil lamp segment" }],
    },
    {
      title: "University Anthem",
      cues: [{ kind: "text", brand: C, eyebrow: "Please rise", title: "University Anthem", label: "University Anthem" }, still],
    },
    {
      title: "Welcome Speech",
      cues: [{ kind: "person", brand: C, person: GUESTS.amila, eyebrow: "Welcome Address", label: "Dr. Amila – Welcome Address" }, still],
    },
    {
      title: "Department Intro Video",
      cues: [{ kind: "video", brand: C, video: "dimIntro", label: "DIM Intro Video", note: "“…learn more about the department through this short video”" }, still],
    },
    {
      title: "Speech by the HOD",
      cues: [{ kind: "person", brand: C, person: GUESTS.dilani, eyebrow: "Address", label: "Dr. Dilani – HOD Address" }, still],
    },
    {
      title: "NSF Video & Speech",
      cues: [
        { kind: "video", brand: C, video: "nsfVideo", label: "NSF Video" },
        { kind: "person", brand: C, person: GUESTS.shiromi, eyebrow: "Address", label: "Prof. Shiromi Perera – Still" },
        still,
      ],
    },
    {
      title: "Guest of Honour",
      cues: [{ kind: "person", brand: C, person: GUESTS.imal, eyebrow: "Guest of Honour", label: "Mr. Imal Kalutotage – Still" }, still],
    },
    {
      title: "Partnership Introduction",
      cues: [
        { ...still, note: "“Great events are never built alone…”" },
        partnerLoop(["ministry", "nsf"], "Title Partners – Ministry & NSF Loop", "No ad for Ministry"),
        partnerLoop(["evonsys"], "Evonsys Loop"),
        { kind: "video", brand: C, video: "adEvonsys", label: "Ad – Evonsys" },
        partnerLoop(["lionbit"], "LionBit Loop"),
        { kind: "video", brand: C, video: "adLionbit", label: "Ad – LionBit" },
        partnerLoop(["nventures"], "nVentures Loop"),
        { kind: "video", brand: C, video: "adNventures", label: "Ad – nVentures" },
        partnerLoop(["slasscom", "generation-alpha", "virtusa", "tie-colombo"], "Knowledge Partners – All four", "“Talent grows faster when it is surrounded by knowledge…”"),
        partnerLoop(["slasscom"], "SLASSCOM Loop"),
        { kind: "video", brand: C, video: "adSlasscom", label: "Ad – SLASSCOM" },
        partnerLoop(["generation-alpha"], "Generation ALPHA Loop"),
        { kind: "video", brand: C, video: "adGenerationAlpha", label: "Ad – Generation ALPHA" },
        partnerLoop(["virtusa"], "Virtusa Loop"),
        { kind: "video", brand: C, video: "adVirtusa", label: "Ad – Virtusa" },
        partnerLoop(["tie-colombo"], "TiE Colombo Loop"),
        { kind: "video", brand: C, video: "adTieColombo", label: "Ad – TiE Colombo" },
        partnerLoop(["escape-the-room"], "Escape the Room Loop"),
        { kind: "video", brand: C, video: "adEscapeTheRoom", label: "Ad – Escape the Room" },
        partnerLoop(["helakuru"], "Helakuru Loop", "No ad for Helakuru"),
        partnerLoop(["waters-edge"], "Waters Edge Loop"),
        { kind: "video", brand: C, video: "adWatersEdge", label: "Ad – Waters Edge" },
        { kind: "partnerWall", brand: C, label: "All Partners – Wall" },
        { ...still, note: "“And there you have it, the partners behind hackX…”" },
      ],
    },
    {
      title: "Guidelines",
      cues: [
        {
          kind: "guidelines",
          event: "hackx",
          label: "hackX Guidelines Loop",
          bullets: [
            "7 minutes for the presentation, followed by a 5-minute Q&A session.",
            "The 7 minutes cover your pitch (problem and solution) and a demonstration of your final product or prototype.",
            "No fixed flow — where the demo goes is your decision, as long as it fits in 7 minutes.",
            "Demonstrate live or through a pre-recorded video.",
            "The presentation must be conducted entirely in English.",
            "The original idea must remain unchanged; the final product may add features and improvements.",
            "All team members must be physically present for the entire presentation and Q&A.",
          ],
        },
        {
          kind: "guidelines",
          event: "jr",
          label: "hackX Jr Guidelines Loop",
          bullets: [
            "7 minutes to pitch, followed by a 4-minute Q&A session with the judges.",
            "The 7 minutes cover both the presentation and the demonstration — plan your time carefully.",
            "Prepare a recorded demo video in advance, in case the prototype does not work on the day.",
            "Present in English or Sinhala.",
            "Tamil-speaking teams may use a translator for the Q&A — Q&A extends to 10 minutes. Answer the judges directly where possible.",
            "School uniform for all members; one accompanying parent, teacher or guardian per team.",
            "Bring your own devices, and submit a copy of your presentation in advance.",
            "Test your presentation, prototype and devices beforehand, and be ready at your allocated time.",
          ],
        },
        { ...still, note: "“…the judges’ decision is final and cannot be contested.”" },
      ],
    },
    {
      title: "Most Popular Team (hackX)",
      cues: [
        {
          kind: "text",
          brand: "hackx",
          eyebrow: "hackX 11.0 · New this year",
          title: "Most Popular Team Award",
          body: "Decided by public voting. Details of the voting process will be shared soon — stay tuned.",
          label: "Most Popular Team – Info",
        },
      ],
    },
    {
      title: "Cash Prizes",
      cues: [
        still,
        {
          kind: "prizes",
          brand: C,
          label: "Cash Prizes – step reveal",
          note: "GO reveals one place at a time: Jr 2nd → 1st → Champion, then hackX",
          groups: [
            {
              event: "jr",
              places: [
                { label: "Second Runners-up", amount: 75000 },
                { label: "First Runners-up", amount: 100000 },
                { label: "Champions", amount: 150000 },
              ],
            },
            {
              event: "hackx",
              places: [
                { label: "Second Runners-up", amount: 125000 },
                { label: "First Runners-up", amount: 150000 },
                { label: "Champions", amount: 200000 },
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Judging Panel – hackX 11.0",
      cues: [
        ...JUDGES_HACKX.map((j) => ({ kind: "person" as const, brand: "hackx" as const, person: j, eyebrow: "Judge · hackX 11.0", video: "judgeVideo" as const, label: `Judge – ${j.name}` })),
        { kind: "panel", brand: "hackx", eyebrow: "Grand Finals", title: "hackX 11.0 Judging Panel", people: JUDGES_HACKX, label: "hackX Judges – Panel", note: "GO reveals one judge at a time" },
      ],
    },
    {
      title: "Judging Panel – hackX Jr 9.0",
      cues: [
        ...JUDGES_JR.map((j) => ({ kind: "person" as const, brand: "jr" as const, person: j, eyebrow: "Judge · hackX Jr 9.0", video: "judgeVideo" as const, label: `Judge – ${j.name}` })),
        { kind: "panel", brand: "jr", eyebrow: "Grand Finals", title: "hackX Jr 9.0 Judging Panel", people: JUDGES_JR, label: "Jr Judges – Panel", note: "GO reveals one judge at a time" },
        still,
      ],
    },
    {
      title: "Announcements & Transition",
      cues: [
        {
          kind: "text",
          brand: C,
          eyebrow: "Pitching sessions",
          title: "hackX Jr teams — please remain in this hall",
          body: "hackX teams — please proceed to [Hall name]. Organizing committee members will guide you.",
          label: "Venue Announcement",
          note: "[Live Ends]",
        },
        { ...loop, note: "While the audience moves" },
        { kind: "loop", brand: "jr", label: "hackX Jr Loop", note: "After the audience leaves the hall" },
      ],
    },
  ]
);
