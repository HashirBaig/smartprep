import api from "@/lib/axios";

import type { ApiSupplier, ApiSupplierProduct } from "@/types/api";

export const suppliersService = {
  /**
   * Retrieve all suppliers.
   */
  getAll: async (): Promise<ApiSupplier[]> => {
    const { data } = await api.get<ApiSupplier[]>("/suppliers");

    return data;
  },

  /**
   * Retrieve all supplier products.
   */
  getProducts: async (): Promise<ApiSupplierProduct[]> => {
    const { data } = await api.get<ApiSupplierProduct[]>("/supplier-products");

    return data;
  },

  /**
   * Retrieve supplier products and filter locally.
   * The current API does not have a supplier-specific route.
   */
  getProductsBySupplier: async (
    supplierId: string,
  ): Promise<ApiSupplierProduct[]> => {
    const products = await suppliersService.getProducts();

    return products.filter((product) => product.supplierId === supplierId);
  },

  /**
   * Find the catalog products available for
   * a specific ingredient.
   */
  getProductsByIngredient: async (
    ingredientId: string,
  ): Promise<ApiSupplierProduct[]> => {
    const products = await suppliersService.getProducts();

    return products.filter((product) => product.ingredientId === ingredientId);
  },
};
