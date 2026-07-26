"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePlan } from "@/components/dashboard/PlanContext";
import { PRO_PRICE_LABEL } from "@/lib/relay";
import { cn } from "@/lib/utils";

export function BillingSettings() {
  const { user, refreshUser } = usePlan();

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="size-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  const renewal = user.plan_expires_at
    ? new Date(user.plan_expires_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="scrollbar-none flex h-full flex-col overflow-auto px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-white">Billing</h1>
      <p className="mt-1 text-sm text-white/40">Plan status and renewal info.</p>

      <div className="mt-8 max-w-lg rounded-2xl border border-white/[0.06] bg-[#1a1a1a] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-white/35">
              Current plan
            </p>
            <p className="mt-1 text-xl font-semibold capitalize text-white">
              {user.plan}
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              user.isPro
                ? "bg-accent/15 text-accent"
                : "bg-white/5 text-white/50"
            )}
          >
            {user.isPro ? "Active" : "Free tier"}
          </span>
        </div>

        {user.isPro && renewal && (
          <p className="mt-4 text-sm text-white/45">
            Renews / expires on{" "}
            <span className="font-medium text-white/70">{renewal}</span>
          </p>
        )}

        {!user.isPro && (
          <div className="mt-6 border-t border-white/[0.06] pt-6">
            <p className="text-sm text-white/45">
              Pro is {PRO_PRICE_LABEL} — persistent demos, concurrent tunnels,
              password protection, and full history.
            </p>
            <Link
              href="/dashboard/upgrade"
              className="mt-4 inline-block rounded-full bg-accent px-5 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              Upgrade to Pro
            </Link>
          </div>
        )}

        {user.isPro && (
          <p className="mt-6 border-t border-white/[0.06] pt-6 text-xs text-white/30">
            Cancellation via Paystack dashboard is not wired in the UI yet — contact
            support or manage via Paystack if you need to stop renewal.
          </p>
        )}
      </div>
    </div>
  );
}
