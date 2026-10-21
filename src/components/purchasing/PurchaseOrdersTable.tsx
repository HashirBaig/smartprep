import dayjs from "dayjs";
import { ClipboardList } from "lucide-react";
import { toast } from "sonner";

import { usePurchaseStore } from "@/store/purchaseStore";
import { calculateOrderTotal } from "@/utils/purchasing";
import { formatCurrency } from "@/utils/dashboard";

import { ORDER_STATUS_LABELS } from "@/constants/purchasing";

import type { PurchaseOrder, Supplier } from "@/types/purchasing";

interface PurchaseOrdersTableProps {
  orders: PurchaseOrder[];
  suppliers: Supplier[];
  onReceive: (order: PurchaseOrder) => void;
}

const STATUS_STYLES = {
  draft: "bg-slate-100 text-slate-700",
  ordered: "bg-blue-50 text-blue-700",
  received: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
};

function PurchaseOrdersTable({
  orders,
  suppliers,
  onReceive,
}: PurchaseOrdersTableProps) {
  const updateStatus = usePurchaseStore((state) => state.updateStatus);

  function handlePlaceOrder(order: PurchaseOrder) {
    const supplier = suppliers.find((item) => item.id === order.supplierId);

    if (!supplier) {
      toast.error("Supplier not found.");
      return;
    }

    if (calculateOrderTotal(order) < supplier.minimumOrderValue) {
      toast.error(
        `Minimum supplier order is ${formatCurrency(
          supplier.minimumOrderValue,
        )}.`,
      );
      return;
    }

    const error = updateStatus(order.id, "ordered");

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Order marked as placed.");
  }

  function handleCancel(order: PurchaseOrder) {
    const error = updateStatus(order.id, "cancelled");

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Order cancelled.");
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 p-5">
        <ClipboardList className="size-5 text-emerald-700" />
        <h2 className="font-semibold text-slate-900">Purchase Orders</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-195 text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Supplier</th>
              <th className="px-4 py-3 font-medium">Delivery</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => {
              const supplier = suppliers.find(
                (item) => item.id === order.supplierId,
              );

              return (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-800">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {order.lines.length} items
                    </p>
                  </td>

                  <td className="px-4 py-4 text-slate-700">
                    {supplier?.name ?? "Unknown"}
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {dayjs(order.expectedDeliveryDate).format("DD MMM YYYY")}
                  </td>

                  <td className="px-4 py-4 font-semibold text-slate-800">
                    {formatCurrency(calculateOrderTotal(order))}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[order.status]}`}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {order.status === "draft" && (
                        <button
                          type="button"
                          onClick={() => handlePlaceOrder(order)}
                          className="cursor-pointer rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800"
                        >
                          Place Order
                        </button>
                      )}

                      {order.status === "ordered" && (
                        <button
                          type="button"
                          onClick={() => onReceive(order)}
                          className="cursor-pointer rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800"
                        >
                          Receive
                        </button>
                      )}

                      {(order.status === "draft" ||
                        order.status === "ordered") && (
                        <button
                          type="button"
                          onClick={() => handleCancel(order)}
                          className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-red-50 hover:text-red-700"
                        >
                          Cancel
                        </button>
                      )}

                      {(order.status === "received" ||
                        order.status === "cancelled") && (
                        <span className="text-xs text-slate-400">Closed</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {orders.length === 0 && (
          <p className="p-10 text-center text-sm text-slate-500">
            No purchase orders yet. Generate a draft from the recommendations
            above.
          </p>
        )}
      </div>
    </section>
  );
}

export default PurchaseOrdersTable;
