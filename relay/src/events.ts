import type { Response } from "express";

export type LiveRequest = {
  $id: string;
  tunnel_name: string;
  method: string;
  path: string;
  status: number;
  duration_ms: number;
  timestamp: string;
};

export type LiveEvent =
  | { type: "tunnel.live"; name: string }
  | { type: "tunnel.offline"; name: string }
  | { type: "request"; request: LiveRequest };

type Subscriber = { userId: string; res: Response };

const subscribers = new Set<Subscriber>();

export function subscribeDashboard(userId: string, res: Response) {
  const sub: Subscriber = { userId, res };
  subscribers.add(sub);
  res.on("close", () => subscribers.delete(sub));
}

export function publish(userId: string, event: LiveEvent) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const sub of subscribers) {
    if (sub.userId !== userId) continue;
    try {
      sub.res.write(payload);
    } catch {
      subscribers.delete(sub);
    }
  }
}
