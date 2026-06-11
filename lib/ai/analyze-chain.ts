import type { ChainSummary, ContractSummary, OptionContract, OptionChain } from "@/lib/market/types";
import { bidAskSpreadPercent, nearestStrike } from "@/lib/utils";

function toContractSummary(contract: OptionContract): ContractSummary {
  return {
    symbol: contract.symbol,
    type: contract.type,
    strike: contract.strike,
    bid: contract.bid,
    ask: contract.ask,
    volume: contract.volume,
    openInterest: contract.openInterest,
    impliedVolatility: contract.impliedVolatility,
    delta: contract.delta,
  };
}

function rankLiquid(contract: OptionContract): number {
  const volume = contract.volume ?? 0;
  const openInterest = contract.openInterest ?? 0;
  const spread = bidAskSpreadPercent(contract) ?? 100;
  return volume * 1.6 + openInterest * 0.35 - spread * 18;
}

export function summarizeChain(chain: OptionChain): ChainSummary {
  const contracts = [...chain.calls, ...chain.puts];
  const strikes = Array.from(new Set(contracts.map((contract) => contract.strike)));

  return {
    underlyingPrice: chain.underlyingPrice,
    totalCalls: chain.calls.length,
    totalPuts: chain.puts.length,
    atmStrike: nearestStrike(strikes, chain.underlyingPrice) ?? undefined,
    liquidContracts: contracts
      .filter((contract) => (contract.volume ?? 0) >= 100 && (contract.openInterest ?? 0) >= 250)
      .sort((a, b) => rankLiquid(b) - rankLiquid(a))
      .slice(0, 6)
      .map(toContractSummary),
    highVolumeContracts: contracts
      .sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0))
      .slice(0, 5)
      .map(toContractSummary),
    highIvContracts: contracts
      .sort((a, b) => (b.impliedVolatility ?? 0) - (a.impliedVolatility ?? 0))
      .slice(0, 5)
      .map(toContractSummary),
  };
}
