"use client";

import { useCallback, useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { motion, AnimatePresence } from "framer-motion";
import { usePlan } from "@/components/dashboard/PlanContext";
import type { RequestsResponse, TunnelRequest } from "@/lib/relay";
import { cn } from "@/lib/utils";

function statusColor(status: number) {
  if (status >= 200 && status < 300) return "text-accent";
  if (status >= 400 && status < 500) return "text-amber-400";
  if (status >= 500) return "text-red-400";
  return "text-ink/50";
}

function methodColor(method: string) {
  switch (method.toUpperCase()) {
    case "GET":
      return "text-ink/50 bg-ink/10";
    case "POST":
      return "text-accent bg-accent/10";
    case "PUT":
    case "PATCH":
      return "text-amber-400 bg-amber-400/10";
    case "DELETE":
      return "text-red-400 bg-red-400/10";
    default:
      return "text-ink/60 bg-ink/5";
  }
}

function formatTime(ts: string) {
  try {
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return ts;
  }
}

function RequestRow({ req }: { req: TunnelRequest }) {
  const [open, setOpen] = useState(false);
  const id = req.$id ?? `${req.timestamp}-${req.method}-${req.path}`;

  return (
    <div className="border-b border-ink/8">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-6 py-3 text-left transition-colors hover:bg-ink/[0.03]"
      >
        <span
          className={cn(
            "w-14 shrink-0 rounded-md px-1.5 py-0.5 text-center font-mono text-[11px] font-semibold",
            methodColor(req.method)
          )}
        >
          {req.method}
        </span>
        <span className="min-w-0 flex-1 truncate font-mono text-sm text-ink/85">
          {req.path}
        </span>
        <span
          className={cn(
            "w-10 shrink-0 text-right font-mono text-sm tabular-nums",
            statusColor(req.status)
          )}
        >
          {req.status}
        </span>
        <span className="w-16 shrink-0 text-right font-mono text-xs tabular-nums text-ink/40">
          {req.duration_ms}ms
        </span>
        <span className="w-20 shrink-0 text-right font-mono text-xs text-ink/35">
          {formatTime(req.timestamp)}
        </span>
        <HugeiconsIcon
          icon={open ? ArrowUp01Icon : ArrowDown01Icon}
          size={14}
          color="currentColor"
          strokeWidth={2}
          className="shrink-0 text-ink/30"
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3 bg-panel px-6 py-4 text-xs sm:grid-cols-4">
              <div>
                <p className="text-ink/35">Method</p>
                <p className="mt-1 font-mono text-ink/80">{req.method}</p>
              </div>
              <div>
                <p className="text-ink/35">Status</p>
                <p className={cn("mt-1 font-mono", statusColor(req.status))}>
                  {req.status}
                </p>
              </div>
              <div>
                <p className="text-ink/35">Duration</p>
                <p className="mt-1 font-mono text-ink/80">{req.duration_ms}ms</p>
              </div>
              <div>
                <p className="text-ink/35">Timestamp</p>
                <p className="mt-1 font-mono text-ink/80">
                  {new Date(req.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-4">
                <p className="text-ink/35">Path</p>
                <p className="mt-1 break-all font-mono text-ink/80">{req.path}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function RequestTable({ name }: { name: string }) {
  const [requests, setRequests] = useState<TunnelRequest[] | null>(null);
  const [meta, setMeta] = useState<Pick<RequestsResponse, "capped" | "isPro" | "total" | "limit"> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { openUpgrade } = usePlan();

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/requests/${encodeURIComponent(name)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Failed to load requests");
        return;
      }
      const data = (await res.json()) as RequestsResponse;
      setRequests(data.requests);
      setMeta({
        capped: data.capped,
        isPro: data.isPro,
        total: data.total,
        limit: data.limit,
      });
      setError(null);
    } catch {
      setError("Failed to load requests");
    }
  }, [name]);

  useEffect(() => {
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [load]);

  if (error && !requests) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (requests === null) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <span className="size-5 animate-spin rounded-full border-2 border-ink/20 border-t-accent" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16">
        <p className="text-sm text-ink/45">No requests yet.</p>
        <p className="font-mono text-xs text-ink/30">
          Hit your tunnel URL to see traffic here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-ink/8 px-6 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/30">
        <span className="w-14">Method</span>
        <span className="flex-1">Path</span>
        <span className="w-10 text-right">Status</span>
        <span className="w-16 text-right">Time</span>
        <span className="w-20 text-right">When</span>
        <span className="w-3.5" />
      </div>
      {requests.map((req) => (
        <RequestRow
          key={req.$id ?? `${req.timestamp}-${req.method}-${req.path}-${req.duration_ms}`}
          req={req}
        />
      ))}

      {meta?.capped && !meta.isPro && (
        <div className="border-t border-ink/8 px-6 py-4">
          <p className="text-xs text-ink/35">
            Showing the latest {meta.limit} of {meta.total} requests.{" "}
            <button
              type="button"
              onClick={() => openUpgrade("full-history")}
              className="text-accent/80 underline decoration-accent/30 underline-offset-2 transition-colors hover:text-accent"
            >
              Upgrade for full history
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
