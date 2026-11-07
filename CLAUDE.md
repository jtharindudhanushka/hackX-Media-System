# hackX Media System — Repo Context

Media/display system for the **hackX 11.0 & hackX Jr 9.0 Grand Finals**: OBS-like cue control driving full-screen outputs, synced live (Firebase + same-machine BroadcastChannel) and fully offline-capable (static export + service worker). See README.md for setup and event-day use.

## Stack
Next.js 14 (App Router, `output: "export"`, trailingSlash) · React 18 · TypeScript · Tailwind 3 · Firebase RTDB + Auth (optional — local mode without env vars). Fonts: Inter + Sora via next/font (self-hosted at build).

## Layout
```
app/                    / (home), /control/[channel]/, /output/[channel]/
components/control/     ControlPanel (top bar + CueControl for ceremonies), PitchControl (scene/team/timer for pitch collections), DisplayPicker (project to a monitor), CueList, TimerPanel, WinnersPanel, StatusPills, ControlGate
components/ui/kit.tsx   operator UI kit — Framer-style (black canvas, white pill primary, surface lift for selection, blue only for focus/selected, red only for on-air)
components/scenes/      templates: Brand (loop/still/text), People (person/panel/list), Partner, Pitch (team/timer/guidelines), Award (prizes/winner); CueRenderer + ProgramView (crossfades, panic/black)
components/stage/       Stage (fixed 1920×1080 canvas, scaled), primitives (Backdrop, ShowVideo, logos, Portrait, Confetti…)
content/                brand.ts (events, partners), people.ts, teams.ts, media.ts (video registry), cues.ts (cue model + builder)
content/collections/    opening, closing (cue lists), pitching (jr + hackx, pitch mode), index
lib/                    sync.ts (dual-path sync, newest-wins), actions.ts (operator actions), hooks.ts, clock.ts (server offset), offline.ts (download/update), channels.ts, types.ts
public/sw.js            cache-first SW incl. byte-range video from cache
scripts/                gen-precache.mjs (post-build manifest), serve.mjs (zero-dep local server)
design/tokens.css       colour tokens (RGB triplets → Tailwind `bg-gold/40` etc.)
docs/BRAND.md           palette + asset map
```

## Key rules
- Cue ids = collection:section:label slug — renaming a label changes its id (fine before the show; avoid mid-show).
- Outputs never write state; only Control does. Channel state is one small object written whole.
- Collections with `mode: "pitch"` are driven by `state.pitch` (scene, teamId|null, phase, durations) — no cue list.
- Operator screens use the `ui-*` tokens + `.ui` class; the stage/output keeps the hackX brand tokens. Don't mix them.
- A "timer" cue loads its time on take (idle); the operator starts it. Re-taking the same cue keeps a running clock.
- Winner teams live in channel `overrides` (`winner.<event>.<place>`), set in the Winners panel — never hard-code results.
- New slide type: add a variant to `CueBody` in content/cues.ts, a template in components/scenes, a case in CueRenderer, a tag in CueList.
- Brand: gold `#FFB410` hero on abyss navy `#010814`; Jr uses amber + teal tint. Partner logos only on white cards.
- After changing anything in `public/` or content, `npm run build` regenerates the precache manifest (new version → "Update available" on devices).
- Don't commit/push without being asked. Never commit `.env.local`.
