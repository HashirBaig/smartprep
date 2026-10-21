import { useState } from "react";
import type { FormEvent } from "react";

import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { INGREDIENT_CATEGORIES, INGREDIENT_UNITS } from "@/constants/inventory";

import type { IngredientCategory, IngredientUnit } from "@/types/dashboard";

import type { IngredientInput, InventoryItem } from "@/types/inventory";

import { getApiErrorMessage } from "@/utils/apiError";

interface IngredientDialogProps {
  ingredient?: InventoryItem | null;
  onClose: () => void;
  onSubmit: (payload: IngredientInput) => Promise<unknown>;
}

function IngredientDialog({
  ingredient,
  onClose,
  onSubmit,
}: IngredientDialogProps) {
  const [name, setName] = useState(ingredient?.name ?? "");

  const [emoji, setEmoji] = useState(ingredient?.emoji ?? "🥬");

  const [category, setCategory] = useState<IngredientCategory>(
    ingredient?.category ?? "Vegetables",
  );

  const [unit, setUnit] = useState<IngredientUnit>(ingredient?.unit ?? "kg");

  const [unitCost, setUnitCost] = useState(
    ingredient?.unitCost.toString() ?? "0",
  );

  const [minimumStock, setMinimumStock] = useState(
    ingredient?.minimumStock.toString() ?? "0",
  );

  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedCost = Number(unitCost);
    const parsedMinimum = Number(minimumStock);

    if (!name.trim()) {
      toast.error("Ingredient name is required.");
      return;
    }

    if (
      !Number.isFinite(parsedCost) ||
      parsedCost < 0 ||
      !Number.isFinite(parsedMinimum) ||
      parsedMinimum < 0
    ) {
      toast.error("Enter valid cost and stock values.");
      return;
    }

    if (unit === "pcs" && !Number.isInteger(parsedMinimum)) {
      toast.error("Minimum piece stock must be a whole number.");
      return;
    }

    const payload: IngredientInput = {
      name: name.trim(),
      emoji: emoji.trim() || "📦",
      category,
      unit,
      unitCost: parsedCost,
      minimumStock: parsedMinimum,
    };

    try {
      setSaving(true);

      await onSubmit(payload);

      toast.success(
        ingredient
          ? "Ingredient updated successfully."
          : "Ingredient created successfully.",
      );

      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ingredient-dialog-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2
              id="ingredient-dialog-title"
              className="text-xl font-semibold text-slate-900"
            >
              {ingredient ? "Edit Ingredient" : "Add Ingredient"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage your ingredient details.
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close dialog"
            className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-[1fr_80px] gap-3">
            <label className="space-y-1.5 text-sm text-slate-700">
              <span>Ingredient Name</span>

              <input
                autoFocus
                required
                disabled={saving}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Chicken Breast"
                className="h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-emerald-500"
              />
            </label>

            <label className="space-y-1.5 text-sm text-slate-700">
              <span>Icon</span>

              <input
                disabled={saving}
                value={emoji}
                onChange={(event) => setEmoji(event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-center text-xl outline-none"
              />
            </label>
          </div>

          <label className="block space-y-1.5 text-sm text-slate-700">
            <span>Category</span>

            <select
              disabled={saving}
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as IngredientCategory)
              }
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 outline-none"
            >
              {INGREDIENT_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5 text-sm text-slate-700">
              <span>Unit</span>

              <select
                value={unit}
                disabled={saving || Boolean(ingredient)}
                onChange={(event) =>
                  setUnit(event.target.value as IngredientUnit)
                }
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 outline-none disabled:bg-slate-50"
              >
                {INGREDIENT_UNITS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-sm text-slate-700">
              <span>Unit Cost (€)</span>

              <input
                required
                disabled={saving}
                type="number"
                min="0"
                step="0.01"
                value={unitCost}
                onChange={(event) => setUnitCost(event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 px-3 outline-none"
              />
            </label>
          </div>

          <label className="block space-y-1.5 text-sm text-slate-700">
            <span>Minimum Stock Threshold</span>

            <input
              required
              disabled={saving}
              type="number"
              min="0"
              step={unit === "pcs" ? "1" : "0.1"}
              value={minimumStock}
              onChange={(event) => setMinimumStock(event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 px-3 outline-none"
            />
          </label>

          {!ingredient && (
            <p className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
              New ingredients start with zero stock. Record a delivery afterward
              to add quantities.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}

              {saving
                ? "Saving..."
                : ingredient
                  ? "Save Changes"
                  : "Create Ingredient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default IngredientDialog;
