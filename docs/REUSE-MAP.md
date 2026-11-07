# Reuse Map — IdeaXTeamHandling → hackX Media System

Source: `IdeaXTeamHandling/pitch-timer/` (ignore the stale root-level `app/` and `lib/`, an older version).

## How the source app works
- **State:** `Session` object per event at `events/<eventId>/session` (`lib/types.ts`). `normalize()` in `lib/db.ts` repairs RTDB quirks (dropped empty arrays, sparse arrays as objects).
- **Timer:** `endsAt` (server-time epoch ms) + `timeRemaining`; `lib/clock.ts` computes remaining time locally every 250 ms with Firebase's `.info/serverTimeOffset`. No per-second writes.
- **Scenes:** pitch screen `timer | brand | partners`; waiting screen `teams | call | brand | partners`. Chosen by the MC.
- **Events/branding:** `lib/events.ts` — `hackx`, `hackxjr`; logos per theme, sponsors, partner list.
- **Theming:** CSS variables per `[data-event][data-theme]` in `app/globals.css`; `EventShell` sets them.
- **Auth:** `ControlGate` (email/password → `admins/<event>/<uid>`), mirrored in `database.rules.json` (public read, admin-only write).
- **Resilience:** localStorage session cache, pending-write counter + `beforeunload` warning, "Reconnecting…" notice, `sw.js` (cache-first for `/brand/` and build assets, network-first otherwise), screen wake lock.
- **Demo mode:** with no Firebase env vars everything runs from localStorage and the control panel needs no login.

## Reuse candidates
| Source file | Verdict | Notes |
|---|---|---|
| `lib/firebase.ts`, `lib/db.ts`, `lib/clock.ts` | Reuse as-is | Generic; only the `pitch-timer:` localStorage key prefix is app-specific |
| `components/hooks.ts` | Reuse | `useEventSession`, `useConnectionLost`, `useSyncStatus`, `useWakeLock` |
| `components/ControlGate.tsx`, `database.rules.json` | Reuse | Rename "MC Control" copy |
| `components/ServiceWorker.tsx`, `public/sw.js` | Reuse | Cache name `pitch-timer-v2` → rename; **`/sponsors/`, `/partners/`, `/stage/` are not in the cache-first list** (they were `/brand/` only) — add them |
| `components/brand.tsx` | Reuse | `EventShell`, `Logo`, `ScreenCorner` (fullscreen button), `ReconnectingNotice`; `BrandHeader` reads the old `eventLogo` structure |
| `components/VideoStage.tsx`, `scenes.tsx` | Reuse | Brand still, partner slideshow, marquee; video paths now `/stage/poseidon-trident.mp4` |
| `lib/events.ts` | Adapt | Logo paths changed in this repo (see below); add Final-specific config |
| `lib/types.ts` | Adapt | `Session` is pitch-specific; design a media-oriented state |
| `app/globals.css` | Adapt | Tokens moved to `design/tokens.css`; per-event theme blocks need re-pointing at the gold palette |
| `ControlPanel.tsx` (776 lines), `RingTimer`, `useTimerAlerts`, `SplitTeams`, `AtlantisStage`, `PatternWaves` (957 lines), `Spotlight` | Decide later | Pitch/queue-specific or heavy visuals — take only if the Final needs them |

## Asset path changes
| Old (`/brand/…`, `/partners/NN-…`) | New |
|---|---|
| `/brand/hackx-on-{dark,light}.png` | `/brand/hackx/logo-on-{dark,light}.png` |
| `/brand/hackxjr-on-{dark,light}.png` | `/brand/hackx-jr/logo-on-{dark,light}.png` |
| `/brand/ideax.png`, `/brand/innox.png` | `/brand/rounds/ideax.png`, `/brand/rounds/innox.png` |
| `/brand/ministry-on-{dark,light}.png` | `/sponsors/ministry-of-science-and-technology/on-{dark,light}.png` |
| `/brand/nsf-on-{dark,light}.png` | `/sponsors/national-science-foundation/on-{dark,light}.png` |
| `/partners/01-ministry.png` … `09-virtusa.png` | `/partners/<slug>.png`, order in `data/partners.json` |
| `/stage/…` | unchanged |
