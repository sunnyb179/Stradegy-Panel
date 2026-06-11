"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type TickerSearchProps = {
  examples: string[];
};

export function TickerSearch({ examples }: TickerSearchProps) {
  const router = useRouter();
  const [ticker, setTicker] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = ticker.trim().toUpperCase();
    if (!normalized) {
      return;
    }

    router.push(`/chain/${encodeURIComponent(normalized)}`);
  }

  return (
    <div>
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="ticker">
          Ticker
        </label>
        <input
          id="ticker"
          value={ticker}
          onChange={(event) => setTicker(event.target.value)}
          placeholder="Enter ticker"
          className="min-h-12 flex-1 rounded-md border border-white/10 bg-ink px-4 text-base font-medium uppercase text-white outline-none transition placeholder:text-slate-600 focus:border-signal"
          maxLength={10}
        />
        <button
          type="submit"
          className="min-h-12 rounded-md bg-signal px-5 text-sm font-semibold text-ink transition hover:bg-sky-200"
        >
          Analyze
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => router.push(`/chain/${example}`)}
            className="rounded-md border border-white/10 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-signal/60 hover:text-white"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
