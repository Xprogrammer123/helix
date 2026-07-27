import { getSessionToken } from "@/lib/auth-server";
import { getRelayUrl } from "@/lib/relay";

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
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
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
        error: err instanceof Error ? err.message : "Relay unreachable",
      },
    };
  }
}

export type { UserProfile } from "@/lib/relay";
