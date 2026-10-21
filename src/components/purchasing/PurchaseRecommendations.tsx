import { Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { usePurchaseStore } from "@/store/purchaseStore";

import type { PurchaseSuggestion, Supplier } from "@/types/purchasing";

import { formatCurrency, formatQuantity } from "@/utils/dashboard";

interface SupplierGroup {
  supplier: Supplier;
  suggestions: PurchaseSuggestion[];
}

interface PurchaseRecommendationsProps {
  groups: SupplierGroup[];
  onDraftCreated?: () => void;
}

function PurchaseRecommendations({
  groups,
  onDraftCreated,
}: PurchaseRecommendationsProps) {
  const createDraft = usePurchaseStore((state) => state.createDraft);

  const orders = usePurchaseStore((state) => state.orders);

  function handleCreateDraft(group: SupplierGroup) {
    const existingDraft = orders.some(
      (order) =>
        order.supplierId === group.supplier.id && order.status === "draft",
    );

    if (existingDraft) {
      toast.warning(
        "This supplier already has a draft. Place or cancel it first.",
      );
      return;
    }

    try {
      createDraft(group.supplier, group.suggestions);

      toast.success(`Draft created for ${group.supplier.name}.`);

      onDraftCreated?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create draft.",
      );
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 p-5">
        <ShoppingCart className="size-5 text-emerald-700" />

        <div>
          <h2 className="font-semibold text-slate-900">
            Suggested Supplier Orders
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Quantities rounded to supplier pack sizes and minimum quantities.
          </p>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-slate-500">
          No additional purchases are recommended.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {groups.map((group) => {
            const total = group.suggestions.reduce(
              (sum, item) => sum + item.estimatedCost,
              0,
            );

            const meetsMinimum = total >= group.supplier.minimumOrderValue;

            return (
              <div key={group.supplier.id} className="p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {group.supplier.name}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Delivery lead time: {group.supplier.leadTimeDays} days
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-500">Estimated total</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {formatCurrency(total)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {group.suggestions.map((item) => (
                    <div
                      key={item.ingredientId}
                      className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.emoji}</span>

                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {item.ingredientName}
                          </p>

                          <p className="text-xs text-slate-500">
                            Forecast: {formatQuantity(item.forecastDemand)}{" "}
                            {item.unit}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-700">
                          +{formatQuantity(item.suggestedQuantity)} {item.unit}
                        </p>

                        <p className="text-xs text-slate-500">
                          {formatCurrency(item.estimatedCost)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {!meetsMinimum && (
                  <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                    Order total is below the supplier minimum of{" "}
                    {formatCurrency(group.supplier.minimumOrderValue)}. Add more
                    items before placing the order.
                  </p>
                )}

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleCreateDraft(group)}
                    className="flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
                  >
                    <Plus className="size-4" />
                    Create Draft Order
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default PurchaseRecommendations;
