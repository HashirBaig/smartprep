import { useMemo, useState } from "react";
import dayjs from "dayjs";

import { DEFAULT_FORECAST_SETTINGS } from "@/constants/forecasting";

import { generateMockSales, mockRecipes } from "@/data/mockForecasting";

import { useInventoryData } from "@/hooks/useInventoryData";
import { buildForecast } from "@/utils/forecasting";

import type { ForecastSettings } from "@/types/forecasting";

export function useForecastData() {
  const {
    ingredients,
    loading: inventoryLoading,
    error: inventoryError,
    refresh: refreshInventory,
  } = useInventoryData();

  const [settings, setSettings] = useState<ForecastSettings>(
    DEFAULT_FORECAST_SETTINGS,
  );

  // Lock the date for this mounted page/session.
  const [referenceDate] = useState(() => dayjs().startOf("day"));

  const sales = useMemo(
    () => generateMockSales(referenceDate),
    [referenceDate],
  );

  const result = useMemo(
    () =>
      buildForecast(sales, mockRecipes, ingredients, settings, referenceDate),
    [sales, ingredients, settings, referenceDate],
  );

  return {
    ingredients,
    recipes: mockRecipes,
    sales,
    settings,
    setSettings,
    referenceDate,
    inventoryLoading,
    inventoryError,
    refreshInventory,
    ...result,
  };
}
