"use client";

import { useLiveTunnels } from "@/hooks/useLiveTunnels";
import { TunnelRow } from "@/components/TunnelRow";
import { CopyButton } from "@/components/CopyButton";

const CLI_HINT = "helix myapp 3000";

type TunnelListProps = {
  publicBase: string;
};

export function TunnelList({ publicBase }: TunnelListProps) {
  const { tunnels, error } = useLiveTunnels();

  if (error && tunnels === null) {
    return (
      <div className="px-4 py-10 text-sm text-red-400/90">{error}</div>
    );
  }

  if (tunnels === null) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="size-5 animate-spin rounded-full border-2 border-ink/20 border-t-accent" />
      </div>
    );
  }

  if (tunnels.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 px-4 py-12">
        <p className="text-sm text-ink/45">
          No tunnels yet. Start one from your machine:
        </p>
        <div className="flex items-center gap-2 rounded-xl border border-accent/20 bg-panel py-2 pr-2 pl-4">
          <code className="font-mono text-sm text-accent">{CLI_HINT}</code>
          <CopyButton value={CLI_HINT} label="Command copied" />
        </div>
        <p className="text-xs text-ink/30">
          Tunnels are created via the CLI only — there&apos;s no create button here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {error && (
        <div className="px-4 py-2 text-xs text-amber-400/80">
          Refresh hiccup: {error}
        </div>
      )}
      <div className="flex items-center gap-4 border-b border-ink/8 px-4 py-2 text-xs font-medium uppercase tracking-wide text-ink/30">
        <span className="w-2" />
        <span className="flex-1">Name</span>
        <span className="w-14 text-right">Status</span>
        <span className="w-16 text-right">Requests</span>
      </div>
      {tunnels.map((tunnel) => (
        <TunnelRow
          key={tunnel.name}
          tunnel={tunnel}
          publicBase={publicBase}
        />
      ))}
    </div>
  );
}
