import { CHANNEL_IDS } from "@/lib/channels";
import { OutputScreen } from "@/components/OutputScreen";

export function generateStaticParams() {
  return CHANNEL_IDS.map((channel) => ({ channel }));
}

export default function OutputPage({ params }: { params: { channel: string } }) {
  return <OutputScreen channelId={params.channel} />;
}
