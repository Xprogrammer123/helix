import { NextResponse } from "next/server";
import { relayFetch } from "@/lib/relay-server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const checkoutId = searchParams.get("checkout_id") ?? searchParams.get("reference");
  if (!checkoutId) {
    return NextResponse.json({ error: "Missing checkout_id" }, { status: 400 });
  }
  const result = await relayFetch(
    `/api/billing/verify?checkout_id=${encodeURIComponent(checkoutId)}`
  );
  return NextResponse.json(result.data, { status: result.status });
}
