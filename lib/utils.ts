import type { OptionContract } from "./market/types";

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }

  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }

  return `${(value * 100).toFixed(1)}%`;
}

export function bidAskSpreadPercent(contract: OptionContract): number | null {
  if (!contract.bid || !contract.ask || contract.ask <= 0) {
    return null;
  }

  const mid = (contract.bid + contract.ask) / 2;
  if (mid <= 0) {
    return null;
  }

  return ((contract.ask - contract.bid) / mid) * 100;
}

export function nearestStrike(strikes: number[], price: number): number | null {
  if (strikes.length === 0) {
    return null;
  }

  return strikes.reduce((closest, strike) =>
    Math.abs(strike - price) < Math.abs(closest - price) ? strike : closest,
  );
}
