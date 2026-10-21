import { useState } from "react";
import dayjs from "dayjs";
import { toast } from "sonner";
import { PackageCheck, X } from "lucide-react";

import { usePurchaseStore } from "@/store/purchaseStore";
import { useInventoryData } from "@/hooks/useInventoryData";

import type { DeliveryLine, PurchaseOrder } from "@/types/purchasing";

import { formatQuantity } from "@/utils/dashboard";

interface ReceiveOrderDialogProps {
  order: PurchaseOrder;
  onClose: () => void;
}

function ReceiveOrderDialog({ order, onClose }: ReceiveOrderDialogProps) {
  const receiveOrder = usePurchaseStore((state) => state.receiveOrder);

  const { ingredientMap } = useInventoryData();

  const [deliveryLines, setDeliveryLines] = useState<DeliveryLine[]>(
    order.lines.map((line) => ({
      orderLineId: line.id,
      quantity: line.quantity,
      expiryDate: dayjs().add(7, "day").format("YYYY-MM-DD"),
    })),
  );

  function updateExpiryDate(orderLineId: string, value: string) {
    setDeliveryLines((current) =>
      current.map((line) =>
        line.orderLineId === orderLineId
          ? { ...line, expiryDate: value || null }
          : line,
      ),
    );
  }

  function handleReceive() {
    const error = receiveOrder(order.id, deliveryLines);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Delivery received. Inventory has been updated.");

    onClose();
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="receive-order-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="receive-order-title"
              className="text-xl font-semibold text-slate-900"
            >
              Receive Delivery
            </h2>

            <p className="mt-1 text-sm text-slate-500">{order.orderNumber}</p>
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

        <div className="mt-5 rounded-xl bg-emerald-50 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-800">
            <PackageCheck className="size-4" />
            Confirm received stock
          </p>

          <p className="mt-2 text-xs leading-relaxed text-emerald-800/80">
            Each ingredient will be added to inventory as a new batch. Enter the
            expiry dates printed on the delivered products.
          </p>
        </div>

        <div className="mt-5 space-y-4">
          {order.lines.map((line) => {
            const ingredient = ingredientMap.get(line.ingredientId);

            const delivery = deliveryLines.find(
              (item) => item.orderLineId === line.id,
            );

            return (
              <div
                key={line.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {ingredient?.emoji ?? "📦"}
                    </span>

                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {ingredient?.name ?? line.ingredientId}
                      </p>
                      <p className="text-xs text-slate-500">Full delivery</p>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-emerald-700">
                    +{formatQuantity(line.quantity)} {line.unit}
                  </p>
                </div>

                <label className="mt-4 block space-y-1.5 text-xs text-slate-600">
                  <span>Expiry Date (optional)</span>

                  <input
                    type="date"
                    min={dayjs().format("YYYY-MM-DD")}
                    value={delivery?.expiryDate ?? ""}
                    onChange={(event) =>
                      updateExpiryDate(line.id, event.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500"
                  />
                </label>
              </div>
            );
          })}
        </div>

        <p className="mt-5 text-xs text-amber-700">
          Confirm only after the full quantities have physically arrived and
          been checked.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-600"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleReceive}
            className="cursor-pointer rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
          >
            Confirm Delivery
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReceiveOrderDialog;
