import { getSessionToken } from "@/lib/auth-server";
import { getRelayUrl } from "@/lib/relay";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const token = await getSessionToken();
  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const upstream = await fetch(`${getRelayUrl()}/api/events`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "text/event-stream",
    },
    cache: "no-store",
    signal: req.signal,
  }).catch(() => null);

  if (!upstream?.ok || !upstream.body) {
    return Response.json(
      { error: "Relay unreachable" },
      { status: upstream?.status || 502 }
    );
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
