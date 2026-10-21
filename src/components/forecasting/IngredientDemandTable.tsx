import { ShoppingCart } from "lucide-react";

import type { Ingredient } from "@/types/dashboard";
import type { IngredientDemand } from "@/types/forecasting";

import { formatCurrency, formatQuantity } from "@/utils/dashboard";

interface IngredientDemandTableProps {
  demands: IngredientDemand[];
  ingredients: Ingredient[];
}

function IngredientDemandTable({
  demands,
  ingredients,
}: IngredientDemandTableProps) {
  const ingredientMap = new Map(ingredients.map((item) => [item.id, item]));

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 p-5">
        <ShoppingCart className="size-5 text-emerald-700" />

        <div>
          <h2 className="font-semibold text-slate-900">
            Forecasted Ingredient Requirements
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Calculated from recipes, expected dish sales, and current inventory.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-170 text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Ingredient</th>
              <th className="px-4 py-3 font-medium">Demand</th>
              <th className="px-4 py-3 font-medium">In Stock</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 text-right font-medium">Est. Cost</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {demands.map((demand) => {
              const ingredient = ingredientMap.get(demand.ingredientId);

              return (
                <tr key={demand.ingredientId} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {ingredient?.emoji ?? "📦"}
                      </span>
                      <span className="font-medium text-slate-800">
                        {ingredient?.name ?? demand.ingredientId}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-slate-700">
                    {formatQuantity(demand.totalDemand)} {demand.unit}
                  </td>

                  <td className="px-4 py-4 text-slate-700">
                    {formatQuantity(demand.currentStock)} {demand.unit}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={
                        demand.recommendedOrder > 0
                          ? "font-semibold text-emerald-700"
                          : "text-slate-400"
                      }
                    >
                      {demand.recommendedOrder > 0
                        ? `+${formatQuantity(demand.recommendedOrder)} ${demand.unit}`
                        : "No order"}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right font-medium text-slate-800">
                    {formatCurrency(demand.estimatedCost)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {demands.length === 0 && (
          <p className="p-8 text-center text-sm text-slate-500">
            No ingredient demand data available.
          </p>
        )}
      </div>
    </section>
  );
}

export default IngredientDemandTable;
