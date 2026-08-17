"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Activity01Icon,
  ArrowRight01Icon,
  BookOpen01Icon,
  Link01Icon,
  TerminalIcon,
  WebhookIcon,
} from "@hugeicons/core-free-icons";
import { usePlan } from "@/components/dashboard/PlanContext";
import type { Tunnel, TunnelsResponse } from "@/lib/relay";
import { CopyButton } from "@/components/CopyButton";
import { cn } from "@/lib/utils";

const CLI_HINT = "helix myapp 3000";

type DashboardHomeProps = {
  publicBase: string;
};

export function DashboardHome({ publicBase }: DashboardHomeProps) {
  const [tunnels, setTunnels] = useState<Tunnel[] | null>(null);
  const [tunnelMeta, setTunnelMeta] = useState<Pick<TunnelsResponse, "liveCount" | "tunnelLimit" | "isPro"> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { openUpgrade } = usePlan();

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
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, [load]);

  const stats = useMemo(() => {
    if (!tunnels) return null;
    const live = tunnels.filter((t) => t.live).length;
    const requests = tunnels.reduce((sum, t) => sum + t.requestCount, 0);
    return {
      total: tunnels.length,
      live,
      offline: tunnels.length - live,
      requests,
    };
  }, [tunnels]);

  const liveTunnels = useMemo(
    () =>
      (tunnels ?? [])
        .filter((t) => t.live)
        .sort((a, b) => b.requestCount - a.requestCount)
        .slice(0, 5),
    [tunnels]
  );

  const topByTraffic = useMemo(
    () =>
      [...(tunnels ?? [])]
        .sort((a, b) => b.requestCount - a.requestCount)
        .slice(0, 5),
    [tunnels]
  );

  const maxRequests = Math.max(1, ...topByTraffic.map((t) => t.requestCount));

  if (tunnels === null && !error) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="size-5 animate-spin rounded-full border-2 border-ink/20 border-t-accent" />
      </div>
    );
  }

  return (
    <div className="scrollbar-none flex h-full flex-col overflow-auto">
      <div className="flex flex-wrap items-end justify-between gap-4 px-6 pt-6 pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            Overview
          </h1>
          <p className="mt-1 text-sm text-ink/40">
            Live snapshot of your relay — updates every few seconds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
            <span className="size-1.5 animate-pulse rounded-full bg-accent" />
            Live
          </span>
          <Link
            href="/dashboard/tunnels"
            className="inline-flex items-center gap-1 rounded-full bg-ink/5 px-3 py-1.5 text-sm text-ink/70 transition-colors hover:bg-ink/10 hover:text-ink"
          >
            All tunnels
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} color="currentColor" />
          </Link>
        </div>
      </div>

      {error && tunnels === null && (
        <div className="px-6 text-sm text-red-400">{error}</div>
      )}

      <div className="grid gap-3 px-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Tunnels"
          value={
            tunnelMeta?.tunnelLimit != null
              ? `${tunnelMeta.liveCount} / ${tunnelMeta.tunnelLimit}`
              : (stats?.total ?? "—")
          }
          hint={
            tunnelMeta?.tunnelLimit != null
              ? "Live / plan limit"
              : "Claimed names"
          }
          onClick={
            tunnelMeta && !tunnelMeta.isPro && tunnelMeta.liveCount >= 1
              ? () => openUpgrade("concurrent-tunnels")
              : undefined
          }
          delay={0}
        />
        <StatCard
          label="Live now"
          value={stats?.live ?? "—"}
          hint="CLI connected"
          accent
          delay={0.05}
        />
        <StatCard
          label="Offline"
          value={stats?.offline ?? "—"}
          hint="No active socket"
          delay={0.1}
        />
        <StatCard
          label="Requests"
          value={stats?.requests ?? "—"}
          hint="Logged total"
          delay={0.15}
        />
      </div>

      <div className="mt-5 grid flex-1 gap-4 px-6 pb-6 lg:grid-cols-5">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col overflow-hidden rounded-2xl border border-ink/8 bg-panel lg:col-span-3"
        >
          <div className="flex items-center justify-between border-b border-ink/8 px-5 py-4">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={Activity01Icon}
                size={16}
                color="currentColor"
                className="text-accent"
              />
              <h2 className="text-sm font-medium text-ink">Traffic leaders</h2>
            </div>
            <span className="text-xs text-ink/30">by request count</span>
          </div>

          {!tunnels || tunnels.length === 0 ? (
            <EmptyPanel />
          ) : topByTraffic.length === 0 ? (
            <EmptyPanel />
          ) : (
            <ul className="flex flex-col">
              {topByTraffic.map((t, i) => (
                <li key={t.name}>
                  <Link
                    href={`/dashboard/tunnels/${encodeURIComponent(t.name)}`}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-ink/[0.03]"
                  >
                    <span className="w-4 font-mono text-xs text-ink/25">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            t.live ? "bg-accent" : "bg-ink/25"
                          )}
                        />
                        <span className="truncate text-sm font-medium text-ink">
                          {t.name}
                        </span>
                      </div>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink/8">
                        <div
                          className="h-full rounded-full bg-accent/70"
                          style={{
                            width: `${(t.requestCount / maxRequests) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-sm tabular-nums text-ink/45">
                      {t.requestCount}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </motion.section>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-ink/8 bg-panel"
          >
            <div className="flex items-center gap-2 border-b border-ink/8 px-5 py-4">
              <HugeiconsIcon
                icon={WebhookIcon}
                size={16}
                color="currentColor"
                className="text-accent"
              />
              <h2 className="text-sm font-medium text-ink">Live right now</h2>
            </div>

            {liveTunnels.length === 0 ? (
              <div className="flex flex-1 flex-col justify-center gap-2 px-5 py-8">
                <p className="text-sm text-ink/40">No live tunnels.</p>
                <p className="text-xs text-ink/25">
                  Run the CLI to bring one online.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col">
                {liveTunnels.map((t) => {
                  const url = `${publicBase.replace(/\/$/, "")}/tunnel/${t.name}/`;
                  return (
                    <li key={t.name}>
                      <Link
                        href={`/dashboard/tunnels/${encodeURIComponent(t.name)}`}
                        className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-ink/[0.03]"
                      >
                        <span className="size-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_8px_rgba(92,255,177,0.55)]" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">
                            {t.name}
                          </p>
                          <p className="truncate font-mono text-[11px] text-ink/30">
                            {url}
                          </p>
                        </div>
                        <HugeiconsIcon
                          icon={Link01Icon}
                          size={14}
                          color="currentColor"
                          className="text-ink/25"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-ink/8 bg-panel p-5"
          >
            <h2 className="text-sm font-medium text-ink">Quick start</h2>
            <p className="mt-1 text-xs text-ink/35">
              Tunnels are created from the CLI only.
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-accent/20 bg-dark/40 py-2 pr-2 pl-3">
              <HugeiconsIcon
                icon={TerminalIcon}
                size={14}
                color="currentColor"
                className="text-accent"
              />
              <code className="flex-1 font-mono text-xs text-accent">
                {CLI_HINT}
              </code>
              <CopyButton value={CLI_HINT} label="Command copied" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/docs"
                className="inline-flex items-center gap-1.5 rounded-lg bg-ink/5 px-2.5 py-1.5 text-xs text-ink/55 transition-colors hover:bg-ink/10 hover:text-ink"
              >
                <HugeiconsIcon icon={BookOpen01Icon} size={12} color="currentColor" />
                Docs
              </Link>
              <Link
                href="/dashboard/tunnels"
                className="inline-flex items-center gap-1.5 rounded-lg bg-ink/5 px-2.5 py-1.5 text-xs text-ink/55 transition-colors hover:bg-ink/10 hover:text-ink"
              >
                <HugeiconsIcon icon={WebhookIcon} size={12} color="currentColor" />
                Manage tunnels
              </Link>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  accent,
  delay,
  onClick,
}: {
  label: string;
  value: number | string;
  hint: string;
  accent?: boolean;
  delay: number;
  onClick?: () => void;
}) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Wrapper
        type={onClick ? "button" : undefined}
        onClick={onClick}
        className={cn(
          "w-full rounded-2xl border border-ink/8 bg-panel px-5 py-4 text-left",
          accent && "border-accent/25 bg-accent/[0.06]",
          onClick && "cursor-pointer transition-colors hover:border-accent/30"
        )}
      >
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink/35">
        {label}
      </p>
      <p
        className={cn(
          "mt-2.5 font-mono text-3xl font-semibold tabular-nums tracking-tight",
          accent ? "text-accent" : "text-ink"
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-ink/30">{hint}</p>
      </Wrapper>
    </motion.div>
  );
}

function EmptyPanel() {
  return (
    <div className="flex flex-1 flex-col items-start justify-center gap-3 px-5 py-12">
      <p className="text-sm text-ink/45">No tunnels yet.</p>
      <div className="flex items-center gap-2 rounded-xl border border-accent/20 bg-dark/40 py-2 pr-2 pl-4">
        <code className="font-mono text-sm text-accent">{CLI_HINT}</code>
        <CopyButton value={CLI_HINT} label="Command copied" />
      </div>
    </div>
  );
}
