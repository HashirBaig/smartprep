import { AlertTriangle } from "lucide-react";

import type { Ingredient } from "@/types/dashboard";
import { formatQuantity, getExpiryRisk } from "@/utils/dashboard";

interface WasteRiskProps {
  ingredients: Ingredient[];
}

function WasteRisk({ ingredients }: WasteRiskProps) {
  const atRiskIngredients = ingredients
    .filter((ingredient) => getExpiryRisk(ingredient) !== "none")
    .sort(
      (a, b) => (a.expiresInDays ?? Infinity) - (b.expiresInDays ?? Infinity),
    );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-5 text-amber-600" />
        <h2 className="font-semibold text-slate-900">Waste Risk</h2>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Ingredients approaching their expiry date.
      </p>

      <div className="mt-5 space-y-2">
        {atRiskIngredients.length === 0 ? (
          <p className="py-5 text-sm text-slate-500">
            No upcoming expiry alerts.
          </p>
        ) : (
          atRiskIngredients.map((ingredient) => {
            const risk = getExpiryRisk(ingredient);
            const highRisk = risk === "high";

            return (
              <div
                key={ingredient.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="text-2xl">{ingredient.emoji}</span>

                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {ingredient.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {formatQuantity(ingredient.stock)} {ingredient.unit}{" "}
                      available
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      highRisk
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {highRisk ? "High" : "Medium"}
                  </span>

                  <p className="mt-1 text-xs text-slate-500">
                    {ingredient.expiresInDays} days left
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default WasteRisk;
