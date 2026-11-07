"use client";

// "Project to display" — like OBS's Fullscreen Projector. Lists the monitors
// connected to this computer (Chrome/Edge Window Management API) and opens the
// output window directly on the chosen one. The operator clicks "Start output"
// once on the projector (browsers only allow fullscreen + sound after a click).
// Falls back to a normal output window where the API isn't available.

import { useCallback, useEffect, useState } from "react";
import { Btn, Select } from "@/components/ui/kit";

interface ScreenInfo {
  label: string;
  isPrimary: boolean;
  isInternal: boolean;
  availLeft: number;
  availTop: number;
  availWidth: number;
  availHeight: number;
  width: number;
  height: number;
}
interface ScreenDetails extends EventTarget {
  screens: ScreenInfo[];
}
declare global {
  interface Window {
    getScreenDetails?: () => Promise<ScreenDetails>;
  }
}

const projectors = new Map<string, Window>();

function describe(s: ScreenInfo, i: number) {
  const name = s.label || `Display ${i + 1}`;
  return `${name} · ${s.width}×${s.height}${s.isPrimary ? " · main" : ""}`;
}

export function DisplayPicker({ channelId }: { channelId: string }) {
  const supported = typeof window !== "undefined" && typeof window.getScreenDetails === "function";
  const [screens, setScreens] = useState<ScreenInfo[] | null>(null);
  const [choice, setChoice] = useState<string>("");
  const [open, setOpen] = useState(false);
  const key = `hxm:display:${channelId}`;
  const url = `/output/${channelId}/`;

  const load = useCallback(async () => {
    if (!window.getScreenDetails) return;
    try {
      const d = await window.getScreenDetails();
      const update = () => setScreens([...d.screens]);
      update();
      d.addEventListener("screenschange", update);
    } catch {
      setScreens([]);
    }
  }, []);

  // Re-read silently if permission was granted before.
  useEffect(() => {
    setChoice(localStorage.getItem(key) ?? "");
    if (!supported) return;
    navigator.permissions
      ?.query({ name: "window-management" as PermissionName })
      .then((p) => {
        if (p.state === "granted") load();
      })
      .catch(() => {});
  }, [key, supported, load]);

  // track whether our projector window is still open
  useEffect(() => {
    const id = setInterval(() => setOpen(!!projectors.get(channelId) && !projectors.get(channelId)!.closed), 1000);
    return () => clearInterval(id);
  }, [channelId]);

  const project = () => {
    const idx = screens?.findIndex((s, i) => describe(s, i) === choice) ?? -1;
    const s = idx >= 0 ? screens![idx] : null;
    projectors.get(channelId)?.close();
    const features = s ? `popup,left=${s.availLeft},top=${s.availTop},width=${s.availWidth},height=${s.availHeight}` : "popup,width=1280,height=720";
    const w = window.open(`${url}?display=1`, `projector-${channelId}`, features);
    if (w) {
      projectors.set(channelId, w);
      if (s) {
        // some window managers ignore left/top on open — nudge it there
        try {
          w.moveTo(s.availLeft, s.availTop);
          w.resizeTo(s.availWidth, s.availHeight);
        } catch {}
      }
      setOpen(true);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {supported && screens === null && (
        <Btn size="sm" onClick={load} title="Lets the browser list your connected monitors">
          Find displays
        </Btn>
      )}
      {screens && screens.length > 0 && (
        <Select
          value={choice}
          onChange={(e) => {
            setChoice(e.target.value);
            localStorage.setItem(key, e.target.value);
          }}
          title="Display to project the output on"
        >
          <option value="">Choose display…</option>
          {screens.map((s, i) => (
            <option key={i} value={describe(s, i)}>
              {describe(s, i)}
            </option>
          ))}
        </Select>
      )}
      {open ? (
        <Btn size="sm" variant="live" onClick={() => projectors.get(channelId)?.close()} title="Close the projector window">
          Projecting · close
        </Btn>
      ) : (
        <Btn size="sm" variant="primary" onClick={project} disabled={!!screens?.length && !choice}>
          {screens?.length ? "Project" : "Open output"}
        </Btn>
      )}
    </div>
  );
}
