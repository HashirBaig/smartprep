import dayjs from "dayjs";
import { History } from "lucide-react";

import type { DishSale } from "@/types/forecasting";

interface SalesHistoryTableProps {
  sales: DishSale[];
}

function SalesHistoryTable({ sales }: SalesHistoryTableProps) {
  const dailyTotals = new Map<string, number>();

  for (const item of sales) {
    dailyTotals.set(
      item.date,
      (dailyTotals.get(item.date) ?? 0) + item.quantity,
    );
  }

  const rows = [...dailyTotals.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 7);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <History className="size-5 text-emerald-700" />

        <h2 className="font-semibold text-slate-900">Recent Sales History</h2>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Total portions sold per day across all menu dishes.
      </p>

      <div className="mt-5 divide-y divide-slate-100">
        {rows.map(([date, quantity]) => (
          <div key={date} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-slate-800">
                {dayjs(date).format("dddd")}
              </p>
              <p className="text-xs text-slate-400">
                {dayjs(date).format("DD MMM YYYY")}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">{quantity}</p>
              <p className="text-xs text-slate-400">portions sold</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SalesHistoryTable;
