import { useState } from "react";
import type { FormEvent } from "react";

import dayjs from "dayjs";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import type { Ingredient } from "@/types/dashboard";

import type { StockAdjustmentInput } from "@/types/inventory";

import type { StockAdjustmentPayload } from "@/types/api";

import { formatQuantity } from "@/utils/dashboard";
import { getApiErrorMessage } from "@/utils/apiError";

interface StockDialogProps {
  ingredient: Ingredient;
  onClose: () => void;
  onSubmit: (
    ingredientId: string,
    payload: StockAdjustmentPayload,
  ) => Promise<unknown>;
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

function StockDialog({ ingredient, onClose, onSubmit }: StockDialogProps) {
  const [type, setType] = useState<StockAdjustmentInput["type"]>("receive");

  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  const [expiryDate, setExpiryDate] = useState(
    dayjs().add(7, "day").format("YYYY-MM-DD"),
  );

  const [hasExpiry, setHasExpiry] = useState(true);
  const [saving, setSaving] = useState(false);

  const isIncoming = type === "receive" || type === "adjust-in";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedQuantity = Number(quantity);

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      toast.error("Enter a valid quantity.");
      return;
    }

    if (ingredient.unit === "pcs" && !Number.isInteger(parsedQuantity)) {
      toast.error("Piece quantities must be whole numbers.");
      return;
    }

    const payload: StockAdjustmentPayload = isIncoming
      ? {
          type,
          quantity: parsedQuantity,
          expiryDate: hasExpiry ? expiryDate : null,
          note: note.trim(),
        }
      : {
          type,
          quantity: parsedQuantity,
          note: note.trim(),
        };

    try {
      setSaving(true);

      await onSubmit(ingredient.id, payload);

      toast.success("Stock updated successfully.");
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
        aria-labelledby="stock-dialog-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
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
            disabled={saving}
            onClick={onClose}
            aria-label="Close dialog"
            className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mb-5 rounded-xl bg-emerald-50 p-4">
          <p className="text-xs text-emerald-700">Current Recorded Stock</p>

          <p className="mt-1 text-2xl font-semibold text-emerald-800">
            {formatQuantity(ingredient.stock)}{" "}
            <span className="text-base font-normal">{ingredient.unit}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1.5 text-sm text-slate-700">
            <span>Movement Type</span>

            <select
              disabled={saving}
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
              required
              disabled={saving}
              type="number"
              min={ingredient.unit === "pcs" ? "1" : "0.001"}
              step={ingredient.unit === "pcs" ? "1" : "0.001"}
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
                  disabled={saving}
                  onChange={(event) => setHasExpiry(event.target.checked)}
                  className="accent-emerald-700"
                />
                Track expiry date
              </label>

              {hasExpiry && (
                <label className="block space-y-1.5 text-sm text-slate-700">
                  <span>Expiry Date</span>

                  <input
                    required
                    disabled={saving}
                    type="date"
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
              maxLength={500}
              disabled={saving}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="e.g. Weekly supplier delivery"
              className="w-full resize-none rounded-lg border border-slate-200 p-3 outline-none"
            />
          </label>

          {!isIncoming && (
            <p className="text-xs text-slate-500">
              The backend automatically deducts stock from the earliest-expiring
              eligible batches. Expired stock cannot be used for kitchen
              consumption.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}

              {saving ? "Updating..." : "Confirm Movement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StockDialog;
