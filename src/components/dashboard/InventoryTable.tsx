import { Boxes } from "lucide-react";
import type { Ingredient } from "@/types/dashboard";
import {
  formatCurrency,
  formatQuantity,
  getStockStatus,
} from "@/utils/dashboard";

interface InventoryTableProps {
  ingredients: Ingredient[];
}

function InventoryTable({ ingredients }: InventoryTableProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <Boxes className="size-5 text-emerald-700" />
        <h2 className="font-semibold text-slate-900">Inventory Overview</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-142.5 text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Ingredient</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Unit Cost</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Expiry</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {ingredients.map((ingredient) => {
              const isLow = getStockStatus(ingredient) === "low";

              return (
                <tr
                  key={ingredient.id}
                  className="transition-colors hover:bg-slate-50"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-slate-50 text-xl">
                        {ingredient.emoji}
                      </div>

                      <div>
                        <p className="font-medium text-slate-800">
                          {ingredient.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {ingredient.category}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-slate-700">
                    {formatQuantity(ingredient.stock)} {ingredient.unit}
                  </td>

                  <td className="px-4 py-3.5 text-slate-700">
                    {formatCurrency(ingredient.unitCost)}
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        isLow
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {isLow ? "Low stock" : "In stock"}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-slate-600">
                    {ingredient.expiresInDays === null
                      ? "N/A"
                      : `${ingredient.expiresInDays} days`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {ingredients.length === 0 && (
          <p className="p-8 text-center text-sm text-slate-500">
            No ingredients found.
          </p>
        )}
      </div>
    </section>
  );
}

export default InventoryTable;
