"use client";

import { useState } from "react";
import Link from "next/link";
import { PLAN_COMPARE, PRO_PRICE_LABEL } from "@/lib/relay";
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
    <div className="scrollbar-none flex h-full flex-col overflow-auto px-6 py-8">
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
        Plans
      </h1>
      <p className="mt-1 text-sm text-ink/40">Free vs Pro. Same named URLs.</p>

      <div className="mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-ink/10 bg-panel p-6">
          <p className="text-xs font-medium tracking-wide text-ink/35 uppercase">
            Free
          </p>
          <p className="font-display mt-2 text-3xl font-bold text-ink">₦0</p>
          <p className="mt-1 text-sm text-ink/35">Always on</p>
        </article>

        <article className="rounded-2xl border border-accent/30 bg-accent/[0.06] p-6">
          <p className="text-xs font-medium tracking-wide text-accent uppercase">
            Pro
          </p>
          <p className="font-display mt-2 text-3xl font-bold text-ink">
            ₦2,500
            <span className="text-base font-normal text-ink/40">/mo</span>
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={startCheckout}
            className={cn(
              "mt-4 w-full rounded-full bg-accent py-2.5 text-sm font-medium text-dark transition-opacity",
              loading ? "opacity-60" : "hover:opacity-90"
            )}
          >
            {loading ? "Opening checkout…" : `Upgrade · ${PRO_PRICE_LABEL}`}
          </button>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </article>
      </div>

      <div className="mt-8 max-w-3xl overflow-hidden rounded-2xl border border-ink/10">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-panel text-[11px] tracking-wide text-ink/35 uppercase">
            <tr>
              <th className="px-5 py-3 font-medium"> </th>
              <th className="px-5 py-3 font-medium">Free</th>
              <th className="px-5 py-3 font-medium text-accent">Pro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/8">
            {PLAN_COMPARE.map((row) => (
              <tr key={row.label}>
                <td className="px-5 py-3.5 text-ink/70">{row.label}</td>
                <td className="px-5 py-3.5 font-mono text-ink/40">{row.free}</td>
                <td className="px-5 py-3.5 font-mono text-ink">{row.pro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link
        href="/dashboard/settings"
        className="mt-8 text-sm text-ink/35 transition-colors hover:text-ink/70"
      >
        Billing status →
      </Link>
    </div>
  );
}
