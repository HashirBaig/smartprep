import dayjs from "dayjs";

import { ArrowDownLeft, ArrowUpRight, History } from "lucide-react";

import type { ApiStockMovement } from "@/types/api";

import type { InventoryItem } from "@/types/inventory";

import { MOVEMENT_LABELS } from "@/constants/inventory";

import { formatQuantity } from "@/utils/dashboard";

interface MovementHistoryProps {
  movements: ApiStockMovement[];
  ingredients: InventoryItem[];
}

function MovementHistory({ movements, ingredients }: MovementHistoryProps) {
  const ingredientMap = new Map(ingredients.map((item) => [item.id, item]));

  const latestMovements = [...movements]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <History className="size-5 text-emerald-700" />

        <h2 className="font-semibold text-slate-900">Recent Stock Movements</h2>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Latest stock transactions recorded in MongoDB.
      </p>

      <div className="mt-5 divide-y divide-slate-100">
        {latestMovements.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No stock movements recorded yet.
          </p>
        ) : (
          latestMovements.map((movement) => {
            const ingredient = ingredientMap.get(movement.ingredientId);

            const incoming = movement.quantity > 0;

            const Icon = incoming ? ArrowDownLeft : ArrowUpRight;

            return (
              <div
                key={movement.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                      incoming
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    <Icon className="size-4" />
                  </span>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">
                      {ingredient?.name ?? "Unknown Ingredient"}
                    </p>

                    <p className="text-xs text-slate-500">
                      {MOVEMENT_LABELS[movement.type]}
                      {movement.note ? ` · ${movement.note}` : ""}
                    </p>

                    {movement.purchaseOrderId && (
                      <p className="mt-1 text-xs text-emerald-700">
                        Purchase order receipt
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p
                    className={`text-sm font-semibold ${
                      incoming ? "text-emerald-700" : "text-red-600"
                    }`}
                  >
                    {incoming ? "+" : ""}
                    {formatQuantity(movement.quantity)} {ingredient?.unit ?? ""}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {dayjs(movement.createdAt).format("DD MMM, HH:mm")}
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

export default MovementHistory;
