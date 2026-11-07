# hackX Media System — Repo Context

Media/display system for the **hackX Final event**: screens (projector, waiting room, etc.) driven live by an operator panel. It reuses ideas and code from the semi-finals app **IdeaXTeamHandling** (`jtharindudhanushka/IdeaXTeamHandling`, folder `pitch-timer/`).

> Status: just started. Assets, palette and data are in place; **no app code yet.** Requirements for the Final are still to be defined — ask before assuming features.

## Layout

```
public/                 served at /
  brand/hackx/          hackX logo (logo-on-dark / logo-on-light)
  brand/hackx-jr/       hackX Jr logo
  brand/rounds/         ideax.png, innox.png
  sponsors/<id>/        primary sponsors (Ministry, NSF) on-dark / on-light
  partners/             partner logos — WHITE backgrounds only
  stage/                Poseidon looping video + poster
data/partners.json      sponsor + partner list, display order, dominant colours
design/tokens.css       colour tokens (RGB triplets for Tailwind alpha)
docs/BRAND.md           palette, logo map, open questions
docs/REUSE-MAP.md       what to port from IdeaXTeamHandling and how it works
```

## Stack (planned, mirrors the source app)
Next.js 14 (App Router) · React 18 · TypeScript · Tailwind 3 · Firebase Realtime Database + Auth. Inter font.

## Brand rules
- Gold (`#FFB410`) is the hero brand colour; stage background is deep navy `#010814`. See `docs/BRAND.md`.
- Use the `on-dark` logo variants on dark backgrounds, `on-light` on light.
- Partner logos are only legible on white — always put them on a white card/strip.
- hackX Jr uses the teal variant of the stage palette.

## Architecture to carry over (details in docs/REUSE-MAP.md)
- One state object per event in Firebase RTDB at `events/<eventId>/session`; operator writes, screens subscribe.
- Timers store a server-time `endsAt`, not a ticking value; clients correct for Firebase server offset.
- The operator picks "scenes" per screen (OBS-style) — screens never change on their own.
- Operator access via Firebase Auth + `admins/<event>/<uid>` check, enforced in `database.rules.json`.
- Offline-tolerant: localStorage cache of last state, service worker for assets, wake lock on display screens.

## Conventions
- Never commit `.env.local` or Firebase keys; keep an `.env.local.example`.
- Don't run `git push` / commit without being asked.
- Source repo clone (for reference only): `../IdeaXTeamHandling`.
