"use client";

import { createContext, useContext, useLayoutEffect, useRef, useState } from "react";

export const STAGE_W = 1920;
export const STAGE_H = 1080;

// Everything on screen is designed on a fixed 1920×1080 canvas, then scaled to
// fit (letterboxed). Same pixels on the projector, in OBS and in the monitors.
export function Stage({ children, transparent = false, className = "" }: { children: React.ReactNode; transparent?: boolean; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setScale(Math.min(el.clientWidth / STAGE_W, el.clientHeight / STAGE_H));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={box} className={`relative h-full w-full overflow-hidden ${transparent ? "" : "bg-black"} ${className}`}>
      <div
        className="absolute left-1/2 top-1/2 overflow-hidden"
        style={{
          width: STAGE_W,
          height: STAGE_H,
          transform: `translate(-50%, -50%) scale(${scale})`,
          visibility: scale ? "visible" : "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Whether this render is the real output (sound on, after the operator has
// clicked to activate) or a muted monitor in the control panel.
export interface RenderMode {
  monitor: boolean;
  audio: boolean;
}

export const RenderModeContext = createContext<RenderMode>({ monitor: false, audio: false });
export const useRenderMode = () => useContext(RenderModeContext);
