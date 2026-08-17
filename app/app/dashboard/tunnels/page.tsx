import { TunnelList } from "@/components/TunnelList";
import { getPublicRelayUrl } from "@/lib/relay";

export default function TunnelsPage() {
  const publicBase = getPublicRelayUrl();

  return (
    <div className="scrollbar-none flex h-full flex-col overflow-auto">
      <div className="flex items-end justify-between gap-4 px-6 pt-6 pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            Tunnels
          </h1>
          <p className="mt-1 text-sm text-ink/40">
            Live status and request counts from your relay.
          </p>
        </div>
      </div>
      <TunnelList publicBase={publicBase} />
    </div>
  );
}
