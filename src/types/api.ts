import type { Ingredient } from "@/types/dashboard";

import type {
  IngredientInput,
  StockBatch,
  StockMovement,
  StockAdjustmentInput,
} from "@/types/inventory";

import type {
  PurchaseOrder,
  Supplier,
  SupplierProduct,
} from "@/types/purchasing";

// MongoDB API responses may include additional
// Mongoose metadata such as _id.
export interface MongoDocument {
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ApiIngredient = Ingredient & MongoDocument;

export type ApiStockBatch = StockBatch & MongoDocument;

export type ApiStockMovement = StockMovement &
  MongoDocument & {
    purchaseOrderId?: string;
    purchaseOrderLineId?: string;
  };

export type ApiSupplier = Supplier & MongoDocument;

export type ApiSupplierProduct = SupplierProduct & MongoDocument;

export type ApiPurchaseOrder = PurchaseOrder & MongoDocument;

export type CreateIngredientPayload = IngredientInput;

export type UpdateIngredientPayload = IngredientInput;

export type StockAdjustmentPayload = Omit<StockAdjustmentInput, "ingredientId">;

export interface StockAdjustmentResponse {
  message: string;
}

export interface CreatePurchaseOrderLinePayload {
  supplierProductId: string;
  quantity: number;
}

export interface CreatePurchaseOrderPayload {
  supplierId: string;
  lines: CreatePurchaseOrderLinePayload[];
}

export interface UpdatePurchaseOrderStatusPayload {
  status: "ordered" | "cancelled";
}

export interface ReceivePurchaseOrderLinePayload {
  orderLineId: string;
  quantity: number;
  expiryDate: string | null;
}

export interface ReceivePurchaseOrderPayload {
  lines: ReceivePurchaseOrderLinePayload[];
}

export interface HealthCheckResponse {
  status: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}
