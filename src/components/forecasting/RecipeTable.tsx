import { useState } from "react";
import { ChefHat } from "lucide-react";

import type { Ingredient } from "@/types/dashboard";
import type { MenuRecipe } from "@/types/forecasting";

import { formatCurrency, formatQuantity } from "@/utils/dashboard";

import { getRecipeFoodCost } from "@/utils/forecasting";

interface RecipeTableProps {
  recipes: MenuRecipe[];
  ingredients: Ingredient[];
}

function RecipeTable({ recipes, ingredients }: RecipeTableProps) {
  const [selectedId, setSelectedId] = useState(recipes[0]?.id ?? "");

  const recipe = recipes.find((item) => item.id === selectedId);

  if (!recipe) return null;

  const foodCost = getRecipeFoodCost(recipe, ingredients);

  const foodCostPercent =
    recipe.sellingPrice > 0 ? (foodCost / recipe.sellingPrice) * 100 : 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <ChefHat className="size-5 text-emerald-700" />
        <h2 className="font-semibold text-slate-900">Recipe Consumption</h2>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Ingredient requirements for one serving.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {recipes.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedId(item.id)}
            className={`cursor-pointer rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              selectedId === item.id
                ? "bg-emerald-700 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {item.emoji} {item.name}
          </button>
        ))}
      </div>

      <div className="mt-5 divide-y divide-slate-100">
        {recipe.ingredients.map((entry) => {
          const ingredient = ingredients.find(
            (item) => item.id === entry.ingredientId,
          );

          return (
            <div
              key={entry.ingredientId}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{ingredient?.emoji ?? "📦"}</span>
                <span className="text-sm text-slate-700">
                  {ingredient?.name ?? entry.ingredientId}
                </span>
              </div>

              <span className="text-sm font-medium text-slate-800">
                {formatQuantity(entry.quantity)} {ingredient?.unit ?? ""}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          {
            label: "Selling Price",
            value: formatCurrency(recipe.sellingPrice),
          },
          {
            label: "Food Cost",
            value: formatCurrency(foodCost),
          },
          {
            label: "Food Cost %",
            value: `${foodCostPercent.toFixed(1)}%`,
          },
        ].map((item) => (
          <div key={item.label} className="rounded-xl bg-slate-50 p-3">
            <p className="text-[11px] text-slate-500">{item.label}</p>
            <p className="mt-2 text-base font-semibold text-slate-900">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecipeTable;
