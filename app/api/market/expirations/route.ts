import { NextResponse } from "next/server";
import { getMarketProvider, normalizeTicker } from "@/lib/market/provider";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = normalizeTicker(searchParams.get("ticker"));

  if (!ticker) {
    return NextResponse.json({ error: "A valid ticker is required." }, { status: 400 });
  }

  const expirations = await getMarketProvider().getExpirations(ticker);
  return NextResponse.json(expirations);
}
