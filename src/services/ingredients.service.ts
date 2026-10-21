import api from "@/lib/axios";

import type {
  ApiIngredient,
  CreateIngredientPayload,
  UpdateIngredientPayload,
  MongoDocument,
} from "@/types/api";

import type { InventoryItem } from "@/types/inventory";

type IngredientMutationResponse = InventoryItem & MongoDocument;

const ENDPOINT = "/ingredients";

export const ingredientsService = {
  /**
   * Get all ingredients.
   * Stock and expiry are calculated by the backend.
   */
  getAll: async (): Promise<ApiIngredient[]> => {
    const { data } = await api.get<ApiIngredient[]>(ENDPOINT);
    return data;
  },

  /**
   * Create a new ingredient.
   * New ingredients start with zero stock.
   */
  create: async (
    payload: CreateIngredientPayload,
  ): Promise<IngredientMutationResponse> => {
    const { data } = await api.post<IngredientMutationResponse>(
      ENDPOINT,
      payload,
    );

    return data;
  },

  /**
   * Update ingredient details.
   * The backend does not allow changing its unit.
   */
  update: async (
    id: string,
    payload: UpdateIngredientPayload,
  ): Promise<IngredientMutationResponse> => {
    const { data } = await api.put<IngredientMutationResponse>(
      `${ENDPOINT}/${encodeURIComponent(id)}`,
      payload,
    );

    return data;
  },
};
