import { useState } from "react";
import { ArrowLeftRight, Pencil } from "lucide-react";

import { INGREDIENT_CATEGORIES } from "@/constants/inventory";
import type { Ingredient } from "@/types/dashboard";

import { formatCurrency, formatQuantity } from "@/utils/dashboard";

interface InventoryTableProps {
  ingredients: Ingredient[];
  onEdit: (ingredient: Ingredient) => void;
  onAdjust: (ingredient: Ingredient) => void;
}

function InventoryTable({
  ingredients,
  onEdit,
  onAdjust,
}: InventoryTableProps) {
  const [category, setCategory] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");

  const filtered = ingredients.filter((item) => {
    const matchesCategory = category === "All" || item.category === category;

    const isLow = item.stock < item.minimumStock;

    const matchesStock =
      stockFilter === "All" ||
      (stockFilter === "Low" && isLow) ||
      (stockFilter === "Good" && !isLow);

    return matchesCategory && matchesStock;
  });

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">All Ingredients</h2>

          <p className="mt-1 text-xs text-slate-500">
            Showing {filtered.length} of {ingredients.length} ingredients
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter by category"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
          >
            <option value="All">All Categories</option>
            {INGREDIENT_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(event) => setStockFilter(event.target.value)}
            aria-label="Filter by stock status"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
          >
            <option value="All">All Stock</option>
            <option value="Low">Low Stock</option>
            <option value="Good">In Stock</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-185 text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Ingredient</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Minimum</th>
              <th className="px-4 py-3 font-medium">Unit Cost</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Expiry</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filtered.map((item) => {
              const lowStock = item.stock < item.minimumStock;

              return (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-slate-50 text-2xl">
                        {item.emoji}
                      </span>

                      <div>
                        <p className="font-medium text-slate-800">
                          {item.name}
                        </p>

                        <p className="text-xs text-slate-400">
                          {item.category}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 font-medium text-slate-800">
                    {formatQuantity(item.stock)} {item.unit}
                  </td>

                  <td className="px-4 py-4 text-slate-500">
                    {formatQuantity(item.minimumStock)} {item.unit}
                  </td>

                  <td className="px-4 py-4 text-slate-700">
                    {formatCurrency(item.unitCost)}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        lowStock
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {lowStock ? "Low Stock" : "In Stock"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={
                        item.expiresInDays !== null && item.expiresInDays <= 3
                          ? "font-medium text-red-600"
                          : "text-slate-500"
                      }
                    >
                      {item.expiresInDays === null
                        ? "N/A"
                        : item.expiresInDays < 0
                          ? "Expired"
                          : `${item.expiresInDays} days`}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        title="Adjust stock"
                        aria-label={`Adjust ${item.name} stock`}
                        onClick={() => onAdjust(item)}
                        className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <ArrowLeftRight className="size-4" />
                      </button>

                      <button
                        type="button"
                        title="Edit ingredient"
                        aria-label={`Edit ${item.name}`}
                        onClick={() => onEdit(item)}
                        className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                      >
                        <Pencil className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="p-8 text-center text-sm text-slate-500">
            No matching ingredients.
          </p>
        )}
      </div>
    </section>
  );
}

export default InventoryTable;
