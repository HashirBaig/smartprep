import { useMemo } from "react";

import { useForecastData } from "@/hooks/useForecastData";

import { usePurchaseStore } from "@/store/purchaseStore";

import { mockSuppliers, mockSupplierProducts } from "@/data/mockSuppliers";

import {
  buildPurchaseSuggestions,
  groupSuggestionsBySupplier,
} from "@/utils/purchasing";

export function usePurchasePlanning() {
  const forecast = useForecastData();

  const orders = usePurchaseStore((state) => state.orders);

  const suggestions = useMemo(
    () =>
      buildPurchaseSuggestions(
        forecast.ingredientDemands,
        forecast.ingredients,
        mockSupplierProducts,
        orders,
      ),
    [forecast.ingredientDemands, forecast.ingredients, orders],
  );

  const supplierGroups = useMemo(
    () => groupSuggestionsBySupplier(suggestions, mockSuppliers),
    [suggestions],
  );

  const plannedCost = suggestions.reduce(
    (sum, item) => sum + item.estimatedCost,
    0,
  );

  return {
    ...forecast,
    suppliers: mockSuppliers,
    supplierProducts: mockSupplierProducts,
    orders,
    suggestions,
    supplierGroups,
    plannedCost,
  };
}
