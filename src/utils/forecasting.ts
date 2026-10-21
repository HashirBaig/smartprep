import dayjs from "dayjs";

import {
  FORECAST_DAYS,
  FORECAST_WEIGHTS,
  MAX_TREND_FACTOR,
  MIN_TREND_FACTOR,
} from "@/constants/forecasting";

import type { Ingredient } from "@/types/dashboard";

import type {
  DailyDishForecast,
  DishSale,
  ForecastResult,
  ForecastSettings,
  IngredientDemand,
  MenuRecipe,
} from "@/types/forecasting";

const round = (value: number) => Math.round(value * 1_000_000) / 1_000_000;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function getDishSalesTotal(sales: DishSale[], recipeId: string): number {
  return sales
    .filter((item) => item.recipeId === recipeId)
    .reduce((sum, item) => sum + item.quantity, 0);
}

export function getRecipeFoodCost(
  recipe: MenuRecipe,
  ingredients: Ingredient[],
): number {
  return recipe.ingredients.reduce((total, entry) => {
    const ingredient = ingredients.find(
      (item) => item.id === entry.ingredientId,
    );

    return total + entry.quantity * (ingredient?.unitCost ?? 0);
  }, 0);
}

function getTrendFactor(recipeSales: DishSale[]): number {
  const sorted = [...recipeSales].sort((a, b) => a.date.localeCompare(b.date));

  const recent = sorted.slice(-7);
  const previous = sorted.slice(-14, -7);

  if (recent.length < 7 || previous.length < 7) {
    return 1;
  }

  const recentTotal = recent.reduce((sum, item) => sum + item.quantity, 0);

  const previousTotal = previous.reduce((sum, item) => sum + item.quantity, 0);

  if (previousTotal <= 0) return 1;

  return clamp(recentTotal / previousTotal, MIN_TREND_FACTOR, MAX_TREND_FACTOR);
}

/**
 * Forecast daily sales by matching the weekday
 * against historical observations.
 *
 * Most recent matching weekday receives the
 * greatest weight.
 */
export function forecastDishSales(
  sales: DishSale[],
  recipes: MenuRecipe[],
  settings: ForecastSettings,
  referenceDate = dayjs(),
): DailyDishForecast[] {
  const results: DailyDishForecast[] = [];

  for (const recipe of recipes) {
    const recipeSales = sales
      .filter((item) => item.recipeId === recipe.id)
      .sort((a, b) => a.date.localeCompare(b.date));

    const trendFactor = settings.useTrend ? getTrendFactor(recipeSales) : 1;

    const overallMean =
      recipeSales.length > 0
        ? recipeSales.reduce((sum, item) => sum + item.quantity, 0) /
          recipeSales.length
        : 0;

    for (let offset = 0; offset < FORECAST_DAYS; offset++) {
      const target = referenceDate.add(offset, "day");
      const targetWeekday = target.day();

      const matchingDays = recipeSales
        .filter((item) => dayjs(item.date).day() === targetWeekday)
        .slice(-FORECAST_WEIGHTS.length);

      let baseline = overallMean;

      if (matchingDays.length > 0) {
        const weights = FORECAST_WEIGHTS.slice(-matchingDays.length);

        const weightedSum = matchingDays.reduce(
          (sum, item, index) => sum + item.quantity * weights[index],
          0,
        );

        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

        baseline = weightedSum / totalWeight;
      }

      results.push({
        date: target.format("YYYY-MM-DD"),
        recipeId: recipe.id,
        baseline: round(baseline),
        trendFactor: round(trendFactor),
        quantity: Math.max(0, Math.round(baseline * trendFactor)),
      });
    }
  }

  return results;
}

/**
 * Convert forecast portions into ingredient usage
 * and compare with current inventory.
 */
export function calculateIngredientDemand(
  dishForecasts: DailyDishForecast[],
  recipes: MenuRecipe[],
  ingredients: Ingredient[],
  settings: ForecastSettings,
  referenceDate = dayjs(),
): IngredientDemand[] {
  const recipeMap = new Map(recipes.map((recipe) => [recipe.id, recipe]));

  const ingredientMap = new Map(
    ingredients.map((ingredient) => [ingredient.id, ingredient]),
  );

  const demandByIngredient = new Map<string, Map<string, number>>();

  for (const forecast of dishForecasts) {
    const recipe = recipeMap.get(forecast.recipeId);

    if (!recipe) continue;

    for (const entry of recipe.ingredients) {
      if (!ingredientMap.has(entry.ingredientId)) continue;

      if (!demandByIngredient.has(entry.ingredientId)) {
        demandByIngredient.set(entry.ingredientId, new Map());
      }

      const daily = demandByIngredient.get(entry.ingredientId)!;

      daily.set(
        forecast.date,
        (daily.get(forecast.date) ?? 0) + forecast.quantity * entry.quantity,
      );
    }
  }

  const result: IngredientDemand[] = [];

  for (const [ingredientId, dailyMap] of demandByIngredient) {
    const ingredient = ingredientMap.get(ingredientId);

    if (!ingredient) continue;

    const dailyDemand = Array.from({ length: FORECAST_DAYS }, (_, index) => {
      const date = referenceDate.add(index, "day").format("YYYY-MM-DD");

      return {
        date,
        quantity: round(dailyMap.get(date) ?? 0),
      };
    });

    const totalDemand = round(
      dailyDemand.reduce((sum, item) => sum + item.quantity, 0),
    );

    const targetStock = totalDemand * (1 + settings.safetyBufferPercent / 100);

    const shortage = Math.max(0, targetStock - ingredient.stock);

    const recommendedOrder =
      ingredient.unit === "pcs"
        ? Math.ceil(shortage - 0.000001)
        : Math.ceil((shortage - 0.000001) * 1000) / 1000;

    result.push({
      ingredientId,
      unit: ingredient.unit,
      currentStock: ingredient.stock,
      dailyDemand,
      totalDemand,
      recommendedOrder,
      estimatedCost: round(recommendedOrder * ingredient.unitCost),
    });
  }

  return result.sort((a, b) => b.estimatedCost - a.estimatedCost);
}

export function buildForecast(
  sales: DishSale[],
  recipes: MenuRecipe[],
  ingredients: Ingredient[],
  settings: ForecastSettings,
  referenceDate = dayjs(),
): ForecastResult {
  const dishForecasts = forecastDishSales(
    sales,
    recipes,
    settings,
    referenceDate,
  );

  const ingredientDemands = calculateIngredientDemand(
    dishForecasts,
    recipes,
    ingredients,
    settings,
    referenceDate,
  );

  return {
    dishForecasts,
    ingredientDemands,
    totalForecastPortions: dishForecasts.reduce(
      (sum, item) => sum + item.quantity,
      0,
    ),
    estimatedPurchaseCost: round(
      ingredientDemands.reduce((sum, item) => sum + item.estimatedCost, 0),
    ),
  };
}
