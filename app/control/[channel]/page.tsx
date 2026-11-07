import { CHANNEL_IDS } from "@/lib/channels";
import { ControlPanel } from "@/components/control/ControlPanel";

export function generateStaticParams() {
  return CHANNEL_IDS.map((channel) => ({ channel }));
}

export default function ControlPage({ params }: { params: { channel: string } }) {
  return <ControlPanel channelId={params.channel} />;
}
