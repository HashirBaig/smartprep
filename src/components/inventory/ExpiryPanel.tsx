import dayjs from "dayjs";
import { CalendarClock } from "lucide-react";

import type { StockBatch, InventoryItem } from "@/types/inventory";

import { getBatchStatus, getExpiryLabel } from "@/utils/inventory";

import { formatQuantity } from "@/utils/dashboard";

interface ExpiryPanelProps {
  batches: StockBatch[];
  ingredients: InventoryItem[];
}

function ExpiryPanel({ batches, ingredients }: ExpiryPanelProps) {
  const relevantBatches = batches
    .filter(
      (batch) =>
        batch.quantity > 0 &&
        batch.expiryDate !== null &&
        getBatchStatus(batch.expiryDate) !== "good",
    )
    .sort((a, b) => (a.expiryDate ?? "").localeCompare(b.expiryDate ?? ""));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <CalendarClock className="size-5 text-amber-600" />
        <h2 className="font-semibold text-slate-900">Expiry Tracking</h2>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Batches expiring within 7 days, including expired stock.
      </p>

      <div className="mt-5 divide-y divide-slate-100">
        {relevantBatches.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No batches approaching expiration.
          </p>
        ) : (
          relevantBatches.map((batch) => {
            const ingredient = ingredients.find(
              (item) => item.id === batch.ingredientId,
            );

            const status = getBatchStatus(batch.expiryDate);

            return (
              <div
                key={batch.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-xl">
                    {ingredient?.emoji ?? "📦"}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {ingredient?.name ?? "Unknown Ingredient"}
                    </p>

                    <p className="text-xs text-slate-500">
                      {formatQuantity(batch.quantity)} {ingredient?.unit} ·{" "}
                      {batch.expiryDate
                        ? dayjs(batch.expiryDate).format("DD MMM YYYY")
                        : ""}
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    status === "expired" || status === "high"
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {getExpiryLabel(batch.expiryDate)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default ExpiryPanel;
