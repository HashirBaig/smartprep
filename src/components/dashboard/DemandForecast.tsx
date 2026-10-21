import { BarChart3 } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { Ingredient, IngredientForecast } from "@/types/dashboard";

import { formatQuantity, getWeeklyDemand } from "@/utils/dashboard";

interface DemandForecastProps {
  ingredients: Ingredient[];
  forecasts: IngredientForecast[];
  selectedId: string;
  onSelectedIdChange: (id: string) => void;
}

function DemandForecast({
  ingredients,
  forecasts,
  selectedId,
  onSelectedIdChange,
}: DemandForecastProps) {
  const forecast = forecasts.find((item) => item.ingredientId === selectedId);

  const ingredient = ingredients.find((item) => item.id === selectedId);

  if (!forecast || !ingredient) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500">Forecast data is unavailable.</p>
      </section>
    );
  }

  const weeklyDemand = getWeeklyDemand(forecast);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-5 text-emerald-700" />
          <h2 className="font-semibold text-slate-900">
            7-Day Demand Forecast
          </h2>
        </div>

        <select
          value={selectedId}
          onChange={(event) => onSelectedIdChange(event.target.value)}
          aria-label="Select ingredient forecast"
          className="max-w-44 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500"
        >
          {forecasts.map((item) => {
            const name = ingredients.find(
              (i) => i.id === item.ingredientId,
            )?.name;

            return (
              <option key={item.ingredientId} value={item.ingredientId}>
                {name ?? item.ingredientId}
              </option>
            );
          })}
        </select>
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-3">
        <p className="text-3xl font-semibold text-slate-900">
          {formatQuantity(weeklyDemand)}
          <span className="ml-2 text-sm font-normal text-slate-500">
            {ingredient.unit} / week
          </span>
        </p>
      </div>

      <p className="mt-1 text-xs text-slate-400">
        Predicted demand for the next 7 days
      </p>

      <div className="mt-6 h-64 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={forecast.dailyDemand}
            margin={{
              top: 10,
              right: 12,
              left: -20,
              bottom: 0,
            }}
          >
            <CartesianGrid
              stroke="#e2e8f0"
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              allowDecimals={ingredient.unit !== "pcs"}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />

            <Tooltip
              formatter={(value) => [
                `${formatQuantity(Number(value))} ${ingredient.unit}`,
                "Demand",
              ]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              }}
            />

            <Line
              type="monotone"
              dataKey="quantity"
              stroke="#15803d"
              strokeWidth={3}
              dot={{
                fill: "#15803d",
                strokeWidth: 0,
                r: 4,
              }}
              activeDot={{
                r: 6,
                fill: "#166534",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default DemandForecast;
