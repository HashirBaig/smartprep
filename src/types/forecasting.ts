import type { IngredientUnit } from "@/types/dashboard";

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
}

export interface MenuRecipe {
  id: string;
  name: string;
  emoji: string;
  sellingPrice: number;
  ingredients: RecipeIngredient[];
}

export interface DishSale {
  date: string;
  recipeId: string;
  quantity: number;
}

export interface DailyDishForecast {
  date: string;
  recipeId: string;
  quantity: number;
  baseline: number;
  trendFactor: number;
}

export interface IngredientDemand {
  ingredientId: string;
  unit: IngredientUnit;
  currentStock: number;
  dailyDemand: {
    date: string;
    quantity: number;
  }[];
  totalDemand: number;
  recommendedOrder: number;
  estimatedCost: number;
}

export interface ForecastSettings {
  safetyBufferPercent: number;
  useTrend: boolean;
}

export interface ForecastResult {
  dishForecasts: DailyDishForecast[];
  ingredientDemands: IngredientDemand[];
  totalForecastPortions: number;
  estimatedPurchaseCost: number;
}
