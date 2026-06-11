import type {
  ExpirationResponse,
  MarketProvider,
  OptionChain,
  OptionContract,
  OptionType,
  Quote,
} from "./types";

const basePrices: Record<string, number> = {
  AAPL: 195.23,
  TSLA: 182.64,
  NVDA: 124.81,
  MSFT: 438.91,
  SPY: 541.12,
};

function hashTicker(ticker: string): number {
  return ticker.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function isoDateFromNow(days: number): string {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getBasePrice(ticker: string): number {
  const normalized = ticker.toUpperCase();
  if (basePrices[normalized]) {
    return basePrices[normalized];
  }

  const hash = hashTicker(normalized);
  return round(42 + (hash % 210) + (hash % 17) / 10);
}

function getMockPrice(ticker: string): number {
  const hash = hashTicker(ticker);
  const drift = ((hash % 13) - 6) * 0.31;
  return round(getBasePrice(ticker) + drift);
}

function optionSymbol(
  ticker: string,
  expiration: string,
  type: OptionType,
  strike: number,
): string {
  const compactDate = expiration.replaceAll("-", "").slice(2);
  const typeCode = type === "call" ? "C" : "P";
  const strikeCode = String(Math.round(strike * 1000)).padStart(8, "0");
  return `${ticker}${compactDate}${typeCode}${strikeCode}`;
}

function buildContract(
  ticker: string,
  expiration: string,
  underlyingPrice: number,
  strike: number,
  type: OptionType,
  index: number,
): OptionContract {
  const distance = Math.abs(strike - underlyingPrice) / underlyingPrice;
  const moneyness = (underlyingPrice - strike) / underlyingPrice;
  const hash = hashTicker(`${ticker}${expiration}${strike}${type}`);
  const intrinsic =
    type === "call"
      ? Math.max(underlyingPrice - strike, 0)
      : Math.max(strike - underlyingPrice, 0);
  const timeValue = Math.max(0.35, underlyingPrice * (0.018 - Math.min(distance, 0.16) * 0.045));
  const liquidityCurve = Math.max(0.12, 1 - distance * 5.8);
  const last = round(intrinsic + timeValue + (hash % 7) * 0.04);
  const spread = round(Math.max(0.03, last * (0.035 + distance * 0.55)), 2);
  const bid = round(Math.max(0.01, last - spread / 2), 2);
  const ask = round(bid + spread, 2);
  const volume = Math.max(0, Math.round(liquidityCurve * 1250 + (hash % 90) - index * 8));
  const openInterest = Math.max(0, Math.round(liquidityCurve * 3600 + (hash % 450) + index * 23));
  const iv = round(0.24 + distance * 0.72 + (hash % 11) / 100, 4);
  const callDelta = Math.max(0.05, Math.min(0.95, 0.52 + moneyness * 4.2));
  const delta = type === "call" ? round(callDelta, 3) : round(callDelta - 1, 3);

  return {
    symbol: optionSymbol(ticker, expiration, type, strike),
    underlying: ticker,
    type,
    expiration,
    strike,
    bid,
    ask,
    last,
    volume,
    openInterest,
    impliedVolatility: iv,
    delta,
    gamma: round(Math.max(0.004, 0.038 - distance * 0.11), 4),
    theta: round(-Math.max(0.012, 0.035 + distance * 0.12), 4),
    vega: round(Math.max(0.01, 0.16 - distance * 0.4), 4),
  };
}

function buildStrikes(price: number): number[] {
  const step = price > 250 ? 10 : price > 100 ? 5 : 2.5;
  const center = Math.round(price / step) * step;
  return Array.from({ length: 17 }, (_, index) => round(center + (index - 8) * step, 2));
}

export const mockMarketProvider: MarketProvider = {
  async getQuote(ticker: string): Promise<Quote> {
    const normalized = ticker.toUpperCase();
    const price = getMockPrice(normalized);
    const change = round(((hashTicker(normalized) % 21) - 10) * 0.19);

    return {
      ticker: normalized,
      price,
      change,
      changePercent: round((change / price) * 100),
      asOf: new Date().toISOString(),
    };
  },

  async getExpirations(ticker: string): Promise<ExpirationResponse> {
    return {
      ticker: ticker.toUpperCase(),
      expirations: [isoDateFromNow(8), isoDateFromNow(36), isoDateFromNow(71)],
    };
  },

  async getOptionsChain(ticker: string, expiration: string): Promise<OptionChain> {
    const normalized = ticker.toUpperCase();
    const underlyingPrice = getMockPrice(normalized);
    const strikes = buildStrikes(underlyingPrice);

    return {
      ticker: normalized,
      expiration,
      underlyingPrice,
      calls: strikes.map((strike, index) =>
        buildContract(normalized, expiration, underlyingPrice, strike, "call", index),
      ),
      puts: strikes.map((strike, index) =>
        buildContract(normalized, expiration, underlyingPrice, strike, "put", index),
      ),
    };
  },
};
