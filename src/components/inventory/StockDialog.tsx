import { useState } from "react";
import dayjs from "dayjs";
import { X } from "lucide-react";
import { toast } from "sonner";

import { useInventoryStore } from "@/store/inventoryStore";
import type { Ingredient } from "@/types/dashboard";
import type { StockAdjustmentInput } from "@/types/inventory";
import { formatQuantity } from "@/utils/dashboard";

interface StockDialogProps {
  ingredient: Ingredient;
  onClose: () => void;
}

const OPTIONS: {
  value: StockAdjustmentInput["type"];
  label: string;
}[] = [
  { value: "receive", label: "Receive Delivery" },
  { value: "use", label: "Kitchen Usage" },
  { value: "waste", label: "Record Waste" },
  { value: "adjust-in", label: "Positive Correction" },
  { value: "adjust-out", label: "Negative Correction" },
];

function StockDialog({ ingredient, onClose }: StockDialogProps) {
  const adjustStock = useInventoryStore((state) => state.adjustStock);

  const [type, setType] = useState<StockAdjustmentInput["type"]>("receive");

  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  const [expiryDate, setExpiryDate] = useState(
    dayjs().add(7, "day").format("YYYY-MM-DD"),
  );

  const [hasExpiry, setHasExpiry] = useState(true);

  const isIncoming = type === "receive" || type === "adjust-in";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedQuantity = Number(quantity);

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      toast.error("Enter a valid quantity.");
      return;
    }

    const error = adjustStock({
      ingredientId: ingredient.id,
      type,
      quantity: parsedQuantity,
      expiryDate: isIncoming && hasExpiry ? expiryDate : null,
      note: note.trim(),
    });

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Stock updated successfully.");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stock-dialog-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2
              id="stock-dialog-title"
              className="text-xl font-semibold text-slate-900"
            >
              Adjust Stock
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {ingredient.emoji} {ingredient.name}
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

        <div className="mb-5 rounded-xl bg-emerald-50 p-4">
          <p className="text-xs text-emerald-700">Current Stock</p>

          <p className="mt-1 text-2xl font-semibold text-emerald-800">
            {formatQuantity(ingredient.stock)}{" "}
            <span className="text-base font-normal">{ingredient.unit}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1.5 text-sm text-slate-700">
            <span>Movement Type</span>

            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value as StockAdjustmentInput["type"])
              }
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3"
            >
              {OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5 text-sm text-slate-700">
            <span>Quantity ({ingredient.unit})</span>

            <input
              type="number"
              min={ingredient.unit === "pcs" ? "1" : "0.001"}
              step={ingredient.unit === "pcs" ? "1" : "0.001"}
              required
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="0"
              className="h-11 w-full rounded-lg border border-slate-200 px-3 outline-none"
            />
          </label>

          {isIncoming && (
            <div className="space-y-3 rounded-xl border border-slate-200 p-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={hasExpiry}
                  onChange={(event) => setHasExpiry(event.target.checked)}
                  className="accent-emerald-700"
                />
                Track expiry date
              </label>

              {hasExpiry && (
                <label className="block space-y-1.5 text-sm text-slate-700">
                  <span>Expiry Date</span>
                  <input
                    type="date"
                    required
                    min={dayjs().format("YYYY-MM-DD")}
                    value={expiryDate}
                    onChange={(event) => setExpiryDate(event.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-200 px-3"
                  />
                </label>
              )}
            </div>
          )}

          <label className="block space-y-1.5 text-sm text-slate-700">
            <span>Note (optional)</span>

            <textarea
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="e.g. Weekly supplier delivery"
              className="w-full resize-none rounded-lg border border-slate-200 p-3 outline-none"
            />
          </label>

          {!isIncoming && (
            <p className="text-xs text-slate-500">
              Outgoing stock is deducted from the batches expiring soonest.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="cursor-pointer rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
            >
              Confirm Movement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StockDialog;
