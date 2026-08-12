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
  className,
}: {
  refProp: RefObject<HTMLDivElement | null>;
  icon: typeof ComputerIcon;
  label: string;
  sub: string;
  className?: string;
}) {
  return (
    <div
      ref={refProp}
      className={cn(
        "relative z-10 flex w-36 flex-col items-center gap-2 rounded-2xl border border-white/10 bg-[#181818] px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:w-40",
        className
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-accent">
        <HugeiconsIcon icon={icon} size={20} color="currentColor" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="mt-0.5 font-mono text-[11px] text-white/35">{sub}</p>
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
      className="relative flex w-full items-center justify-between gap-4 overflow-hidden px-2 py-10 sm:px-8"
    >
      <Node
        refProp={localRef}
        icon={ComputerIcon}
        label="Localhost"
        sub=":3000"
      />
      <Node
        refProp={relayRef}
        icon={ServerStack01Icon}
        label="Helix relay"
        sub="self-hosted"
        className="border-accent/25 bg-accent/[0.04]"
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
        curvature={-18}
        duration={3.5}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={relayRef}
        toRef={publicRef}
        curvature={18}
        duration={3.5}
        delay={0.6}
        reverse
      />
    </div>
  );
}
