"use client";

import { useEffect, useState } from "react";
import type { Cue } from "@/content/cues";
import { getCollection, findCue } from "@/content/collections";
import type { Brand, ChannelState, EventId, PitchState } from "@/lib/types";
import { teamsOf } from "@/content/teams";
import { ShowVideo } from "@/components/stage/primitives";
import { BlackScene, BrandScene, TextScene } from "./BrandScenes";
import { ListScene, PanelScene, PersonScene } from "./PeopleScenes";
import { PartnerScene, PartnerWallScene } from "./PartnerScenes";
import { GuidelinesScene, TeamScene, TimerScene } from "./PitchScenes";
import { PrizesScene, WinnerScene } from "./AwardScenes";

// One cue → its template.
export function CueRenderer({ cue, step, state, takenAt, fallbackBrand }: { cue: Cue; step: number; state: ChannelState; takenAt: number; fallbackBrand: Brand }) {
  switch (cue.kind) {
    case "loop":
      return <BrandScene brand={cue.brand} motion title={cue.title} subtitle={cue.subtitle} />;
    case "still":
      return <BrandScene brand={cue.brand} motion={false} title={cue.title} subtitle={cue.subtitle} />;
    case "video":
      return <VideoCue cue={cue} takenAt={takenAt} fallbackBrand={fallbackBrand} />;
    case "person":
      return <PersonScene brand={cue.brand} person={cue.person} eyebrow={cue.eyebrow} video={cue.video} takenAt={takenAt} />;
    case "panel":
      return <PanelScene brand={cue.brand} eyebrow={cue.eyebrow} title={cue.title} people={cue.people} step={step} />;
    case "list":
      return <ListScene brand={cue.brand} eyebrow={cue.eyebrow} title={cue.title} people={cue.people} />;
    case "partner":
      return <PartnerScene brand={cue.brand} partnerIds={cue.partnerIds} tier={cue.tier} motion={!!cue.motion} />;
    case "partnerWall":
      return <PartnerWallScene brand={cue.brand} title={cue.title} />;
    case "text":
      return <TextScene brand={cue.brand} eyebrow={cue.eyebrow} title={cue.title} body={cue.body} />;
    case "guidelines":
      return <GuidelinesScene event={cue.event} title={cue.title} bullets={cue.bullets} />;
    case "prizes":
      return <PrizesScene brand={cue.brand} groups={cue.groups} step={step} />;
    case "team":
      return <TeamScene teamId={cue.teamId} index={cue.index} total={cue.total} />;
    case "timer":
      return <TimerScene event={cue.event} teamId={cue.teamId} phase={cue.phase} timer={state.timer} />;
    case "winner":
      return <WinnerScene event={cue.event} place={cue.place} teamId={state.overrides[cue.slot]} prize={cue.prize} revealed={!!cue.revealed || step >= 1} />;
    case "black":
      return <BlackScene />;
  }
}

// A video that ends falls back to the still, never to a frozen/black frame.
function VideoCue({ cue, takenAt, fallbackBrand }: { cue: Extract<Cue, { kind: "video" }>; takenAt: number; fallbackBrand: Brand }) {
  const [ended, setEnded] = useState(false);
  useEffect(() => setEnded(false), [takenAt, cue.id]);
  if (ended) return <BrandScene brand={cue.brand ?? fallbackBrand} motion={false} />;
  return <ShowVideo id={cue.video} takenAt={takenAt} loop={cue.loop} onEnded={() => setEnded(true)} />;
}

// Pitch mode: scene + team + timer from state.pitch.
function PitchRenderer({ pitch, state, event }: { pitch: PitchState; state: ChannelState; event: EventId }) {
  const teams = teamsOf(event);
  switch (pitch.scene) {
    case "still":
      return <BrandScene brand={event} motion={false} />;
    case "loop":
      return <BrandScene brand={event} motion />;
    case "intro": {
      const i = teams.findIndex((t) => t.id === pitch.teamId);
      return i < 0 ? <BrandScene brand={event} motion /> : <TeamScene teamId={teams[i].id} index={i + 1} total={teams.length} />;
    }
    case "timer":
      return <TimerScene event={event} teamId={pitch.teamId ?? undefined} phase={pitch.phase} timer={state.timer} />;
    case "video":
      return <VideoCue cue={{ kind: "video", brand: event, video: "pitchingBegins", id: "pitch-video", label: "" }} takenAt={pitch.sceneAt} fallbackBrand={event} />;
  }
}

type Layer = { key: string; cue: Cue | null; takenAt: number; pitch?: PitchState };

// What a channel shows right now: the program (cue, or pitch scene) with
// crossfades between them, plus PANIC / BLACK overlays on top.
export function ProgramView({ state }: { state: ChannelState }) {
  const coll = getCollection(state.collectionId);
  const pitchMode = coll.mode === "pitch" && coll.event;
  const cue = findCue(state.collectionId, state.program.cueId);
  const p = state.pitch;
  const key = pitchMode
    ? `${state.collectionId}|pitch|${p.scene}|${p.scene === "intro" ? p.teamId : ""}|${p.scene === "video" ? p.sceneAt : ""}`
    : `${state.collectionId}|${state.program.cueId}|${state.program.takenAt}`;

  const [layers, setLayers] = useState<Layer[]>([]);
  useEffect(() => {
    setLayers((prev) => {
      if (prev.length && prev[prev.length - 1].key === key) return prev;
      return [...prev.slice(-1), { key, cue, takenAt: state.program.takenAt, pitch: pitchMode ? p : undefined }];
    });
    const t = setTimeout(() => setLayers((prev) => prev.slice(-1)), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <div className="absolute inset-0 bg-black">
      {layers.map((l, i) => {
        const top = i === layers.length - 1;
        return (
          <div key={l.key} className={`absolute inset-0 ${i > 0 ? "layer-in" : ""}`}>
            {l.pitch && coll.event ? (
              <PitchRenderer pitch={top ? p : l.pitch} state={state} event={coll.event} />
            ) : l.cue ? (
              <CueRenderer cue={l.cue} step={top ? state.program.step : 0} state={state} takenAt={l.takenAt} fallbackBrand={coll.brand} />
            ) : (
              <CueRenderer cue={coll.fallback} step={0} state={state} takenAt={0} fallbackBrand={coll.brand} />
            )}
          </div>
        );
      })}
      {state.overlay === "panic" && (
        <div className="layer-in absolute inset-0 z-40">
          <CueRenderer cue={coll.fallback} step={0} state={state} takenAt={0} fallbackBrand={coll.brand} />
        </div>
      )}
      {state.overlay === "black" && <div className="layer-in absolute inset-0 z-50 bg-black" />}
    </div>
  );
}
