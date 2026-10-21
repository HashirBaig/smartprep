import { Download, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import type { PurchaseRecommendation } from "@/types/dashboard";
import { formatCurrency, formatQuantity } from "@/utils/dashboard";

interface PurchasePlanProps {
  recommendations: PurchaseRecommendation[];
}

function PurchasePlan({ recommendations }: PurchasePlanProps) {
  const totalCost = recommendations.reduce(
    (sum, item) => sum + item.estimatedCost,
    0,
  );

  function handleExport() {
    if (recommendations.length === 0) {
      toast.info("No purchases are required.");
      return;
    }

    const rows = [
      ["Ingredient", "Quantity", "Unit", "Unit Cost", "Total Cost"],
      ...recommendations.map((item) => [
        item.ingredient.name,
        String(item.quantity),
        item.ingredient.unit,
        item.ingredient.unitCost.toFixed(2),
        item.estimatedCost.toFixed(2),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","),
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "smartprep-purchase-plan.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    toast.success("Purchase plan exported.");
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="size-5 text-emerald-700" />
          <h2 className="font-semibold text-slate-900">
            Suggested Purchase Plan
          </h2>
        </div>

        <button
          type="button"
          onClick={handleExport}
          disabled={recommendations.length === 0}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="size-4" />
          Export Plan
        </button>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Based on 7-day demand and a 10% safety buffer.
      </p>

      <div className="mt-5 space-y-1">
        {recommendations.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Current stock covers predicted demand.
          </p>
        ) : (
          recommendations.map((item) => (
            <div
              key={item.ingredient.id}
              className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-xl">
                  {item.ingredient.emoji}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {item.ingredient.name}
                  </p>

                  <p className="text-xs font-medium text-emerald-700">
                    +{formatQuantity(item.quantity)} {item.ingredient.unit}
                  </p>
                </div>
              </div>

              <span className="shrink-0 text-sm font-semibold text-slate-800">
                {formatCurrency(item.estimatedCost)}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 p-4">
        <div>
          <p className="text-xs text-emerald-800">Estimated purchase cost</p>
          <p className="mt-1 text-xs text-emerald-700/70">
            Before tax and delivery
          </p>
        </div>

        <p className="text-xl font-semibold text-emerald-800">
          {formatCurrency(totalCost)}
        </p>
      </div>
    </section>
  );
}

export default PurchasePlan;
