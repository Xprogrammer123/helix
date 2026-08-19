import { RELAY_URL } from "./urls";

export function getRelayUrl() {
  return process.env.RELAY_URL ?? RELAY_URL;
}

export function getPublicRelayUrl() {
  return process.env.NEXT_PUBLIC_RELAY_URL ?? getRelayUrl();
}

export type UserProfile = {
  username: string;
  name?: string;
  plan: "free" | "pro";
  plan_expires_at: string | null;
  isPro: boolean;
};

export type Tunnel = {
  name: string;
  live: boolean;
  requestCount: number;
  passwordProtected?: boolean;
};

export type TunnelsResponse = {
  tunnels: Tunnel[];
  plan: "free" | "pro";
  isPro: boolean;
  liveCount: number;
  tunnelLimit: number | null;
};

export type TunnelRequest = {
  $id?: string;
  tunnel_name: string;
  method: string;
  path: string;
  status: number;
  duration_ms: number;
  timestamp: string;
};

export type RequestsResponse = {
  requests: TunnelRequest[];
  limit: number;
  offset: number;
  total: number;
  isPro: boolean;
  capped: boolean;
};

export type UpgradeTrigger =
  | "password-protection"
  | "concurrent-tunnels"
  | "full-history"
  | "general";

export const PRO_PRICE_LABEL = "₦2,500/mo";

export const PLAN_COMPARE = [
  { label: "Live tunnels", free: "1", pro: "Unlimited" },
  { label: "Idle timeout", free: "2 min", pro: "24 hours" },
  { label: "Request history", free: "Last 50", pro: "Last 500" },
  { label: "Password lock", free: "No", pro: "Yes" },
] as const;

export const UPGRADE_TRIGGERS: Record<
  UpgradeTrigger,
  { headline: string; subline: string }
> = {
  "password-protection": {
    headline: "Password-lock a tunnel",
    subline: "Share the URL. Keep the password off the call.",
  },
  "concurrent-tunnels": {
    headline: "Run more than one tunnel",
    subline: "Free allows 1 live tunnel.",
  },
  "full-history": {
    headline: "See more than the last 50 hits",
    subline: "Pro logs 500 requests per tunnel.",
  },
  general: {
    headline: "Helix Pro",
    subline: "Longer sessions. More tunnels. Password lock.",
  },
};
