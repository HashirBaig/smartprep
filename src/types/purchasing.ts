import type { IngredientUnit } from "@/types/dashboard";

export interface Supplier {
  id: string;
  name: string;
  contactEmail: string;
  leadTimeDays: number;
  minimumOrderValue: number;
}

export interface SupplierProduct {
  id: string;
  supplierId: string;
  ingredientId: string;
  pricePerUnit: number;
  minimumQuantity: number;
  packSize: number;
  unit: IngredientUnit;
}

export type PurchaseOrderStatus =
  | "draft"
  | "ordered"
  | "received"
  | "cancelled";

export interface PurchaseOrderLine {
  id: string;
  ingredientId: string;
  supplierProductId: string;
  quantity: number;
  unitPrice: number;
  unit: IngredientUnit;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  createdAt: string;
  expectedDeliveryDate: string;
  orderedAt: string | null;
  receivedAt: string | null;
  lines: PurchaseOrderLine[];
}

export interface PurchaseSuggestion {
  ingredientId: string;
  ingredientName: string;
  emoji: string;
  supplierId: string;
  supplierProductId: string;
  forecastDemand: number;
  currentStock: number;
  pendingQuantity: number;
  suggestedQuantity: number;
  unit: IngredientUnit;
  unitPrice: number;
  estimatedCost: number;
}

export interface DeliveryLine {
  orderLineId: string;
  quantity: number;
  expiryDate: string | null;
}
