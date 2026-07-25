"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  WebhookIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Home", icon: Home01Icon, match: "home" as const },
  {
    href: "/dashboard",
    label: "Tunnels",
    icon: WebhookIcon,
    match: "tunnels" as const,
  },
];

function isActive(pathname: string, match: "home" | "tunnels") {
  if (match === "home") return pathname === "/dashboard";
  return pathname.startsWith("/dashboard/tunnels");
}

export function Sidebar() {
  const pathname = usePathname();

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
    </aside>
  );
}
