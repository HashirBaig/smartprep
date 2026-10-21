import type { IngredientCategory, IngredientUnit } from "@/types/dashboard";

export interface InventoryItem {
  id: string;
  name: string;
  emoji: string;
  category: IngredientCategory;
  unit: IngredientUnit;
  unitCost: number;
  minimumStock: number;
}

export interface StockBatch {
  id: string;
  ingredientId: string;
  quantity: number;
  expiryDate: string | null;
  receivedAt: string;
}

export type MovementType = "received" | "used" | "wasted" | "adjusted";

export interface StockMovement {
  id: string;
  ingredientId: string;
  batchId: string | null;
  type: MovementType;
  quantity: number;
  note: string;
  createdAt: string;
}

export type IngredientInput = Omit<InventoryItem, "id">;

export interface StockAdjustmentInput {
  ingredientId: string;
  type: "receive" | "use" | "waste" | "adjust-in" | "adjust-out";
  quantity: number;
  expiryDate?: string | null;
  note: string;
}
