import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { INGREDIENT_CATEGORIES, INGREDIENT_UNITS } from "@/constants/inventory";

import { useInventoryStore } from "@/store/inventoryStore";

import type { IngredientCategory, IngredientUnit } from "@/types/dashboard";
import type { IngredientInput, InventoryItem } from "@/types/inventory";

interface IngredientDialogProps {
  ingredient?: InventoryItem | null;
  onClose: () => void;
}

function IngredientDialog({ ingredient, onClose }: IngredientDialogProps) {
  const addIngredient = useInventoryStore((state) => state.addIngredient);
  const updateIngredient = useInventoryStore((state) => state.updateIngredient);

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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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

    // Existing batches use the old unit. We deliberately
    // prevent changing units once stock exists.
    if (ingredient && ingredient.unit !== unit) {
      toast.error(
        "Changing an existing ingredient's unit is not supported yet.",
      );
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

    if (ingredient) {
      updateIngredient(ingredient.id, payload);
      toast.success("Ingredient updated.");
    } else {
      addIngredient(payload);
      toast.success("Ingredient created.");
    }

    onClose();
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/50 p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ingredient-dialog-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
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
              Manage the details of your ingredient.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100"
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
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Chicken Breast"
                className="h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-emerald-500"
              />
            </label>

            <label className="space-y-1.5 text-sm text-slate-700">
              <span>Icon</span>
              <input
                value={emoji}
                onChange={(event) => setEmoji(event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-center text-xl outline-none"
              />
            </label>
          </div>

          <label className="block space-y-1.5 text-sm text-slate-700">
            <span>Category</span>
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as IngredientCategory)
              }
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 outline-none"
            >
              {INGREDIENT_CATEGORIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5 text-sm text-slate-700">
              <span>Unit</span>
              <select
                value={unit}
                disabled={Boolean(ingredient)}
                onChange={(event) =>
                  setUnit(event.target.value as IngredientUnit)
                }
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 outline-none disabled:bg-slate-50 disabled:text-slate-400"
              >
                {INGREDIENT_UNITS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-sm text-slate-700">
              <span>Unit Cost (€)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={unitCost}
                onChange={(event) => setUnitCost(event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 px-3 outline-none"
              />
            </label>
          </div>

          <label className="block space-y-1.5 text-sm text-slate-700">
            <span>Minimum Stock Threshold</span>
            <input
              type="number"
              min="0"
              step={unit === "pcs" ? "1" : "0.1"}
              required
              value={minimumStock}
              onChange={(event) => setMinimumStock(event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 px-3 outline-none"
            />
          </label>

          {!ingredient && (
            <p className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
              New ingredients start with zero stock. Use "Adjust Stock" to
              record the first delivery.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="cursor-pointer rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
            >
              {ingredient ? "Save Changes" : "Create Ingredient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default IngredientDialog;
