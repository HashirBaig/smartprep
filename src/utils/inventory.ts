import dayjs from "dayjs";

import type { Ingredient } from "@/types/dashboard";
import type { InventoryItem, StockBatch } from "@/types/inventory";

export function getIngredientStock(
  ingredientId: string,
  batches: StockBatch[],
): number {
  return batches
    .filter((batch) => batch.ingredientId === ingredientId)
    .reduce((sum, batch) => sum + batch.quantity, 0);
}

export function getDaysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null;

  return dayjs(expiryDate).startOf("day").diff(dayjs().startOf("day"), "day");
}

export function getInventoryIngredients(
  items: InventoryItem[],
  batches: StockBatch[],
): Ingredient[] {
  return items.map((item) => {
    const activeBatches = batches.filter(
      (batch) => batch.ingredientId === item.id && batch.quantity > 0,
    );

    const daysToExpiry = activeBatches
      .map((batch) => getDaysUntilExpiry(batch.expiryDate))
      .filter((days): days is number => days !== null);

    return {
      ...item,
      stock: getIngredientStock(item.id, batches),
      expiresInDays: daysToExpiry.length > 0 ? Math.min(...daysToExpiry) : null,
    };
  });
}

export function getExpiryLabel(expiryDate: string | null): string {
  const days = getDaysUntilExpiry(expiryDate);

  if (days === null) return "No expiry";
  if (days < 0) return "Expired";
  if (days === 0) return "Expires today";
  if (days === 1) return "1 day left";

  return `${days} days left`;
}

export function getBatchStatus(expiryDate: string | null) {
  const days = getDaysUntilExpiry(expiryDate);

  if (days === null) return "good";
  if (days <= 0) return "expired";
  if (days <= 3) return "high";
  if (days <= 7) return "medium";

  return "good";
}
