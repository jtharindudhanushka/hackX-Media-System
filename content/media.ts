// Every video the show plays, by id. While `placeholder` is true the stage
// video is used and a small "PLACEHOLDER" tag shows on screen.
// To use the real file: drop it in public/media/videos/, point `src` at it,
// and remove `placeholder`. Posters are optional (shown while loading).

export interface MediaVideo {
  label: string;
  src: string;
  poster?: string;
  placeholder?: boolean;
}

const STAGE = "/stage/poseidon-trident.mp4";
const STAGE_POSTER = "/stage/poseidon-trident-poster.jpg";
const ph = (label: string): MediaVideo => ({ label, src: STAGE, poster: STAGE_POSTER, placeholder: true });

export const VIDEOS = {
  stageLoop: { label: "Stage loop (Poseidon)", src: STAGE, poster: STAGE_POSTER },

  // Opening
  introVideo: ph("hackX & hackX Jr Intro Video"),
  dimIntro: ph("Department of Industrial Management Intro Video"),
  nsfVideo: ph("NSF Video"),

  // Pitching
  pitchingBegins: ph("Pitching Begins Now Video"),
  qaVideo: ph("Q&A Video (background)"),

  // Partner ads
  adEvonsys: ph("Ad – Evonsys"),
  adLionbit: ph("Ad – LionBit"),
  adNventures: ph("Ad – nVentures"),
  adSlasscom: ph("Ad – SLASSCOM"),
  adGenerationAlpha: ph("Ad – Generation ALPHA"),
  adVirtusa: ph("Ad – Virtusa"),
  adTieColombo: ph("Ad – TiE Colombo"),
  adEscapeTheRoom: ph("Ad – Escape the Room"),
  adWatersEdge: ph("Ad – Waters Edge"),

  // Judge intro videos (one per judge in the script)
  judgeVideo: ph("Judge Introduction Video"),

  // Closing
  journeyVideo: ph("hackX & hackX Jr Journey Video"),
  revealJr2: ph("Second Runners-Up Reveal – Jr"),
  revealHackx2: ph("Second Runners-Up Reveal – hackX"),
  revealJr1: ph("First Runners-Up Reveal – Jr"),
  revealHackx1: ph("First Runners-Up Reveal – hackX"),
  revealJrChamp: ph("Champion Reveal – Jr"),
  revealHackxChamp: ph("Champion Reveal – hackX"),
  revealPopular: ph("Most Popular Team Reveal"),
} satisfies Record<string, MediaVideo>;

export type VideoId = keyof typeof VIDEOS;
