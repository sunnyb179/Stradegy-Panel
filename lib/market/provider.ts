import { mockMarketProvider } from "./mock-provider";
import type { MarketProvider } from "./types";

export function getMarketProvider(): MarketProvider {
  const provider = process.env.MARKET_DATA_PROVIDER?.toLowerCase() ?? "mock";

  switch (provider) {
    case "mock":
      return mockMarketProvider;
    default:
      return mockMarketProvider;
  }
}

export function normalizeTicker(ticker: string | null): string | null {
  if (!ticker) {
    return null;
  }

  const normalized = ticker.trim().toUpperCase();
  if (!/^[A-Z][A-Z0-9.-]{0,9}$/.test(normalized)) {
    return null;
  }

  return normalized;
}
