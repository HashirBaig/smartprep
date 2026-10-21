import {
  EXPIRY_WARNING_DAYS,
  HIGH_RISK_EXPIRY_DAYS,
  PURCHASE_SAFETY_BUFFER,
} from "@/constants/dashboard";

import type {
  Ingredient,
  IngredientForecast,
  PurchaseRecommendation,
} from "@/types/dashboard";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-NL", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function formatQuantity(value: number): string {
  return new Intl.NumberFormat("en-NL", {
    maximumFractionDigits: 1,
  }).format(value);
}

export function getStockStatus(ingredient: Ingredient) {
  return ingredient.stock < ingredient.minimumStock ? "low" : "good";
}

export function getExpiryRisk(ingredient: Ingredient) {
  if (ingredient.expiresInDays === null) return "none";

  if (ingredient.expiresInDays <= HIGH_RISK_EXPIRY_DAYS) {
    return "high";
  }

  if (ingredient.expiresInDays <= EXPIRY_WARNING_DAYS) {
    return "medium";
  }

  return "none";
}

export function getWeeklyDemand(forecast: IngredientForecast): number {
  return forecast.dailyDemand.reduce((sum, day) => sum + day.quantity, 0);
}

export function getPurchaseRecommendations(
  ingredients: Ingredient[],
  forecasts: IngredientForecast[],
): PurchaseRecommendation[] {
  return forecasts
    .map((forecast) => {
      const ingredient = ingredients.find(
        (item) => item.id === forecast.ingredientId,
      );

      if (!ingredient) return null;

      const weeklyDemand = getWeeklyDemand(forecast);

      const targetStock = weeklyDemand * (1 + PURCHASE_SAFETY_BUFFER);

      const requiredQuantity = Math.max(0, targetStock - ingredient.stock);

      const quantity =
        ingredient.unit === "pcs"
          ? Math.ceil(requiredQuantity)
          : Math.ceil(requiredQuantity * 10) / 10;

      if (quantity <= 0) return null;

      return {
        ingredient,
        quantity,
        estimatedCost: quantity * ingredient.unitCost,
      };
    })
    .filter((item): item is PurchaseRecommendation => item !== null)
    .sort((a, b) => b.estimatedCost - a.estimatedCost);
}
