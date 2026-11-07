"use client";

import { CHANNELS } from "@/lib/channels";
import { useChannel } from "@/lib/hooks";
import { getCollection, COLLECTIONS } from "@/content/collections";
import { allCues } from "@/content/cues";
import { useOffline } from "@/lib/offline";
import { isFirebaseConfigured } from "@/lib/firebase";
import { StatusPills } from "@/components/control/StatusPills";
import { ArrowUpRight, Btn, Caption, Card } from "@/components/ui/kit";

export default function Home() {
  const off = useOffline();
  return (
    <main className="ui min-h-dvh px-6 pb-20 pt-10">
      <div className="mx-auto max-w-[1100px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/hackx/logo-on-dark.png" alt="hackX" className="h-11" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/hackx-jr/logo-on-dark.png" alt="hackX Jr" className="h-11" />
          </div>
          <StatusPills />
        </div>

        <h1 className="ui-display mt-16 text-[clamp(56px,9vw,110px)]">Grand Finals media</h1>
        <p className="mt-5 max-w-xl text-[18px] leading-snug text-ui-muted">hackX 11.0 & hackX Jr 9.0. Choose a screen to control, or open its output.</p>

        <div className="mt-14 grid gap-3 md:grid-cols-3">
          {CHANNELS.map((c) => (
            <ChannelCard key={c.id} id={c.id} name={c.name} />
          ))}
        </div>

        <h2 className="ui-display mt-20 text-[32px]">Scene collections</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {COLLECTIONS.map((c) => (
            <Card key={c.id} className="p-5">
              <p className="text-[17px] font-medium">{c.name}</p>
              <p className="mt-1 text-[14px] leading-snug text-ui-muted">{c.description}</p>
              <Caption className="mt-3">{c.mode === "pitch" ? "Pitch control · scene, team, timer" : `${c.sections.length} sections · ${allCues(c).length} cues`}</Caption>
            </Card>
          ))}
        </div>

        <h2 className="ui-display mt-20 text-[32px]">This device</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Card className="p-5">
            <Caption>Sync</Caption>
            <p className="mt-2 text-[15px] leading-snug">{isFirebaseConfigured ? "Firebase realtime sync, plus direct sync between windows on this computer." : "Local mode. No Firebase configured — windows on this computer sync with each other only."}</p>
          </Card>
          <Card className="p-5">
            <Caption>Offline</Caption>
            <p className="mt-2 text-[15px] leading-snug">
              {!off.supported
                ? "Offline cache needs a production build (npm run build && npm start)."
                : off.ready
                  ? `Saved on this device (version ${off.installedVersion}). Runs with no internet.`
                  : "Not saved yet — do this on every device before the event."}
            </p>
            {off.supported && (
              <Btn size="md" variant={off.ready ? "secondary" : "primary"} className="mt-4" onClick={() => off.download()} disabled={off.busy}>
                {off.busy ? `Downloading ${Math.round(off.progress * 100)}%` : off.ready ? "Download again" : "Make available offline"}
              </Btn>
            )}
            {off.error && <p className="mt-2 text-[13px] text-[#ff6b5e]">{off.error}</p>}
          </Card>
        </div>
      </div>
    </main>
  );
}

function ChannelCard({ id, name }: { id: string; name: string }) {
  const state = useChannel(id);
  const coll = getCollection(state.collectionId);
  return (
    <Card className="flex flex-col p-5">
      <p className="ui-display text-[30px]">{name}</p>
      <p className="mt-2 text-[14px] text-ui-muted">{coll.name}</p>
      <div className="mt-8 flex gap-2">
        <a href={`/control/${id}/`} className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-white text-[14px] font-medium text-black transition active:scale-[0.97]">
          Control
        </a>
        <a href={`/output/${id}/`} target={`out-${id}`} className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-ui-s2 text-[14px] font-medium hover:bg-ui-s3">
          Output <ArrowUpRight />
        </a>
      </div>
    </Card>
  );
}
