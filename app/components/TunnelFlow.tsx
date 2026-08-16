"use client";

import { useRef, type RefObject } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ComputerIcon,
  Globe02Icon,
  ServerStack01Icon,
} from "@hugeicons/core-free-icons";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { cn } from "@/lib/utils";

function Node({
  refProp,
  icon,
  label,
  sub,
  highlight,
}: {
  refProp: RefObject<HTMLDivElement | null>;
  icon: typeof ComputerIcon;
  label: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      ref={refProp}
      className={cn(
        "relative z-10 flex w-36 flex-col items-center gap-3 rounded-2xl border px-4 py-5 sm:w-44",
        highlight
          ? "border-accent/40 bg-accent/10 shadow-[0_0_40px_-12px_rgba(92,255,177,0.55)]"
          : "border-ink/10 bg-surface/90"
      )}
    >
      <div
        className={cn(
          "flex size-11 items-center justify-center rounded-xl",
          highlight ? "bg-accent text-dark" : "bg-ink/5 text-accent"
        )}
      >
        <HugeiconsIcon icon={icon} size={20} color="currentColor" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="mt-1 font-mono text-[11px] text-ink/35">{sub}</p>
      </div>
    </div>
  );
}

export function TunnelFlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const localRef = useRef<HTMLDivElement>(null);
  const relayRef = useRef<HTMLDivElement>(null);
  const publicRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative flex w-full items-center justify-between gap-3 overflow-hidden px-1 py-12 sm:gap-6 sm:px-6"
    >
      <Node refProp={localRef} icon={ComputerIcon} label="Localhost" sub=":3000" />
      <Node
        refProp={relayRef}
        icon={ServerStack01Icon}
        label="Helix relay"
        sub="self-hosted"
        highlight
      />
      <Node
        refProp={publicRef}
        icon={Globe02Icon}
        label="Public path"
        sub="/tunnel/myapp/"
      />

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={localRef}
        toRef={relayRef}
        curvature={-22}
        duration={3}
        pathColor="rgba(92,255,177,0.15)"
        gradientStartColor="#5cffb1"
        gradientStopColor="#2a9a6a"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={relayRef}
        toRef={publicRef}
        curvature={22}
        duration={3}
        delay={0.5}
        reverse
        pathColor="rgba(92,255,177,0.15)"
        gradientStartColor="#5cffb1"
        gradientStopColor="#2a9a6a"
      />
    </div>
  );
}
