import dayjs from "dayjs";

import { HISTORY_DAYS, WEEKDAY_MULTIPLIERS } from "@/constants/forecasting";

import type { DishSale, MenuRecipe } from "@/types/forecasting";

export const mockRecipes: MenuRecipe[] = [
  {
    id: "classic-burger",
    name: "Classic Burger",
    emoji: "🍔",
    sellingPrice: 12.5,
    ingredients: [
      { ingredientId: "buns", quantity: 1 },
      { ingredientId: "patties", quantity: 1 },
      { ingredientId: "lettuce", quantity: 0.04 },
      { ingredientId: "tomatoes", quantity: 0.05 },
    ],
  },
  {
    id: "cheese-burger",
    name: "Cheese Burger",
    emoji: "🧀",
    sellingPrice: 14,
    ingredients: [
      { ingredientId: "buns", quantity: 1 },
      { ingredientId: "patties", quantity: 1 },
      { ingredientId: "cheese", quantity: 0.03 },
      { ingredientId: "lettuce", quantity: 0.04 },
      { ingredientId: "tomatoes", quantity: 0.05 },
    ],
  },
  {
    id: "garden-salad",
    name: "Garden Salad",
    emoji: "🥗",
    sellingPrice: 10.5,
    ingredients: [
      { ingredientId: "lettuce", quantity: 0.12 },
      { ingredientId: "tomatoes", quantity: 0.1 },
      { ingredientId: "olive-oil", quantity: 0.015 },
    ],
  },
  {
    id: "flatbread",
    name: "House Flatbread",
    emoji: "🫓",
    sellingPrice: 9.5,
    ingredients: [
      { ingredientId: "flour", quantity: 0.15 },
      { ingredientId: "cheese", quantity: 0.05 },
      { ingredientId: "olive-oil", quantity: 0.01 },
    ],
  },
];

const BASE_DAILY_SALES: Record<string, number> = {
  "classic-burger": 22,
  "cheese-burger": 16,
  "garden-salad": 12,
  flatbread: 14,
};

/**
 * Creates deterministic daily sales for the last 28
 * completed days. There is no Math.random(), so the
 * same input date always produces the same dataset.
 */
export function generateMockSales(referenceDate = dayjs()): DishSale[] {
  const sales: DishSale[] = [];

  for (let daysAgo = HISTORY_DAYS; daysAgo >= 1; daysAgo--) {
    const date = referenceDate.subtract(daysAgo, "day").format("YYYY-MM-DD");

    const weekday = dayjs(date).day();
    const weekdayFactor = WEEKDAY_MULTIPLIERS[weekday];

    const recencyFactor = 1 + ((HISTORY_DAYS - daysAgo) / HISTORY_DAYS) * 0.1;

    for (const [recipeId, baseSales] of Object.entries(BASE_DAILY_SALES)) {
      // Repeatable variation to avoid perfectly smooth data.
      const variation = Math.sin(daysAgo * 1.7 + recipeId.length * 0.6) * 2.5;

      const quantity = Math.max(
        0,
        Math.round(baseSales * weekdayFactor * recencyFactor + variation),
      );

      sales.push({
        date,
        recipeId,
        quantity,
      });
    }
  }

  return sales;
}
