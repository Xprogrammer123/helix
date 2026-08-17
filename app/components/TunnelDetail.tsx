"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Link01Icon } from "@hugeicons/core-free-icons";
import { usePlan } from "@/components/dashboard/PlanContext";
import { ProCallout } from "@/components/dashboard/UpgradeModal";
import { TunnelPassword } from "@/components/dashboard/TunnelPassword";
import type { Tunnel, TunnelsResponse } from "@/lib/relay";
import { CopyButton } from "@/components/CopyButton";
import { RequestTable } from "@/components/RequestTable";
import { cn } from "@/lib/utils";

type TunnelDetailProps = {
  name: string;
  publicBase: string;
};

export function TunnelDetail({ name, publicBase }: TunnelDetailProps) {
  const [tunnel, setTunnel] = useState<Tunnel | null>(null);
  const [tunnelMeta, setTunnelMeta] = useState<Pick<TunnelsResponse, "liveCount" | "tunnelLimit" | "isPro"> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { openUpgrade } = usePlan();

  const url = `${publicBase.replace(/\/$/, "")}/tunnel/${name}/`;

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/tunnels");
      if (res.status === 401) {
        window.location.href = "/auth";
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to load tunnel");
      }
      const data = (await res.json()) as TunnelsResponse;
      setTunnel(data.tunnels.find((t) => t.name === name) ?? null);
      setTunnelMeta({
        liveCount: data.liveCount,
        tunnelLimit: data.tunnelLimit,
        isPro: data.isPro,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [name]);

  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div className="scrollbar-none flex h-full flex-col overflow-auto">
      <div className="border-b border-ink/8 px-6 pt-5 pb-5">
        <Link
          href="/dashboard/tunnels"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink/40 transition-colors hover:text-ink/70"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={14} color="currentColor" />
          Tunnels
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="truncate font-display text-2xl font-bold tracking-tight text-ink">
                {name}
              </h1>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                  tunnel?.live
                    ? "bg-accent/15 text-accent"
                    : "bg-ink/5 text-ink/40"
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    tunnel?.live ? "bg-accent" : "bg-ink/30"
                  )}
                />
                {tunnel ? (tunnel.live ? "Live" : "Offline") : "…"}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-1.5">
              <HugeiconsIcon
                icon={Link01Icon}
                size={14}
                color="currentColor"
                className="text-ink/35"
              />
              <code className="truncate font-mono text-sm text-ink/50">
                {url}
              </code>
              <CopyButton value={url} label="URL copied" />
            </div>

            <TunnelPassword
              tunnelName={name}
              passwordProtected={tunnel?.passwordProtected}
            />
          </div>

          <div className="text-right text-sm text-ink/35">
            <div className="font-mono text-lg tabular-nums text-ink/70">
              {tunnel?.requestCount ?? "—"}
            </div>
            <div>total requests</div>
          </div>
        </div>

        {tunnelMeta && !tunnelMeta.isPro && tunnelMeta.liveCount >= 1 && (
          <ProCallout
            className="mt-4"
            onUpgrade={() => openUpgrade("concurrent-tunnels")}
          >
            Running one tunnel on Free. Need a second for webhooks? Pro removes the
            1-tunnel limit.
          </ProCallout>
        )}
      </div>

      <div className="px-6 pt-5 pb-2">
        <h2 className="text-sm font-medium text-ink/50">Recent requests</h2>
        <p className="mt-0.5 text-xs text-ink/30">
          Polling every 3s · newest first
          {tunnelMeta?.isPro ? " · up to 500" : " · max 50 on Free"}
        </p>
      </div>

      {error && (
        <div className="px-6 py-2 text-sm text-red-400">{error}</div>
      )}

      <RequestTable name={name} />
    </div>
  );
}
