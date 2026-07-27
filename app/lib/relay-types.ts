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

export const UPGRADE_TRIGGERS: Record<
  UpgradeTrigger,
  { headline: string; subline: string }
> = {
  "password-protection": {
    headline: "Share demo links with a password",
    subline:
      "Keep your tunnel URL clean for clients — send the password separately.",
  },
  "concurrent-tunnels": {
    headline: "Run multiple tunnels at once",
    subline:
      "Test webhooks and microservices side-by-side without stopping your main tunnel.",
  },
  "full-history": {
    headline: "See your full request history",
    subline:
      "Debug flaky issues with up to 500 logged requests instead of the last 50.",
  },
  general: {
    headline: "Upgrade to Helix Pro",
    subline: "Persistent demo links, concurrent tunnels, and full history.",
  },
};
