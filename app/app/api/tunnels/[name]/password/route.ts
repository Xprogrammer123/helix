import { NextResponse } from "next/server";
import { relayFetch } from "@/lib/relay-server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const body = await req.json();
  const result = await relayFetch(
    `/api/tunnels/${encodeURIComponent(name)}/password`,
    { method: "PATCH", body: JSON.stringify(body) }
  );
  return NextResponse.json(result.data, { status: result.status });
}
