import { getSessionToken } from "@/lib/auth";

export function getRelayUrl() {
  return process.env.RELAY_URL ?? "http://localhost:4000";
}

export function getPublicRelayUrl() {
  return process.env.NEXT_PUBLIC_RELAY_URL ?? getRelayUrl();
}

export async function relayFetch(path: string, init?: RequestInit) {
  const token = await getSessionToken();
  if (!token) {
    return { ok: false as const, status: 401, data: { error: "Unauthorized" } };
  }

  try {
    const res = await fetch(`${getRelayUrl()}${path}`, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({ error: "Invalid response" }));
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return {
      ok: false as const,
      status: 502,
      data: {
        error:
          err instanceof Error ? err.message : "Relay unreachable",
      },
    };
  }
}

export type Tunnel = {
  name: string;
  live: boolean;
  requestCount: number;
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
