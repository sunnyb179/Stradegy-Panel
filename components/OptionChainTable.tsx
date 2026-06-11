import type { OptionChain, OptionContract } from "@/lib/market/types";
import { bidAskSpreadPercent, formatCurrency, formatNumber, formatPercent, nearestStrike } from "@/lib/utils";
import type { OptionFilterState } from "./OptionFilters";

type OptionChainTableProps = {
  chain: OptionChain | null;
  filters: OptionFilterState;
  loading: boolean;
  error: string | null;
};

type ChainRow = {
  strike: number;
  call?: OptionContract;
  put?: OptionContract;
};

function passesFilters(contract: OptionContract | undefined, filters: OptionFilterState): boolean {
  if (!contract) {
    return false;
  }

  if ((contract.volume ?? 0) < filters.minVolume) {
    return false;
  }

  if ((contract.openInterest ?? 0) < filters.minOpenInterest) {
    return false;
  }

  const spread = bidAskSpreadPercent(contract);
  if (spread !== null && spread > filters.maxSpreadPercent) {
    return false;
  }

  return true;
}

function formatCell(value: number | null): string {
  return value === null ? "-" : value.toFixed(2);
}

function buildRows(chain: OptionChain): ChainRow[] {
  const callMap = new Map(chain.calls.map((contract) => [contract.strike, contract]));
  const putMap = new Map(chain.puts.map((contract) => [contract.strike, contract]));
  const strikes = Array.from(new Set([...callMap.keys(), ...putMap.keys()])).sort((a, b) => a - b);

  return strikes.map((strike) => ({
    strike,
    call: callMap.get(strike),
    put: putMap.get(strike),
  }));
}

export function OptionChainTable({ chain, filters, loading, error }: OptionChainTableProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-white/10 bg-panel p-6 text-sm text-slate-400">
        Loading options chain...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-400/30 bg-red-950/20 p-6 text-sm text-red-200">
        {error}
      </div>
    );
  }

  if (!chain) {
    return (
      <div className="rounded-lg border border-white/10 bg-panel p-6 text-sm text-slate-400">
        Select an expiration to view the chain.
      </div>
    );
  }

  const rows = buildRows(chain);
  const atmStrike = nearestStrike(rows.map((row) => row.strike), chain.underlyingPrice);
  const visibleRows = rows
    .map((row) => {
      const showCall = filters.visibility !== "puts" && passesFilters(row.call, filters);
      const showPut = filters.visibility !== "calls" && passesFilters(row.put, filters);
      return {
        ...row,
        call: showCall ? row.call : undefined,
        put: showPut ? row.put : undefined,
      };
    })
    .filter((row) => row.call || row.put);

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-panel">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
        <div>
          <h2 className="font-semibold text-white">Options Chain</h2>
          <p className="text-xs text-slate-500">
            Underlying {formatCurrency(chain.underlyingPrice)} · Expiration {chain.expiration}
          </p>
        </div>
        <div className="text-xs text-slate-500">{visibleRows.length} strikes</div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1120px] w-full border-collapse text-right text-xs">
          <thead className="bg-white/[0.03] text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left" colSpan={7}>
                Calls
              </th>
              <th className="px-3 py-2 text-center">Strike</th>
              <th className="px-3 py-2 text-left" colSpan={7}>
                Puts
              </th>
            </tr>
            <tr>
              {["Bid", "Ask", "Last", "Vol", "OI", "IV", "Delta"].map((header) => (
                <th key={`call-${header}`} className="px-3 py-2 font-medium">
                  {header}
                </th>
              ))}
              <th className="border-x border-white/10 px-3 py-2 text-center font-semibold text-slate-300">
                Strike
              </th>
              {["Bid", "Ask", "Last", "Vol", "OI", "IV", "Delta"].map((header) => (
                <th key={`put-${header}`} className="px-3 py-2 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => {
              const isAtm = row.strike === atmStrike;
              return (
                <tr
                  key={row.strike}
                  className={
                    isAtm
                      ? "border-t border-signal/20 bg-signal/10 text-slate-100"
                      : "border-t border-white/5 text-slate-300 hover:bg-white/[0.025]"
                  }
                >
                  <ContractCells contract={row.call} />
                  <td className="border-x border-white/10 px-3 py-2 text-center font-semibold text-white">
                    {row.strike.toFixed(2)}
                  </td>
                  <ContractCells contract={row.put} />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContractCells({ contract }: { contract?: OptionContract }) {
  const values = contract
    ? [
        formatCell(contract.bid),
        formatCell(contract.ask),
        formatCell(contract.last),
        formatNumber(contract.volume),
        formatNumber(contract.openInterest),
        formatPercent(contract.impliedVolatility),
        contract.delta === null ? "-" : contract.delta.toFixed(3),
      ]
    : ["-", "-", "-", "-", "-", "-", "-"];

  return (
    <>
      {values.map((value, index) => (
        <td key={`${contract?.symbol ?? "empty"}-${index}`} className="px-3 py-2">
          {value}
        </td>
      ))}
    </>
  );
}
