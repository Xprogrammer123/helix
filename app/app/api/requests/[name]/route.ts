import { NextResponse } from "next/server";
import { relayFetch } from "@/lib/relay";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const result = await relayFetch(`/api/requests/${encodeURIComponent(name)}`);
  return NextResponse.json(result.data, { status: result.status });
}
