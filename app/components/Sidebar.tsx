"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CreditCardIcon,
  Home01Icon,
  SparklesIcon,
  WebhookIcon,
} from "@hugeicons/core-free-icons";
import type { UserProfile } from "@/lib/relay";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Home", icon: Home01Icon, match: "home" as const },
  {
    href: "/dashboard/tunnels",
    label: "Tunnels",
    icon: WebhookIcon,
    match: "tunnels" as const,
  },
  {
    href: "/dashboard/settings",
    label: "Billing",
    icon: CreditCardIcon,
    match: "settings" as const,
  },
];

function isActive(pathname: string, match: "home" | "tunnels" | "settings") {
  if (match === "home") return pathname === "/dashboard";
  if (match === "settings") return pathname.startsWith("/dashboard/settings");
  return pathname.startsWith("/dashboard/tunnels");
}

export function Sidebar({ user }: { user: UserProfile | null }) {
  const pathname = usePathname();
  const isPro = user?.isPro ?? false;

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col pr-3">
      <Link
        href="/"
        className="font-display px-2 py-2 text-lg font-bold tracking-tight text-ink"
      >
        HELIX
      </Link>

      <nav className="mt-8 flex flex-col gap-1">
        {nav.map((item) => {
          const active = isActive(pathname, item.match);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[15px] font-medium transition-colors",
                active
                  ? "bg-accent/15 text-accent"
                  : "text-ink/45 hover:bg-ink/5 hover:text-ink/80"
              )}
            >
              <HugeiconsIcon
                icon={item.icon}
                size={18}
                color="currentColor"
                strokeWidth={2}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 px-2 pb-2">
        {user && (
          <div className="rounded-xl border border-ink/8 bg-surface px-3 py-2.5">
            <p className="truncate text-sm font-medium text-ink/80">
              {user.username}
            </p>
            <span
              className={cn(
                "mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                isPro
                  ? "bg-accent/15 text-accent"
                  : "bg-ink/5 text-ink/40"
              )}
            >
              {isPro ? "Pro" : "Free"}
            </span>
          </div>
        )}

        {!isPro && (
          <Link
            href="/dashboard/upgrade"
            className="flex items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2 text-sm font-medium text-dark transition-opacity hover:opacity-90"
          >
            <HugeiconsIcon icon={SparklesIcon} size={16} color="currentColor" />
            Upgrade
          </Link>
        )}

        <button
          type="button"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/auth";
          }}
          className="w-full rounded-xl px-3 py-2 text-sm text-ink/35 transition-colors hover:bg-ink/5 hover:text-ink/70"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
