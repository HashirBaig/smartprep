import { RefreshCw, TrendingUp } from "lucide-react";

import type { ForecastSettings } from "@/types/forecasting";

interface ForecastHeaderProps {
  settings: ForecastSettings;
  onSettingsChange: (settings: ForecastSettings) => void;
}

function ForecastHeader({ settings, onSettingsChange }: ForecastHeaderProps) {
  return (
    <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
      <div>
        <p className="mb-1 flex items-center gap-2 text-sm font-medium text-emerald-700">
          <TrendingUp className="size-4" />
          Demand Intelligence
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Demand Forecasting
        </h1>

        <p className="mt-2 max-w-xl text-sm text-slate-500">
          Predict menu sales, calculate ingredient requirements, and plan
          purchases for the next 7 days.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
          Safety buffer
          <select
            value={settings.safetyBufferPercent}
            onChange={(event) =>
              onSettingsChange({
                ...settings,
                safetyBufferPercent: Number(event.target.value),
              })
            }
            className="bg-transparent font-medium text-emerald-700 outline-none"
          >
            {[0, 5, 10, 15, 20].map((value) => (
              <option key={value} value={value}>
                {value}%
              </option>
            ))}
          </select>
        </label>

        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={settings.useTrend}
            onChange={(event) =>
              onSettingsChange({
                ...settings,
                useTrend: event.target.checked,
              })
            }
            className="accent-emerald-700"
          />
          Recent trend
        </label>

        <button
          type="button"
          onClick={() =>
            onSettingsChange({
              safetyBufferPercent: 10,
              useTrend: true,
            })
          }
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
        >
          <RefreshCw className="size-4" />
          Reset
        </button>
      </div>
    </header>
  );
}

export default ForecastHeader;
