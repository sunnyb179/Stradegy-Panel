"use client";

import { useEffect, useMemo, useState } from "react";
import { ChatPanel } from "@/components/ChatPanel";
import { Disclaimer } from "@/components/Disclaimer";
import { OptionChainTable } from "@/components/OptionChainTable";
import { OptionFilters, type OptionFilterState } from "@/components/OptionFilters";
import { QuoteCard } from "@/components/QuoteCard";
import { summarizeChain } from "@/lib/ai/analyze-chain";
import type { ChainSummary, ExpirationResponse, OptionChain, Quote } from "@/lib/market/types";

type ChainDashboardProps = {
  ticker: string;
};

const initialFilters: OptionFilterState = {
  minVolume: 0,
  minOpenInterest: 0,
  maxSpreadPercent: 45,
  visibility: "both",
};

export function ChainDashboard({ ticker }: ChainDashboardProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [expirations, setExpirations] = useState<string[]>([]);
  const [expiration, setExpiration] = useState<string | null>(null);
  const [chain, setChain] = useState<OptionChain | null>(null);
  const [filters, setFilters] = useState<OptionFilterState>(initialFilters);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [chainLoading, setChainLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [chainError, setChainError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadQuoteAndExpirations() {
      setQuoteLoading(true);
      setQuoteError(null);
      setChainError(null);

      try {
        const [quoteResponse, expirationsResponse] = await Promise.all([
          fetch(`/api/market/quote?ticker=${encodeURIComponent(ticker)}`),
          fetch(`/api/market/expirations?ticker=${encodeURIComponent(ticker)}`),
        ]);

        if (!quoteResponse.ok || !expirationsResponse.ok) {
          throw new Error("Unable to load market snapshot.");
        }

        const quoteData = (await quoteResponse.json()) as Quote;
        const expirationData = (await expirationsResponse.json()) as ExpirationResponse;

        if (active) {
          setQuote(quoteData);
          setExpirations(expirationData.expirations);
          setExpiration(expirationData.expirations[0] ?? null);
        }
      } catch (caught) {
        if (active) {
          setQuoteError(caught instanceof Error ? caught.message : "Unable to load quote.");
        }
      } finally {
        if (active) {
          setQuoteLoading(false);
        }
      }
    }

    void loadQuoteAndExpirations();

    return () => {
      active = false;
    };
  }, [ticker]);

  useEffect(() => {
    if (!expiration) {
      return;
    }

    let active = true;
    const selectedExpiration = expiration;

    async function loadChain() {
      setChainLoading(true);
      setChainError(null);

      try {
        const response = await fetch(
          `/api/market/options-chain?ticker=${encodeURIComponent(ticker)}&expiration=${encodeURIComponent(selectedExpiration)}`,
        );

        if (!response.ok) {
          throw new Error("Unable to load options chain.");
        }

        const data = (await response.json()) as OptionChain;
        if (active) {
          setChain(data);
        }
      } catch (caught) {
        if (active) {
          setChainError(caught instanceof Error ? caught.message : "Unable to load options chain.");
        }
      } finally {
        if (active) {
          setChainLoading(false);
        }
      }
    }

    void loadChain();

    return () => {
      active = false;
    };
  }, [ticker, expiration]);

  const chainSummary: ChainSummary | null = useMemo(() => {
    return chain ? summarizeChain(chain) : null;
  }, [chain]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-signal">Signal workspace</p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{ticker} options</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Screen liquidity, volatility, and risk signals before asking Hermes for context.
          </p>
        </div>

        <label className="w-full max-w-xs">
          <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Expiration</span>
          <select
            value={expiration ?? ""}
            onChange={(event) => setExpiration(event.target.value)}
            className="mt-1 w-full rounded-md border border-white/10 bg-panel px-3 py-3 text-sm text-white outline-none focus:border-signal"
          >
            {expirations.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-5">
          <QuoteCard quote={quote} loading={quoteLoading} error={quoteError} />
          <OptionFilters filters={filters} onChange={setFilters} />
          <OptionChainTable chain={chain} filters={filters} loading={chainLoading} error={chainError} />
          <Disclaimer />
        </section>
        <ChatPanel ticker={ticker} expiration={expiration} chainSummary={chainSummary} />
      </div>
    </main>
  );
}
