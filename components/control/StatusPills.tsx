"use client";

import { useSyncStatus } from "@/lib/hooks";
import { useOffline } from "@/lib/offline";

// Sync + offline readiness. Neutral pills; colour only when something needs attention.
export function StatusPills() {
  const sync = useSyncStatus();
  const off = useOffline();

  const s = !sync
    ? { dot: "bg-ui-muted", text: "…" }
    : sync.error
      ? { dot: "bg-ui-live", text: sync.error }
      : sync.mode === "local"
        ? { dot: "bg-ui-muted", text: "Local mode" }
        : !sync.connected
          ? { dot: "bg-[#ffd166]", text: sync.pending ? "Offline · changes queued" : "Offline · local screens live" }
          : sync.pending
            ? { dot: "bg-ui-accent", text: "Syncing" }
            : { dot: "bg-[#30d158]", text: "Online" };

  const pill = "inline-flex h-8 items-center gap-2 rounded-full bg-ui-s1 px-3 text-[13px] text-ui-ink/90";
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={pill} title={sync?.mode === "local" ? "No Firebase config — windows on this computer sync with each other" : undefined}>
        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
        {s.text}
      </span>
      {off.supported &&
        (off.busy ? (
          <span className={pill}>Downloading {Math.round(off.progress * 100)}%</span>
        ) : off.updateAvailable ? (
          <button onClick={() => confirm("Download the update and reload this window?") && off.download(true)} className={`${pill} !bg-white !text-black`}>
            Update available
          </button>
        ) : off.ready ? (
          <span className={pill} title={`Offline copy · version ${off.installedVersion}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-[#30d158]" />
            Offline ready
          </span>
        ) : (
          <button onClick={() => off.download()} className={`${pill} hover:bg-ui-s2`} title={off.error ?? "Save everything on this device for offline use"}>
            <span className="h-1.5 w-1.5 rounded-full bg-[#ffd166]" />
            {off.error ? "Download failed · retry" : "Make offline"}
          </button>
        ))}
    </div>
  );
}
