import { TickerSearch } from "@/components/TickerSearch";
import { Disclaimer } from "@/components/Disclaimer";

const examples = ["AAPL", "TSLA", "NVDA", "MSFT", "SPY"];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div>
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.22em] text-signal">
            AI options intelligence
          </p>
          <h1 className="text-5xl font-semibold tracking-normal text-white sm:text-7xl">
            Whisp
          </h1>
          <p className="mt-5 max-w-2xl text-2xl font-medium text-slate-200 sm:text-3xl">
            Catch the signal before it fades.
          </p>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Explore market signals, volatility, liquidity, and risk with Hermes, your AI market assistant.
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-panel/88 p-5 shadow-glow">
          <TickerSearch examples={examples} />
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-400 sm:grid-cols-3">
            <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
              <div className="text-slate-100">Options chain</div>
              <div>Calls, puts, IV, Greeks</div>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
              <div className="text-slate-100">Liquidity lens</div>
              <div>Volume, OI, spreads</div>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.03] p-3 sm:col-span-1 col-span-2">
              <div className="text-slate-100">Hermes</div>
              <div>Concise educational analysis</div>
            </div>
          </div>
        </div>
      </section>
      <div className="mt-10">
        <Disclaimer />
      </div>
    </main>
  );
}
