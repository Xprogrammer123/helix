import type { Tunnel, TunnelRequest } from "@/lib/relay-types";

export type LiveEvent =
  | { type: "tunnel.live"; name: string }
  | { type: "tunnel.offline"; name: string }
  | { type: "request"; request: TunnelRequest };

export function applyLiveEvent(tunnels: Tunnel[], event: LiveEvent): Tunnel[] {
  if (event.type === "tunnel.live" || event.type === "tunnel.offline") {
    const live = event.type === "tunnel.live";
    const exists = tunnels.some((t) => t.name === event.name);
    if (!exists) {
      return live
        ? [{ name: event.name, live: true, requestCount: 0 }, ...tunnels]
        : tunnels;
    }
    return tunnels.map((t) => (t.name === event.name ? { ...t, live } : t));
  }

  if (event.type === "request") {
    return tunnels.map((t) =>
      t.name === event.request.tunnel_name
        ? { ...t, requestCount: t.requestCount + 1 }
        : t
    );
  }

  return tunnels;
}

export function prependRequest(
  requests: TunnelRequest[],
  incoming: TunnelRequest,
  limit: number
): TunnelRequest[] {
  const id = incoming.$id;
  if (id && requests.some((r) => r.$id === id)) return requests;
  return [incoming, ...requests].slice(0, Math.max(1, limit));
}
