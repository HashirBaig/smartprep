import api from "@/lib/axios";

import type {
  ApiStockBatch,
  ApiStockMovement,
  StockAdjustmentPayload,
  StockAdjustmentResponse,
} from "@/types/api";

const BATCH_ENDPOINT = "/stock-batches";
const MOVEMENT_ENDPOINT = "/stock-movements";

export const stockService = {
  /**
   * Get stock batches.
   * Optionally filter by ingredient ID.
   */
  getBatches: async (ingredientId?: string): Promise<ApiStockBatch[]> => {
    const { data } = await api.get<ApiStockBatch[]>(BATCH_ENDPOINT, {
      params: ingredientId ? { ingredientId } : {},
    });

    return data;
  },

  /**
   * Get stock movements.
   * Backend currently returns the latest 200.
   */
  getMovements: async (ingredientId?: string): Promise<ApiStockMovement[]> => {
    const { data } = await api.get<ApiStockMovement[]>(MOVEMENT_ENDPOINT, {
      params: ingredientId ? { ingredientId } : {},
    });

    return data;
  },

  /**
   * Receive stock, record kitchen usage,
   * waste, or make a stock correction.
   */
  adjust: async (
    ingredientId: string,
    payload: StockAdjustmentPayload,
  ): Promise<StockAdjustmentResponse> => {
    const { data } = await api.post<StockAdjustmentResponse>(
      `/ingredients/${encodeURIComponent(ingredientId)}/stock-adjustments`,
      payload,
    );

    return data;
  },
};
