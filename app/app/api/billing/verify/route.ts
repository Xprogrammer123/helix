import { NextResponse } from "next/server";
import { relayFetch } from "@/lib/relay-server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");
  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }
  const result = await relayFetch(
    `/api/billing/verify?reference=${encodeURIComponent(reference)}`
  );
  return NextResponse.json(result.data, { status: result.status });
}
