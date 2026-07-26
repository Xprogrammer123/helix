"use client";

import Image from "next/image";
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
    <aside className="flex h-full w-64 shrink-0 flex-col pr-3">
      <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
        <Image
          src="/logo.png"
          alt="Helix"
          width={120}
          height={40}
          className="h-8 w-auto"
          priority
        />
        <span className="text-[15px] font-semibold text-white">Helix</span>
      </div>

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
                  ? "bg-[#252525] text-white"
                  : "text-white/55 hover:bg-white/5 hover:text-white/80"
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
          <div className="rounded-xl border border-white/[0.06] bg-[#1a1a1a] px-3 py-2.5">
            <p className="truncate text-sm font-medium text-white/80">
              {user.username}
            </p>
            <span
              className={cn(
                "mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                isPro ? "bg-accent/15 text-accent" : "bg-white/5 text-white/40"
              )}
            >
              {isPro ? "Pro" : "Free"}
            </span>
          </div>
        )}

        {!isPro && (
          <Link
            href="/dashboard/upgrade"
            className="flex items-center justify-center gap-2 rounded-xl bg-accent/10 px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/15"
          >
            <HugeiconsIcon icon={SparklesIcon} size={16} color="currentColor" />
            Upgrade
          </Link>
        )}
      </div>
    </aside>
  );
}
