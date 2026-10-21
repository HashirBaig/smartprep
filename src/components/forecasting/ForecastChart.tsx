import { useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  DailyDishForecast,
  DishSale,
  MenuRecipe,
} from "@/types/forecasting";

interface ForecastChartProps {
  sales: DishSale[];
  forecasts: DailyDishForecast[];
  recipes: MenuRecipe[];
}

function ForecastChart({ sales, forecasts, recipes }: ForecastChartProps) {
  const [selectedRecipe, setSelectedRecipe] = useState("all");

  const data = useMemo(() => {
    const matchesRecipe = (id: string) =>
      selectedRecipe === "all" || selectedRecipe === id;

    const historyMap = new Map<string, number>();
    const forecastMap = new Map<string, number>();

    sales
      .filter((item) => matchesRecipe(item.recipeId))
      .forEach((item) => {
        historyMap.set(
          item.date,
          (historyMap.get(item.date) ?? 0) + item.quantity,
        );
      });

    forecasts
      .filter((item) => matchesRecipe(item.recipeId))
      .forEach((item) => {
        forecastMap.set(
          item.date,
          (forecastMap.get(item.date) ?? 0) + item.quantity,
        );
      });

    const historicalDates = [...historyMap.keys()].sort().slice(-7);

    const forecastDates = [...forecastMap.keys()].sort();

    return [
      ...historicalDates.map((date) => ({
        date,
        label: dayjs(date).format("DD MMM"),
        actual: historyMap.get(date) ?? 0,
        predicted: null as number | null,
      })),
      ...forecastDates.map((date) => ({
        date,
        label: dayjs(date).format("DD MMM"),
        actual: null as number | null,
        predicted: forecastMap.get(date) ?? 0,
      })),
    ];
  }, [sales, forecasts, selectedRecipe]);

  const totalForecast = data.reduce(
    (sum, row) => sum + (row.predicted ?? 0),
    0,
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-slate-900">
            Sales Demand Forecast
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Last 7 days versus the next 7 days
          </p>
        </div>

        <select
          value={selectedRecipe}
          onChange={(event) => setSelectedRecipe(event.target.value)}
          aria-label="Select menu dish"
          className="max-w-52 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
        >
          <option value="all">All Dishes</option>
          {recipes.map((recipe) => (
            <option key={recipe.id} value={recipe.id}>
              {recipe.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        <p className="text-xs text-slate-500">
          Expected portions in next 7 days
        </p>
        <p className="mt-1 text-3xl font-semibold text-slate-900">
          {totalForecast.toLocaleString()}
        </p>
      </div>

      <div className="mt-6 h-80 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient
                id="smartprepForecastFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#16a34a" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#e2e8f0"
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#94a3b8",
                fontSize: 11,
              }}
              interval="preserveStartEnd"
            />

            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#94a3b8",
                fontSize: 11,
              }}
            />

            <Tooltip
              labelFormatter={(_label, payload) =>
                payload?.[0]?.payload?.date ?? ""
              }
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
              }}
            />

            <Line
              dataKey="actual"
              name="Actual sales"
              stroke="#94a3b8"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />

            <Area
              dataKey="predicted"
              name="Predicted sales"
              stroke="#15803d"
              fill="url(#smartprepForecastFill)"
              strokeWidth={3}
              dot={{ r: 3, fill: "#15803d" }}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-500">
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-6 bg-slate-400" />
          Historical sales
        </span>

        <span className="flex items-center gap-2">
          <span className="h-0.5 w-6 bg-emerald-700" />
          Predicted demand
        </span>
      </div>
    </section>
  );
}

export default ForecastChart;
