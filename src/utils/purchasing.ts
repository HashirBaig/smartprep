import dayjs from "dayjs";

import type { Ingredient } from "@/types/dashboard";
import type { IngredientDemand } from "@/types/forecasting";

import type {
  PurchaseOrder,
  PurchaseSuggestion,
  Supplier,
  SupplierProduct,
} from "@/types/purchasing";

const round = (value: number) => Math.round(value * 1_000_000) / 1_000_000;

export function calculateOrderTotal(order: PurchaseOrder): number {
  return round(
    order.lines.reduce(
      (total, line) => total + line.quantity * line.unitPrice,
      0,
    ),
  );
}

export function calculateSupplierDeliveryDate(
  leadTimeDays: number,
  from = dayjs(),
): string {
  return from.add(leadTimeDays, "day").format("YYYY-MM-DD");
}

export function roundToSupplierQuantity(
  shortage: number,
  minimumQuantity: number,
  packSize: number,
): number {
  if (shortage <= 0) return 0;

  if (packSize <= 0) {
    throw new Error("Pack size must be greater than zero.");
  }

  const required = Math.max(shortage, minimumQuantity);

  return round(Math.ceil((required - 0.000000001) / packSize) * packSize);
}

export function getPendingOrderQuantity(
  ingredientId: string,
  orders: PurchaseOrder[],
): number {
  return round(
    orders
      .filter((order) => order.status === "ordered")
      .flatMap((order) => order.lines)
      .filter((line) => line.ingredientId === ingredientId)
      .reduce((sum, line) => sum + line.quantity, 0),
  );
}

export function buildPurchaseSuggestions(
  demands: IngredientDemand[],
  ingredients: Ingredient[],
  products: SupplierProduct[],
  orders: PurchaseOrder[],
): PurchaseSuggestion[] {
  const ingredientMap = new Map(ingredients.map((item) => [item.id, item]));

  return demands.flatMap((demand) => {
    const ingredient = ingredientMap.get(demand.ingredientId);

    const product = products.find(
      (item) =>
        item.ingredientId === demand.ingredientId && item.unit === demand.unit,
    );

    if (!ingredient || !product) return [];

    const pendingQuantity = getPendingOrderQuantity(
      demand.ingredientId,
      orders,
    );

    const shortage = Math.max(0, demand.recommendedOrder - pendingQuantity);

    if (shortage <= 0) return [];

    const suggestedQuantity = roundToSupplierQuantity(
      shortage,
      product.minimumQuantity,
      product.packSize,
    );

    return [
      {
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        emoji: ingredient.emoji,
        supplierId: product.supplierId,
        supplierProductId: product.id,
        forecastDemand: demand.totalDemand,
        currentStock: ingredient.stock,
        pendingQuantity,
        suggestedQuantity,
        unit: product.unit,
        unitPrice: product.pricePerUnit,
        estimatedCost: round(suggestedQuantity * product.pricePerUnit),
      },
    ];
  });
}

export function groupSuggestionsBySupplier(
  suggestions: PurchaseSuggestion[],
  suppliers: Supplier[],
) {
  return suppliers
    .map((supplier) => ({
      supplier,
      suggestions: suggestions.filter(
        (item) => item.supplierId === supplier.id,
      ),
    }))
    .filter((group) => group.suggestions.length > 0);
}
