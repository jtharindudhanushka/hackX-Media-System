# hackX Final — Brand, Palette & Assets (DRAFT)

Tokens live in [`design/tokens.css`](../design/tokens.css). Partner/sponsor data in [`data/partners.json`](../data/partners.json). All files under `public/` are served from `/`.

## 1. The key observation

The **logos are gold/amber on transparent**; the **old pitch-timer UI was blue/teal** (an "Atlantis / Poseidon" underwater theme). They work together as **gold on deep ocean navy**: gold is the hero brand colour, blues are the stage. Don't use blue for brand marks, and don't put gold-on-white text (low contrast) — use ink or `ember` there.

## 2. Palette

### Brand (sampled from logo pixels)
| Token | Hex | Where it comes from |
|---|---|---|
| `gold` | `#FFB410` | hackX wordmark and X — **primary brand colour** |
| `gold-ideax` | `#F9B217` | ideaX round logo |
| `amber` | `#F09804` | ideaX (second tone) |
| `amber-jr` | `#E99D23` | hackX Jr wordmark |
| `ember` | `#D95E27` | shadow facets of the X — accent / "heat" |
| `copper` | `#C06B2A` | hackX Jr shadow facet |

innoX uses dark gold/brown (`#804D00`–`#F0BC00`), the only round logo that needs a light background.

### Atlantis stage (dark UI, from the old app + Poseidon video)
| Token | Hex | Use |
|---|---|---|
| `abyss` | `#010814` | page/canvas background |
| `deep` | `#041A3A` | cards / surfaces |
| `trench` | `#072652` | raised surfaces |
| `line` | `#143764` | borders |
| `navy` | `#0A3878` | tracks, deep accents |
| `ocean` | `#1A6FD4` | interactive fills (buttons) |
| `glow` | `#5BB8FF` | highlights, arcs, links on dark |
| `mist` | `#A0B8D6` | secondary text on dark |

hackX Jr swaps to teal: `jr-abyss #010E13`, `jr-deep #052E3F`, `jr-fill #18A0C0`, `jr-glow #72E5F8`.

### Light mode (projector / print)
`paper #F3F6FB`, `white`, `ink #010814`, `slate #4B5A73` (muted text).

### Status
`warn #FBBF24` (light mode `#B45309`), `danger #F87171` (light mode `#DC2626`), `ok #34D399` (new).

### Suggested usage (proposal — confirm with the design lead)
- Background `abyss` → surfaces `deep`/`trench` → gold for the one thing that matters on screen.
- Gold headline text on `abyss`; `mist` for supporting text.
- `ember` only as a small accent next to gold (gradients gold → ember work well, echoing the X).

## 3. Logo & asset map

| Path | What | Notes |
|---|---|---|
| `public/brand/hackx/logo-on-dark.png` · `logo-on-light.png` | hackX 2026 / 11.0 logo, 711×360 | Transparent. Wordmark "2026" is white (dark) or black (light) |
| `public/brand/hackx-jr/logo-on-dark.png` · `logo-on-light.png` | hackX Jr logo, 607×360 | Transparent |
| `public/brand/rounds/ideax.png` · `innox.png` | Round logos (ideaX 640×360, innoX 373×97) | Single version; innoX is dark gold, needs a light background |
| `public/sponsors/ministry-of-science-and-technology/on-dark.png` · `on-light.png` | Primary sponsor | Transparent |
| `public/sponsors/national-science-foundation/on-dark.png` · `on-light.png` | Primary sponsor | The old repo's dark/light files looked identical in size; verify on a dark background |
| `public/partners/*.png` | 9 partner logos (see `data/partners.json` for order) | **White backgrounds only**; all transparent PNGs |
| `public/stage/poseidon-trident.mp4` + `-poster.jpg` | Looping underwater Poseidon background video, 1280×720 poster | Total ~450 KB; dark teal `#082838`–`#083848` |

Partner dominant colours (for tinting/placeholders): Evonsys `#1888B8`, Lion:Bit `#683888`, nVentures `#0898D8`, Generation Alpha `#383838` (+ green `#38A808`), SLASSCOM `#F8B818`/`#383878`, TiE Colombo `#D81828`, Virtusa `#181828`, Ministry `#0868A8`/`#E8A808`, NSF `#080808`/`#F89818`.

## 4. Open questions
- Is the Final using the same "Atlantis" theme as the semi-finals, or something new? (The Final could lean harder into gold.)
- "2026 / 11.0" is baked into the hackX logo — is there a Final-specific logo or stage name?
- Is the sponsor/partner list the same for the Final? Any additions (e.g. prize partners, media partners)?
- Fonts: the old app used **Inter** (Google Fonts). Keep, or is there a brand font? The hackX wordmark is a hand-drawn script.
