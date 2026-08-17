"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { usePlan } from "@/components/dashboard/PlanContext";

export default function UpgradeCallbackClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = usePlan();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reference = searchParams.get("reference");
    if (!reference) {
      setStatus("error");
      setError("Missing payment reference");
      return;
    }

    fetch(`/api/billing/verify?reference=${encodeURIComponent(reference)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Verification failed");
        await refreshUser();
        setStatus("success");
      })
      .catch((err) => {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Verification failed");
      });
  }, [searchParams, refreshUser]);

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      {status === "loading" && (
        <>
          <span className="size-6 animate-spin rounded-full border-2 border-ink/20 border-t-accent" />
          <p className="mt-4 text-sm text-ink/50">Verifying payment…</p>
        </>
      )}
      {status === "success" && (
        <>
          <p className="font-display text-xl font-bold text-ink">Welcome to Helix Pro</p>
          <p className="mt-2 text-sm text-ink/45">
            Payment verified. Your plan is active for 30 days.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 rounded-full bg-accent px-5 py-2 text-sm font-medium text-dark"
          >
            Go to dashboard
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <p className="font-display text-xl font-bold text-ink">Payment not confirmed</p>
          <p className="mt-2 text-sm text-red-400">{error}</p>
          <button
            type="button"
            onClick={() => router.push("/dashboard/upgrade")}
            className="mt-6 rounded-full bg-ink/10 px-5 py-2 text-sm text-ink"
          >
            Try again
          </button>
        </>
      )}
    </div>
  );
}
