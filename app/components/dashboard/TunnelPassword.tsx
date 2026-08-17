"use client";

import { useEffect, useState } from "react";
import { usePlan } from "@/components/dashboard/PlanContext";
import { CopyButton } from "@/components/CopyButton";
import { cn } from "@/lib/utils";

type TunnelPasswordProps = {
  tunnelName: string;
  passwordProtected?: boolean;
};

export function TunnelPassword({ tunnelName, passwordProtected }: TunnelPasswordProps) {
  const { isPro, openUpgrade } = usePlan();
  const [enabled, setEnabled] = useState(passwordProtected ?? false);
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEnabled(passwordProtected ?? false);
  }, [passwordProtected]);

  async function save(nextPassword: string | null) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/tunnels/${encodeURIComponent(tunnelName)}/password`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: nextPassword }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update password");
      setEnabled(data.passwordProtected);
      if (!data.passwordProtected) setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function handleToggle() {
    if (!isPro) {
      openUpgrade("password-protection");
      return;
    }
    if (enabled) {
      save(null);
    } else {
      setEnabled(true);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-ink/8 bg-panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">Password protection</p>
          <p className="mt-0.5 text-xs text-ink/35">
            Requires HTTP Basic Auth before forwarding. Pro only.
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={saving}
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors",
            enabled ? "bg-accent" : "bg-ink/15"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 size-5 rounded-full bg-ink transition-transform",
              enabled ? "left-[22px]" : "left-0.5"
            )}
          />
        </button>
      </div>

      {!isPro && (
        <button
          type="button"
          onClick={() => openUpgrade("password-protection")}
          className="mt-3 w-full rounded-lg border border-dashed border-ink/10 px-3 py-2 text-left text-xs text-ink/40 transition-colors hover:border-ink/20 hover:text-ink/55"
        >
          Click to enable — opens Pro upgrade
        </button>
      )}

      {isPro && enabled && (
        <div className="mt-4 space-y-2">
          <label className="text-xs text-ink/35">Tunnel password</label>
          <div className="flex items-center gap-2">
            <input
              type={revealed ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Set a password for visitors"
              className="min-w-0 flex-1 rounded-lg border border-ink/10 bg-dark/40 px-3 py-2 font-mono text-sm text-ink outline-none focus:border-accent/40"
            />
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              className="rounded-lg bg-ink/5 px-3 py-2 text-xs text-ink/55 hover:bg-ink/10"
            >
              {revealed ? "Hide" : "Reveal"}
            </button>
            {password && <CopyButton value={password} label="Password copied" />}
          </div>
          <p className="text-[11px] text-ink/30">
            Reveal only when you need to copy — avoid screen-shares with this visible.
          </p>
          <button
            type="button"
            disabled={saving || !password}
            onClick={() => save(password)}
            className="rounded-lg bg-accent/15 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/25 disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save password"}
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function ProOverviewBanner() {
  const { isPro, openUpgrade } = usePlan();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(sessionStorage.getItem("helix_pro_banner_dismissed") === "1");
  }, []);

  if (isPro || dismissed) return null;

  return (
    <div className="mx-6 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/15 bg-accent/[0.04] px-4 py-3 text-sm">
      <p className="text-ink/50">
        <span className="text-ink/70">Client demo coming up?</span> Pro keeps your
        tunnel alive and lets you password-protect the link.
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => openUpgrade("general")}
          className="rounded-lg bg-accent/15 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/25"
        >
          Upgrade to Pro
        </button>
        <button
          type="button"
          onClick={() => {
            sessionStorage.setItem("helix_pro_banner_dismissed", "1");
            setDismissed(true);
          }}
          className="text-xs text-ink/30 hover:text-ink/50"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
