export type IngredientUnit = "pcs" | "kg" | "L";

export type IngredientCategory =
  | "Bakery"
  | "Meat"
  | "Vegetables"
  | "Dairy"
  | "Pantry";

export interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  category: IngredientCategory;
  stock: number;
  minimumStock: number;
  unit: IngredientUnit;
  unitCost: number;
  expiresInDays: number | null;
}

export interface DailyDemand {
  day: string;
  quantity: number;
}

export interface IngredientForecast {
  ingredientId: string;
  dailyDemand: DailyDemand[];
  changePercent: number;
}

export type InsightTone = "success" | "warning" | "info";

export interface DashboardInsight {
  id: string;
  title: string;
  description: string;
  tone: InsightTone;
}

export interface PurchaseRecommendation {
  ingredient: Ingredient;
  quantity: number;
  estimatedCost: number;
}

export interface DashboardData {
  ingredients: Ingredient[];
  forecasts: IngredientForecast[];
  insights: DashboardInsight[];
}
