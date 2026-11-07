# hackX Media — Grand Finals

Media and display system for the **hackX 11.0 & hackX Jr 9.0 Grand Finals**. It works like OBS: an operator panel with Preview/Program and a cue list, driving full-screen outputs on projectors (or in OBS for streaming). Outputs sync in real time across devices and keep working offline.

## Scene collections (from the draft script)

| Collection | Where | What's in it |
|---|---|---|
| **Opening Ceremony** | Main Hall | loops/stills, intro, DIM and NSF videos, speaker stills, partner loops + ads, guidelines, cash prizes (step reveal), judge videos + panels |
| **hackX Jr 9.0 Pitching** | Main Hall | Pitch control: Scene (Still · Team intro · Pitching · Loop · Pitching-begins video) → Team (any of 15, or none) → Timer (7:00 pitch, 4:00 Q&A, 10:00 with translator) |
| **hackX 11.0 Pitching** | Hall 2 | Same pitch control: 7:00 pitch, 5:00 Q&A |
| **Awards & Closing** | Main Hall | journey video, TOA lists, judge speech, 6 winner reveals plus Most Popular, partner stills, vote of thanks, anthem |

Content is **code**: `content/` (people, teams, partners, videos) and `content/collections/` (the cue lists). Edit, push, redeploy.

## Pages

- `/` — home: channels, offline download, status
- `/control/<channel>/` — operator panel (`main`, `hall-2`, `spare`)
- `/output/<channel>/` — the screen. Options: `?autostart=1` skips the click-to-start screen (for OBS), `?transparent=1` removes the black letterbox

### Showing the output on a projector
- **Project to display** (top bar, Chrome/Edge): click *Find displays* once and allow it. Then pick a monitor (listed by name and resolution, like OBS) and click *Project*. The output window opens on that monitor; click *Start output* there once for fullscreen and sound.
- **Output tab ↗**: opens the output in a normal tab. Use it for window capture, or drag it to a screen yourself.
- **OBS**: Browser Source (below).

### Pitching control keys
`1`–`5` scenes · `S`/`Space` start/pause · `Q` pitch ↔ Q&A · `P` panic · `B` black. Durations are edited live. While the timer is stopped, drag the slider or use ±10/30s to set the exact time.

### Ceremony (cue list) keys
`Space` GO (next reveal step, otherwise take the preview and move on) · `Enter` take preview · `↑ ↓` move preview · `←` step back · `S` start/pause timer · `R` reset timer · `P`/`Esc` panic → loop · `B` black · double-click a cue = take now

## How sync works

Every change goes out on **two paths at once**: Firebase (to every device) and a browser channel (to other windows on the same laptop). The newest change wins everywhere.

- **Internet drops:** the laptop running Control *and* its projector window keep working normally. Other devices hold their last screen; timers keep counting. Changes made while offline are saved and pushed when the connection returns, even after a reload.
- **No Firebase configured:** *local mode*. Everything works on one machine, with no login.

## Offline

The app is a static export plus a service worker. On each device, before the event, open the home page or Control and click **"Not offline yet – download"** (or **Make available offline**). When it shows **Offline ready**, that device runs with **no internet at all**: pages, logos, fonts and videos all load from the cache. After a new deploy the panel shows **Update available**. Nothing changes until you click it, so a show is never updated mid-segment.

You can also run it from the laptop itself with no internet or hosting:

```bash
npm run build
```

```bash
npm start
```

Then open http://localhost:3000.

## Setup

```bash
npm install
```

```bash
npm run dev
```

(Dev mode has no offline cache; use `npm run build && npm start` to test offline.)

### Firebase (for multi-device sync)
1. Create a Firebase project → **Realtime Database** and **Authentication → Email/Password**.
2. Copy `.env.local.example` to `.env.local` and fill it in. On Vercel, add the same variables in Project Settings → Environment Variables.
3. Publish `database.rules.json` (Database → Rules): anyone can read the screens; only operators can write.
4. Create the operator user(s) in Authentication, then in the database add `admins/<uid>: true` for each.

### Deploy (Vercel)
Import the repo; Vercel detects Next.js. The build runs `next build` plus the precache script and publishes `out/`. `vercel.json` makes sure `sw.js` and the manifest are never cached by the CDN.

## Replacing placeholders

- **Videos:** drop files in `public/media/videos/`, then in `content/media.ts` set `src: "/media/videos/<file>.mp4"` and remove `placeholder`. Until then the Poseidon stage video plays with a "PLACEHOLDER" tag.
- **Photos:** put them in `public/media/people/` or `public/media/teams/` and set `photo` on the person or team. Without a photo, a monogram is shown.
- **Partner logos:** Escape the Room, Helakuru, Waters Edge and Perfect Events have no logo file yet (typographic placeholder). Add a white-background PNG to `public/partners/` and set `logo` in `content/brand.ts`.
- **Names marked `[...]`** in `content/people.ts` are still TBA in the script.
- **Winners** are picked on the day in Control → **Winners** (never in code).

## Event-day checklist

1. On every device: open the app online → **download** → wait for **Offline ready**. Install it as an app (Chrome menu → *Install*).
2. Operators sign in while online (the sign-in persists offline).
3. Run each projector window on the **same laptop** as its Control panel. Open the output, drag it to the projector, click **Start output** (this enables sound and fullscreen). `F` toggles fullscreen.
4. OBS/stream: add a Browser Source at `/output/main/?autostart=1`, 1920×1080, with "Control audio via OBS" ticked.
5. Keep a phone hotspot ready as backup internet for cross-device sync.
