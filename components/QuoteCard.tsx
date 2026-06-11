import type { Quote } from "@/lib/market/types";
import { formatCurrency } from "@/lib/utils";

type QuoteCardProps = {
  quote: Quote | null;
  loading: boolean;
  error: string | null;
};

export function QuoteCard({ quote, loading, error }: QuoteCardProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-white/10 bg-panel p-4">
        <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
        <div className="mt-4 h-8 w-36 animate-pulse rounded bg-white/10" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-400/30 bg-red-950/20 p-4 text-sm text-red-200">
        {error}
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  const positive = quote.change >= 0;

  return (
    <div className="rounded-lg border border-white/10 bg-panel p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.16em] text-slate-500">Underlying</p>
          <h1 className="mt-1 text-3xl font-semibold text-white">{quote.ticker}</h1>
        </div>
        <div className="text-right">
          <div className="text-3xl font-semibold text-white">{formatCurrency(quote.price)}</div>
          <div className={positive ? "text-sm text-mint" : "text-sm text-red-300"}>
            {positive ? "+" : ""}
            {quote.change.toFixed(2)} ({positive ? "+" : ""}
            {quote.changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>
      <div className="mt-4 text-xs text-slate-500">
        Mock-ready normalized quote as of {new Date(quote.asOf).toLocaleString()}
      </div>
    </div>
  );
}
