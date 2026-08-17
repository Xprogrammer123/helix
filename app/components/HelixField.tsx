"use client";

import { cn } from "@/lib/utils";

/** Full-bleed wormhole / helix field — the product’s visual metaphor. */
export function HelixField({
  className,
  intensity = "hero",
}: {
  className?: string;
  intensity?: "hero" | "soft";
}) {
  const strong = intensity === "hero";

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-dark" />
      <div
        className={cn(
          "absolute inset-0",
          strong
            ? "bg-[radial-gradient(ellipse_90%_55%_at_50%_-5%,rgba(255,255,255,0.14),transparent_55%),radial-gradient(ellipse_50%_40%_at_85%_30%,rgba(255,255,255,0.06),transparent),radial-gradient(ellipse_40%_50%_at_10%_70%,rgba(255,255,255,0.08),transparent)]"
            : "bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(255,255,255,0.06),transparent_60%)]"
        )}
      />

      {/* Concentric tunnel rings */}
      <div className="absolute top-1/2 left-1/2 size-[140vmax] -translate-x-1/2 -translate-y-[42%]">
        <div className="animate-helix-spin absolute inset-0">
          {[0.18, 0.28, 0.4, 0.55, 0.72, 0.9].map((scale, i) => (
            <div
              key={scale}
              className="absolute top-1/2 left-1/2 rounded-full border border-white/10"
              style={{
                width: `${scale * 100}%`,
                height: `${scale * 62}%`,
                transform: `translate(-50%, -50%) rotate(${i * 8}deg)`,
                opacity: strong ? 0.55 - i * 0.06 : 0.25 - i * 0.03,
              }}
            />
          ))}
        </div>
      </div>

      {/* Helix path SVG */}
      <svg
        className="absolute inset-0 h-full w-full opacity-70"
        viewBox="0 0 1200 800"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="helix-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="65%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id="helix-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M-40 520 C 180 180, 320 720, 520 360 S 820 120, 1040 480 S 1240 700, 1320 300"
          stroke="url(#helix-stroke)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#helix-glow)"
          strokeDasharray="12 18"
          className="animate-signal-dash"
        />
        <path
          d="M-20 280 C 200 640, 360 80, 560 440 S 860 700, 1080 240 S 1280 100, 1340 520"
          stroke="url(#helix-stroke)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.45"
          strokeDasharray="8 22"
          className="animate-signal-dash"
          style={{ animationDuration: "4.2s" }}
        />
      </svg>

      {/* Soft grain */}
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-dark to-transparent" />
    </div>
  );
}
