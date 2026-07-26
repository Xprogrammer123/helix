import { NextResponse } from "next/server";
import { relayFetch } from "@/lib/relay-server";

export async function GET() {
  const result = await relayFetch("/api/me");
  return NextResponse.json(result.data, { status: result.status });
}
