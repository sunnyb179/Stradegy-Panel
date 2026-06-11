import type { ChainSummary, ChatRequest } from "@/lib/market/types";

function contractLine(contract: NonNullable<ChainSummary["liquidContracts"]>[number]): string {
  const iv = contract.impliedVolatility === null ? "IV unavailable" : `${(contract.impliedVolatility * 100).toFixed(1)}% IV`;
  return `${contract.symbol} ${contract.type} ${contract.strike}: volume ${contract.volume ?? "-"}, OI ${contract.openInterest ?? "-"}, ${iv}, delta ${contract.delta ?? "-"}`;
}

export function fallbackHermesResponse(request: ChatRequest): string {
  const summary = request.chainSummary;
  const liquid = summary?.liquidContracts ?? [];
  const highVolume = summary?.highVolumeContracts ?? [];
  const highIv = summary?.highIvContracts ?? [];
  const topLiquid = liquid.slice(0, 3).map(contractLine);
  const question = request.message.toLowerCase();

  if (question.includes("iv") || question.includes("volatility")) {
    const highIvText = highIv.slice(0, 3).map(contractLine).join("; ") || "No high-IV contracts were supplied.";
    return `From an implied-volatility perspective, higher IV usually means richer option premiums and greater expected movement, but it can also mean faster premium compression if volatility cools. For ${request.ticker} ${request.expiration}, the higher-IV contracts in the supplied data are: ${highIvText}. This is educational analysis, not financial advice.`;
  }

  if (question.includes("risk")) {
    return `The main risks are spread cost, liquidity gaps, volatility changes, and time decay. Delta shows directional sensitivity, while theta reflects daily time decay pressure. Options can be highly risky and may lose value quickly, especially when liquidity is thin or IV changes sharply. This is educational analysis, not financial advice.`;
  }

  if (question.includes("liquid") || question.includes("volume") || question.includes("stand")) {
    const contracts = (topLiquid.length > 0 ? topLiquid : highVolume.slice(0, 3).map(contractLine)).join("; ");
    return `From a liquidity perspective, the contracts that may be worth further research are: ${contracts || "No liquid contracts were supplied."} I am looking for higher volume, stronger open interest, and tighter spreads. This is educational analysis, not financial advice.`;
  }

  return `For ${request.ticker} ${request.expiration}, the supplied chain shows an underlying near ${summary?.underlyingPrice ?? "unknown"} and an at-the-money strike near ${summary?.atmStrike ?? "unknown"}. Contracts may be worth further research when volume and open interest are stronger and spreads are tighter. The main risk is that options can lose value quickly from time decay, volatility changes, and directional moves. This is educational analysis, not financial advice.`;
}
