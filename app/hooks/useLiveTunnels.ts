"use client";

import { useCallback, useEffect, useState } from "react";
import { useLiveEvent } from "@/components/dashboard/LiveEvents";
import { applyLiveEvent } from "@/lib/live-events";
import type { Tunnel, TunnelsResponse } from "@/lib/relay";

export function useLiveTunnels() {
  const [tunnels, setTunnels] = useState<Tunnel[] | null>(null);
  const [tunnelMeta, setTunnelMeta] = useState<Pick<
    TunnelsResponse,
    "liveCount" | "tunnelLimit" | "isPro"
  > | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/tunnels");
      if (res.status === 401) {
        window.location.href = "/auth";
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to load");
      }
      const data = (await res.json()) as TunnelsResponse;
      setTunnels(data.tunnels);
      setTunnelMeta({
        liveCount: data.liveCount,
        tunnelLimit: data.tunnelLimit,
        isPro: data.isPro,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
      setTunnels((prev) => prev ?? null);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useLiveEvent((event) => {
    setTunnels((prev) => {
      if (!prev) return prev;
      const next = applyLiveEvent(prev, event);
      setTunnelMeta((meta) =>
        meta
          ? { ...meta, liveCount: next.filter((t) => t.live).length }
          : meta
      );
      return next;
    });
  });

  return { tunnels, tunnelMeta, error, reload: load };
}
