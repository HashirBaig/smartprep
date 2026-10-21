import api from "@/lib/axios";

import type {
  ApiPurchaseOrder,
  CreatePurchaseOrderPayload,
  UpdatePurchaseOrderStatusPayload,
  ReceivePurchaseOrderPayload,
} from "@/types/api";

const ENDPOINT = "/purchase-orders";

export const purchaseOrdersService = {
  /**
   * Retrieve all purchase orders.
   */
  getAll: async (): Promise<ApiPurchaseOrder[]> => {
    const { data } = await api.get<ApiPurchaseOrder[]>(ENDPOINT);

    return data;
  },

  /**
   * Create a draft purchase order.
   *
   * Only send the supplier ID, supplier product IDs,
   * and quantities. The backend validates and
   * calculates authoritative line prices.
   */
  createDraft: async (
    payload: CreatePurchaseOrderPayload,
  ): Promise<ApiPurchaseOrder> => {
    const { data } = await api.post<ApiPurchaseOrder>(ENDPOINT, payload);

    return data;
  },

  /**
   * Mark a draft as ordered or cancel an order.
   */
  updateStatus: async (
    orderId: string,
    payload: UpdatePurchaseOrderStatusPayload,
  ): Promise<ApiPurchaseOrder> => {
    const { data } = await api.patch<ApiPurchaseOrder>(
      `${ENDPOINT}/${encodeURIComponent(orderId)}/status`,
      payload,
    );

    return data;
  },

  /**
   * Shortcut for placing a draft order.
   */
  placeOrder: async (orderId: string): Promise<ApiPurchaseOrder> => {
    return purchaseOrdersService.updateStatus(orderId, { status: "ordered" });
  },

  /**
   * Shortcut for cancelling an order.
   */
  cancelOrder: async (orderId: string): Promise<ApiPurchaseOrder> => {
    return purchaseOrdersService.updateStatus(orderId, { status: "cancelled" });
  },

  /**
   * Receive a complete purchase order.
   *
   * MongoDB transaction updates order status,
   * stock batches, and movement records.
   */
  receiveOrder: async (
    orderId: string,
    payload: ReceivePurchaseOrderPayload,
  ): Promise<ApiPurchaseOrder> => {
    const { data } = await api.post<ApiPurchaseOrder>(
      `${ENDPOINT}/${encodeURIComponent(orderId)}/receive`,
      payload,
    );

    return data;
  },
};
