import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ingredientsService, stockService } from "@/services";

import { getApiErrorMessage } from "@/utils/apiError";

import type {
  ApiIngredient,
  ApiStockBatch,
  ApiStockMovement,
  CreateIngredientPayload,
  UpdateIngredientPayload,
  StockAdjustmentPayload,
} from "@/types/api";

export function useInventoryData() {
  const [ingredients, setIngredients] = useState<ApiIngredient[]>([]);

  const [batches, setBatches] = useState<ApiStockBatch[]>([]);

  const [movements, setMovements] = useState<ApiStockMovement[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestId = useRef(0);
  const mounted = useRef(false);
  const mutationInProgress = useRef(false);

  const refresh = useCallback(async (initial = false) => {
    const currentRequest = ++requestId.current;

    if (initial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError(null);

    try {
      const [ingredientData, batchData, movementData] = await Promise.all([
        ingredientsService.getAll(),
        stockService.getBatches(),
        stockService.getMovements(),
      ]);

      if (mounted.current && currentRequest === requestId.current) {
        setIngredients(ingredientData);
        setBatches(batchData);
        setMovements(movementData);
      }
    } catch (err) {
      if (mounted.current && currentRequest === requestId.current) {
        setError(getApiErrorMessage(err));
      }

      throw err;
    } finally {
      if (mounted.current && currentRequest === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh(true).catch(() => {
      // The hook exposes the error state.
    });

    return () => {
      mounted.current = false;
      requestId.current += 1;
    };
  }, [refresh]);

  const runMutation = useCallback(
    async <T>(operation: () => Promise<T>): Promise<T> => {
      if (mutationInProgress.current) {
        throw new Error("Another inventory operation is in progress.");
      }

      mutationInProgress.current = true;
      setMutating(true);

      try {
        const result = await operation();

        // Refetch server-authoritative stock, batches,
        // and movements after a successful mutation.
        try {
          await refresh();
        } catch {
          // The mutation succeeded, but refreshing failed.
          // The error state is available for retry.
        }

        return result;
      } finally {
        mutationInProgress.current = false;

        if (mounted.current) {
          setMutating(false);
        }
      }
    },
    [refresh],
  );

  const createIngredient = useCallback(
    (payload: CreateIngredientPayload) =>
      runMutation(() => ingredientsService.create(payload)),
    [runMutation],
  );

  const updateIngredient = useCallback(
    (id: string, payload: UpdateIngredientPayload) =>
      runMutation(() => ingredientsService.update(id, payload)),
    [runMutation],
  );

  const adjustStock = useCallback(
    (ingredientId: string, payload: StockAdjustmentPayload) =>
      runMutation(() => stockService.adjust(ingredientId, payload)),
    [runMutation],
  );

  const items = useMemo(
    () =>
      ingredients.map(
        ({
          stock: _stock,
          expiresInDays: _expiry,
          _id: _mongoId,
          createdAt: _createdAt,
          updatedAt: _updatedAt,
          ...item
        }) => {
          void _stock;
          void _expiry;
          void _mongoId;
          void _createdAt;
          void _updatedAt;
          return item;
        },
      ),
    [ingredients],
  );

  const ingredientMap = useMemo(
    () => new Map(ingredients.map((ingredient) => [ingredient.id, ingredient])),
    [ingredients],
  );

  return {
    ingredients,
    items,
    batches,
    movements,
    ingredientMap,

    loading,
    refreshing,
    mutating,
    error,

    refresh,
    createIngredient,
    updateIngredient,
    adjustStock,
  };
}
