"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link01Icon } from "@hugeicons/core-free-icons";
import type { Tunnel } from "@/lib/relay";
import { cn } from "@/lib/utils";

type TunnelRowProps = {
  tunnel: Tunnel;
  publicBase: string;
};

export function TunnelRow({ tunnel, publicBase }: TunnelRowProps) {
  const url = `${publicBase.replace(/\/$/, "")}/tunnel/${tunnel.name}/`;

  return (
    <Link
      href={`/dashboard/tunnels/${encodeURIComponent(tunnel.name)}`}
      className="group flex items-center gap-4 border-b border-ink/8 px-4 py-3.5 transition-colors hover:bg-ink/[0.03] last:border-b-0"
    >
      <span
        className={cn(
          "size-2 shrink-0 rounded-full",
          tunnel.live ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.45)]" : "bg-ink/25"
        )}
        title={tunnel.live ? "Live" : "Offline"}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[15px] font-medium text-ink">
          {tunnel.name}
        </span>
        <span className="flex items-center gap-1.5 truncate font-mono text-xs text-ink/35">
          <HugeiconsIcon icon={Link01Icon} size={12} color="currentColor" />
          {url}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-6 text-sm text-ink/45">
        <span className={tunnel.live ? "text-accent" : "text-ink/35"}>
          {tunnel.live ? "Live" : "Offline"}
        </span>
        <span className="w-16 text-right font-mono tabular-nums">
          {tunnel.requestCount}
        </span>
      </div>
    </Link>
  );
}
