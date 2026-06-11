import { NextResponse } from "next/server";
import { getMarketProvider, normalizeTicker } from "@/lib/market/provider";

function validExpiration(value: string | null): value is string {
  return value !== null && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = normalizeTicker(searchParams.get("ticker"));
  const expiration = searchParams.get("expiration");

  if (!ticker) {
    return NextResponse.json({ error: "A valid ticker is required." }, { status: 400 });
  }

  if (!validExpiration(expiration)) {
    return NextResponse.json({ error: "A valid expiration is required." }, { status: 400 });
  }

  const chain = await getMarketProvider().getOptionsChain(ticker, expiration);
  return NextResponse.json(chain);
}
