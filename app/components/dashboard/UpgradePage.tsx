"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Link01Icon,
  SparklesIcon,
  WebhookIcon,
} from "@hugeicons/core-free-icons";
import { PRO_PRICE_LABEL } from "@/lib/relay";
import { cn } from "@/lib/utils";

export function UpgradePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/initialize", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      if (data.checkout_url || data.authorization_url)
        window.location.href = data.checkout_url ?? data.authorization_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <div className="scrollbar-none flex h-full flex-col overflow-auto">
      <div className="border-b border-ink/8 px-6 py-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          <HugeiconsIcon icon={SparklesIcon} size={14} color="currentColor" />
          Helix Pro
        </div>
        <h1 className="font-display mt-4 max-w-2xl text-3xl font-bold tracking-tight text-ink">
          Demo links that survive the meeting. Tunnels that don&apos;t fight each other.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/45">
          Pro is built for the moments you actually need a tunnel — client demos,
          webhook testing, and debugging sessions that run longer than two minutes.
        </p>
        <p className="mt-6 font-mono text-2xl font-semibold text-ink">
          {PRO_PRICE_LABEL}
        </p>
        <button
          type="button"
          disabled={loading}
          onClick={startCheckout}
          className={cn(
            "mt-4 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-dark transition-opacity",
            loading ? "opacity-60" : "hover:opacity-90"
          )}
        >
          {loading ? "Redirecting to Bachs…" : "Upgrade with Bachs"}
        </button>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>

      <div className="grid gap-4 px-6 py-8 lg:grid-cols-2">
        <UseCaseCard
          icon={Link01Icon}
          title="Hand over one URL, keep control"
          body="Password-protected tunnels plus no idle disconnect. Share a clean demo link in the call, send the password separately — your tunnel stays live through the whole presentation."
          featured
        />
        <UseCaseCard
          icon={WebhookIcon}
          title="Three services, three tunnels"
          body="Run your app, webhook receiver, and mock API at the same time. Free tier allows one active tunnel — Pro removes that ceiling so you don't rebuild your workflow."
        />
        <UseCaseCard
          icon={SparklesIcon}
          title="Dig deeper than the last 50 requests"
          body="When something flaky only shows up after request #73, full history (500 per tunnel) is the difference between guessing and knowing."
          className="lg:col-span-2"
        />
      </div>

      <div className="border-t border-ink/8 px-6 py-6">
        <Link
          href="/dashboard/settings"
          className="text-sm text-ink/40 transition-colors hover:text-ink/70"
        >
          Already upgraded? View billing status →
        </Link>
      </div>
    </div>
  );
}

function UseCaseCard({
  icon,
  title,
  body,
  featured,
  className,
}: {
  icon: typeof Link01Icon;
  title: string;
  body: string;
  featured?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-6",
        featured
          ? "border-accent/20 bg-accent/[0.04]"
          : "border-ink/8 bg-panel",
        className
      )}
    >
      <div className="mb-4 flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
        <HugeiconsIcon icon={icon} size={18} color="currentColor" />
      </div>
      <h2 className="text-[15px] font-medium text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink/40">{body}</p>
    </div>
  );
}
