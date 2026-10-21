import type { IngredientCategory, IngredientUnit } from "@/types/dashboard";

export const INGREDIENT_CATEGORIES: IngredientCategory[] = [
  "Bakery",
  "Meat",
  "Vegetables",
  "Dairy",
  "Pantry",
];

export const INGREDIENT_UNITS: IngredientUnit[] = ["pcs", "kg", "L"];

export const INVENTORY_STORAGE_KEY = "smartprep-inventory-v1";

export const MOVEMENT_LABELS = {
  received: "Stock received",
  used: "Kitchen usage",
  wasted: "Waste recorded",
  adjusted: "Stock correction",
} as const;
