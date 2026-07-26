import { NextResponse } from "next/server";
import { relayFetch } from "@/lib/relay-server";

export async function POST() {
  const result = await relayFetch("/api/billing/initialize", { method: "POST" });
  return NextResponse.json(result.data, { status: result.status });
}
