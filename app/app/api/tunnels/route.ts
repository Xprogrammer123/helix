import { NextResponse } from "next/server";
import { relayFetch } from "@/lib/relay";

export async function GET() {
  const result = await relayFetch("/api/tunnels");
  return NextResponse.json(result.data, { status: result.status });
}
