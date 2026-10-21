import dayjs from "dayjs";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { PURCHASE_STORAGE_KEY } from "@/constants/purchasing";
import { useInventoryStore } from "@/store/inventoryStore";

import { mockSuppliers } from "@/data/mockSuppliers";

import type {
  DeliveryLine,
  PurchaseOrder,
  PurchaseOrderLine,
  PurchaseOrderStatus,
  PurchaseSuggestion,
  Supplier,
} from "@/types/purchasing";

interface PurchaseStore {
  orders: PurchaseOrder[];

  createDraft: (
    supplier: Supplier,
    suggestions: PurchaseSuggestion[],
  ) => string;

  updateStatus: (
    orderId: string,
    status: "ordered" | "cancelled",
  ) => string | null;

  receiveOrder: (
    orderId: string,
    deliveryLines: DeliveryLine[],
  ) => string | null;
}

function generateOrderNumber(): string {
  return `PO-${dayjs().format("YYMMDD")}-${crypto
    .randomUUID()
    .slice(0, 6)
    .toUpperCase()}`;
}

export const usePurchaseStore = create<PurchaseStore>()(
  persist(
    (set, get) => ({
      orders: [],

      createDraft: (supplier, suggestions) => {
        if (suggestions.length === 0) {
          throw new Error("No items to order.");
        }

        if (suggestions.some((item) => item.supplierId !== supplier.id)) {
          throw new Error("Supplier mismatch.");
        }

        const lines: PurchaseOrderLine[] = suggestions.map((item) => ({
          id: crypto.randomUUID(),
          ingredientId: item.ingredientId,
          supplierProductId: item.supplierProductId,
          quantity: item.suggestedQuantity,
          unitPrice: item.unitPrice,
          unit: item.unit,
        }));

        const id = crypto.randomUUID();

        const order: PurchaseOrder = {
          id,
          orderNumber: generateOrderNumber(),
          supplierId: supplier.id,
          status: "draft",
          createdAt: new Date().toISOString(),
          expectedDeliveryDate: dayjs()
            .add(supplier.leadTimeDays, "day")
            .format("YYYY-MM-DD"),
          orderedAt: null,
          receivedAt: null,
          lines,
        };

        set((state) => ({
          orders: [order, ...state.orders],
        }));

        return id;
      },

      updateStatus: (orderId, status) => {
        const order = get().orders.find((item) => item.id === orderId);

        if (!order) return "Order not found.";

        if (status === "ordered") {
          if (order.status !== "draft") {
            return "Only draft orders can be placed.";
          }
        } else if (order.status !== "draft" && order.status !== "ordered") {
          return "This order cannot be cancelled.";
        }

        const now = new Date().toISOString();

        set((state) => ({
          orders: state.orders.map((item) =>
            item.id === orderId
              ? {
                  ...item,
                  status,

                  orderedAt: status === "ordered" ? now : item.orderedAt,

                  // Recalculate delivery date when order is placed
                  expectedDeliveryDate:
                    status === "ordered"
                      ? dayjs()
                          .add(
                            mockSuppliers.find(
                              (supplier) => supplier.id === item.supplierId,
                            )?.leadTimeDays ?? 0,
                            "day",
                          )
                          .format("YYYY-MM-DD")
                      : item.expectedDeliveryDate,
                }
              : item,
          ),
        }));

        return null;
      },

      receiveOrder: (orderId, deliveryLines) => {
        const order = get().orders.find((item) => item.id === orderId);

        if (!order) return "Order not found.";

        if (order.status !== "ordered") {
          return "Only ordered purchase orders can be received.";
        }

        if (deliveryLines.length !== order.lines.length) {
          return "Every order line must be included.";
        }

        const uniqueLineIds = new Set(
          deliveryLines.map((line) => line.orderLineId),
        );

        if (uniqueLineIds.size !== order.lines.length) {
          return "Duplicate or missing delivery lines.";
        }

        const today = dayjs().format("YYYY-MM-DD");

        for (const line of deliveryLines) {
          const orderLine = order.lines.find(
            (item) => item.id === line.orderLineId,
          );

          if (!orderLine) {
            return "Unknown delivery line.";
          }

          if (
            !Number.isFinite(line.quantity) ||
            line.quantity !== orderLine.quantity
          ) {
            return "Full delivery quantities must match the order.";
          }

          if (
            line.expiryDate &&
            (!/^\d{4}-\d{2}-\d{2}$/.test(line.expiryDate) ||
              !dayjs(line.expiryDate).isValid() ||
              dayjs(line.expiryDate).format("YYYY-MM-DD") !== line.expiryDate ||
              line.expiryDate < today)
          ) {
            return "Invalid expiry date.";
          }
        }

        const inventory = useInventoryStore.getState();

        // Validate inventory references before any stock changes.
        for (const line of order.lines) {
          const ingredient = inventory.items.find(
            (item) => item.id === line.ingredientId,
          );

          if (!ingredient || ingredient.unit !== line.unit) {
            return "An ingredient is missing or its unit has changed.";
          }
        }

        // One synchronous inventory update per delivered order.
        // Each line creates a batch and receipt movement.
        const now = new Date().toISOString();

        const receivedBatches = deliveryLines.map((delivery) => {
          const orderLine = order.lines.find(
            (line) => line.id === delivery.orderLineId,
          )!;

          return {
            id: crypto.randomUUID(),
            ingredientId: orderLine.ingredientId,
            quantity: delivery.quantity,
            expiryDate: delivery.expiryDate,
            receivedAt: now,
          };
        });

        const receiptMovements = receivedBatches.map((batch, index) => ({
          id: crypto.randomUUID(),
          ingredientId: batch.ingredientId,
          batchId: batch.id,
          type: "received" as const,
          quantity: batch.quantity,
          note: `Purchase order ${order.orderNumber}`,
          createdAt: now,
          purchaseOrderId: order.id,
          purchaseOrderLineId: deliveryLines[index].orderLineId,
        }));

        // Inventory and order state update synchronously.
        // In production, the backend must do this atomically.
        useInventoryStore.setState((state) => ({
          batches: [...state.batches, ...receivedBatches],
          movements: [...receiptMovements, ...state.movements],
        }));

        set((state) => ({
          orders: state.orders.map((item) =>
            item.id === orderId
              ? {
                  ...item,
                  status: "received" as PurchaseOrderStatus,
                  receivedAt: now,
                }
              : item,
          ),
        }));

        return null;
      },
    }),
    {
      name: PURCHASE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        orders: state.orders,
      }),
    },
  ),
);
