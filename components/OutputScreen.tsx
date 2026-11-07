"use client";

import { useEffect, useState } from "react";
import { getChannel } from "@/lib/channels";
import { useChannel, useSyncStatus, useWakeLock } from "@/lib/hooks";
import { Stage, RenderModeContext } from "@/components/stage/Stage";
import { ProgramView } from "@/components/scenes/CueRenderer";

// The projector / OBS output for one channel. Read-only: it never writes state.
//   ?transparent=1  no black letterbox (OBS)
//   ?autostart=1    skip the click-to-start screen (OBS allows sound without a click)
export function OutputScreen({ channelId }: { channelId: string }) {
  const state = useChannel(channelId);
  const sync = useSyncStatus();
  const [opts, setOpts] = useState({ transparent: false, autostart: false });
  const [started, setStarted] = useState(false);
  const [cursor, setCursor] = useState(true);
  useWakeLock();

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const o = { transparent: q.get("transparent") === "1", autostart: q.get("autostart") === "1" };
    setOpts(o);
    if (o.autostart) setStarted(true);
    if (o.transparent) document.body.style.background = "transparent";
  }, []);

  // hide the cursor while idle; F toggles fullscreen
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const wake = () => {
      setCursor(true);
      clearTimeout(t);
      t = setTimeout(() => setCursor(false), 2000);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") toggleFullscreen();
    };
    wake();
    window.addEventListener("pointermove", wake);
    window.addEventListener("keydown", key);
    return () => {
      clearTimeout(t);
      window.removeEventListener("pointermove", wake);
      window.removeEventListener("keydown", key);
    };
  }, []);

  if (!getChannel(channelId)) return <p className="p-10 text-xl">Unknown channel “{channelId}”.</p>;

  return (
    <div className="fixed inset-0" style={{ cursor: cursor ? "default" : "none" }} onDoubleClick={() => toggleFullscreen()}>
      <RenderModeContext.Provider value={{ monitor: false, audio: started }}>
        <Stage transparent={opts.transparent}>
          <ProgramView state={state} />
        </Stage>
      </RenderModeContext.Provider>

      {!started && (
        <button
          onClick={() => {
            setStarted(true);
            toggleFullscreen(true);
          }}
          className="ui absolute inset-0 z-50 flex flex-col items-center justify-center gap-5 !bg-black/75 backdrop-blur-sm"
        >
          <span className="inline-flex h-16 items-center rounded-full bg-white px-10 text-[20px] font-medium text-black">Start output</span>
          <span className="text-[15px] text-ui-muted">
            {getChannel(channelId)?.name} · click once on this display — fullscreen + sound · F toggles fullscreen
          </span>
        </button>
      )}

      {cursor && sync && (
        <div className="absolute bottom-3 right-3 z-40 rounded-full bg-black/70 px-4 py-1.5 font-mono text-xs text-white/70">
          {getChannel(channelId)?.name} · {sync.mode === "local" ? "local mode" : sync.connected ? "online" : "OFFLINE – holding last state"}
        </div>
      )}
    </div>
  );
}

function toggleFullscreen(force?: boolean) {
  if (!document.fullscreenElement || force) {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
  } else document.exitFullscreen?.();
}
