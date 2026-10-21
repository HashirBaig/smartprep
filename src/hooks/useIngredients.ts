import { useCallback, useEffect, useState } from "react";

import { ingredientsService } from "@/services";
import { getApiErrorMessage } from "@/utils/apiError";

import type {
  ApiIngredient,
  CreateIngredientPayload,
  UpdateIngredientPayload,
} from "@/types/api";

export function useIngredients() {
  const [ingredients, setIngredients] = useState<ApiIngredient[]>([]);

  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const fetchIngredients = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await ingredientsService.getAll();
      setIngredients(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchIngredients();
  }, [fetchIngredients]);

  const createIngredient = useCallback(
    async (payload: CreateIngredientPayload) => {
      setMutating(true);

      try {
        const created = await ingredientsService.create(payload);

        await fetchIngredients();

        return created;
      } finally {
        setMutating(false);
      }
    },
    [fetchIngredients],
  );

  const updateIngredient = useCallback(
    async (id: string, payload: UpdateIngredientPayload) => {
      setMutating(true);

      try {
        const updated = await ingredientsService.update(id, payload);

        await fetchIngredients();

        return updated;
      } finally {
        setMutating(false);
      }
    },
    [fetchIngredients],
  );

  return {
    ingredients,
    loading,
    mutating,
    error,
    refresh: fetchIngredients,
    createIngredient,
    updateIngredient,
  };
}
