"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import {
  PRO_PRICE_LABEL,
  UPGRADE_TRIGGERS,
  type UpgradeTrigger,
} from "@/lib/relay";
import { cn } from "@/lib/utils";

type UpgradeModalProps = {
  open: boolean;
  trigger: UpgradeTrigger;
  onClose: () => void;
};

export function UpgradeModal({ open, trigger, onClose }: UpgradeModalProps) {
  if (!open) return null;

  const copy = UPGRADE_TRIGGERS[trigger];

  async function startCheckout() {
    const res = await fetch("/api/billing/initialize", { method: "POST" });
    const data = await res.json();
    if (data.checkout_url || data.authorization_url) {
      window.location.href = data.checkout_url ?? data.authorization_url;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-accent/20 bg-panel p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink/70"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} color="currentColor" />
        </button>

        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          <HugeiconsIcon icon={SparklesIcon} size={14} color="currentColor" />
          Helix Pro · {PRO_PRICE_LABEL}
        </div>

        <h2 className="pr-8 font-display text-xl font-bold text-ink">{copy.headline}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/45">{copy.subline}</p>

        <ul className="mt-5 space-y-3 text-sm text-ink/55">
          <ProBullet
            title="Persistent demo links"
            body="No idle disconnect — your tunnel stays up through client calls."
          />
          <ProBullet
            title="Password-protected tunnels"
            body="Share the URL in the meeting, send the password over DM."
          />
          <ProBullet
            title="Concurrent tunnels"
            body="Run Stripe, GitHub, and your app locally — all tunneled at once."
          />
          <ProBullet
            title="Full request history"
            body="Up to 500 logged requests per tunnel for deeper debugging."
          />
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={startCheckout}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-dark transition-opacity hover:opacity-90"
          >
            Upgrade — {PRO_PRICE_LABEL}
          </button>
          <Link
            href="/dashboard/upgrade"
            onClick={onClose}
            className="text-sm text-ink/45 transition-colors hover:text-ink/70"
          >
            View full details
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProBullet({ title, body }: { title: string; body: string }) {
  return (
    <li className="flex gap-3">
      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
      <div>
        <span className="font-medium text-ink/80">{title}</span>
        <span className="text-ink/40"> — {body}</span>
      </div>
    </li>
  );
}

export function ProCallout({
  className,
  children,
  onUpgrade,
}: {
  className?: string;
  children: React.ReactNode;
  onUpgrade?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/15 bg-accent/[0.04] px-4 py-3 text-sm",
        className
      )}
    >
      <p className="text-ink/50">{children}</p>
      {onUpgrade ? (
        <button
          type="button"
          onClick={onUpgrade}
          className="shrink-0 rounded-lg bg-accent/15 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/25"
        >
          Upgrade to Pro
        </button>
      ) : (
        <Link
          href="/dashboard/upgrade"
          className="shrink-0 rounded-lg bg-accent/15 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/25"
        >
          Upgrade to Pro
        </Link>
      )}
    </div>
  );
}
