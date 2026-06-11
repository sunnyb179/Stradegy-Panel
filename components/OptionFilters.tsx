export type OptionVisibility = "both" | "calls" | "puts";

export type OptionFilterState = {
  minVolume: number;
  minOpenInterest: number;
  maxSpreadPercent: number;
  visibility: OptionVisibility;
};

type OptionFiltersProps = {
  filters: OptionFilterState;
  onChange: (filters: OptionFilterState) => void;
};

export function OptionFilters({ filters, onChange }: OptionFiltersProps) {
  function update<K extends keyof OptionFilterState>(key: K, value: OptionFilterState[K]) {
    onChange({
      ...filters,
      [key]: value,
    });
  }

  return (
    <div className="rounded-lg border border-white/10 bg-panel p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-white">Filters</h2>
        <select
          value={filters.visibility}
          onChange={(event) => update("visibility", event.target.value as OptionVisibility)}
          className="rounded-md border border-white/10 bg-ink px-3 py-2 text-sm text-slate-200 outline-none focus:border-signal"
        >
          <option value="both">Calls & puts</option>
          <option value="calls">Calls only</option>
          <option value="puts">Puts only</option>
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Min volume</span>
          <input
            type="number"
            min={0}
            value={filters.minVolume}
            onChange={(event) => update("minVolume", Number(event.target.value))}
            className="mt-1 w-full rounded-md border border-white/10 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-signal"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Min open interest</span>
          <input
            type="number"
            min={0}
            value={filters.minOpenInterest}
            onChange={(event) => update("minOpenInterest", Number(event.target.value))}
            className="mt-1 w-full rounded-md border border-white/10 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-signal"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Max spread %</span>
          <input
            type="number"
            min={0}
            value={filters.maxSpreadPercent}
            onChange={(event) => update("maxSpreadPercent", Number(event.target.value))}
            className="mt-1 w-full rounded-md border border-white/10 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-signal"
          />
        </label>
      </div>
    </div>
  );
}
