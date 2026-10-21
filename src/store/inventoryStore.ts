import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import dayjs from "dayjs";

import { mockDashboard } from "@/data/mockDashboard";
import { INVENTORY_STORAGE_KEY } from "@/constants/inventory";

import type {
  IngredientInput,
  InventoryItem,
  StockAdjustmentInput,
  StockBatch,
  StockMovement,
} from "@/types/inventory";

import { getIngredientStock } from "@/utils/inventory";

interface InventoryState {
  items: InventoryItem[];
  batches: StockBatch[];
  movements: StockMovement[];

  addIngredient: (input: IngredientInput) => string;
  updateIngredient: (id: string, input: IngredientInput) => void;

  adjustStock: (input: StockAdjustmentInput) => string | null;
}

const createId = () => crypto.randomUUID();

const initialItems: InventoryItem[] = mockDashboard.ingredients.map(
  ({ stock: _stock, expiresInDays: _expiresInDays, ...item }) => {
    void _stock;
    void _expiresInDays;
    return item;
  },
);

const initialBatches: StockBatch[] = mockDashboard.ingredients
  .filter((ingredient) => ingredient.stock > 0)
  .map((ingredient) => ({
    id: createId(),
    ingredientId: ingredient.id,
    quantity: ingredient.stock,
    expiryDate:
      ingredient.expiresInDays === null
        ? null
        : dayjs().add(ingredient.expiresInDays, "day").format("YYYY-MM-DD"),
    receivedAt: new Date().toISOString(),
  }));

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: initialItems,
      batches: initialBatches,
      movements: [],

      addIngredient: (input) => {
        const id = createId();

        set((state) => ({
          items: [
            ...state.items,
            {
              ...input,
              id,
            },
          ],
        }));

        return id;
      },

      updateIngredient: (id, input) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...input, id } : item,
          ),
        }));
      },

      adjustStock: (input) => {
        const { ingredientId, type, quantity, expiryDate, note } = input;

        const state = get();

        const ingredient = state.items.find((item) => item.id === ingredientId);

        if (!ingredient) {
          return "Ingredient not found.";
        }

        if (!Number.isFinite(quantity) || quantity <= 0) {
          return "Quantity must be greater than zero.";
        }

        if (ingredient.unit === "pcs" && !Number.isInteger(quantity)) {
          return "Piece quantities must be whole numbers.";
        }

        const isIncoming = type === "receive" || type === "adjust-in";

        const movementType =
          type === "receive"
            ? "received"
            : type === "use"
              ? "used"
              : type === "waste"
                ? "wasted"
                : "adjusted";

        const now = new Date().toISOString();

        // Incoming stock creates a new batch.
        if (isIncoming) {
          if (expiryDate && !dayjs(expiryDate).isValid()) {
            return "Invalid expiry date.";
          }

          if (
            expiryDate &&
            dayjs(expiryDate).startOf("day").isBefore(dayjs().startOf("day"))
          ) {
            return "Expiry date cannot be in the past.";
          }

          const batchId = createId();

          const batch: StockBatch = {
            id: batchId,
            ingredientId,
            quantity,
            expiryDate: expiryDate || null,
            receivedAt: now,
          };

          const movement: StockMovement = {
            id: createId(),
            ingredientId,
            batchId,
            type: movementType,
            quantity,
            note,
            createdAt: now,
          };

          set((current) => ({
            batches: [...current.batches, batch],
            movements: [movement, ...current.movements],
          }));

          return null;
        }

        // Outgoing stock must not exceed available stock.
        const available = getIngredientStock(ingredientId, state.batches);

        if (quantity > available + 0.000001) {
          return `Insufficient stock. Available: ${available} ${ingredient.unit}.`;
        }

        // Consume the batches expiring first (FEFO).
        const eligibleBatches = state.batches
          .filter(
            (batch) =>
              batch.ingredientId === ingredientId && batch.quantity > 0,
          )
          .sort((a, b) => {
            const expiryA = a.expiryDate ?? "9999-12-31";
            const expiryB = b.expiryDate ?? "9999-12-31";

            return (
              expiryA.localeCompare(expiryB) ||
              a.receivedAt.localeCompare(b.receivedAt)
            );
          });

        let remaining = quantity;
        const deductions = new Map<string, number>();
        const newMovements: StockMovement[] = [];

        for (const batch of eligibleBatches) {
          if (remaining <= 0.000001) break;

          const deducted = Math.min(remaining, batch.quantity);

          deductions.set(batch.id, deducted);

          newMovements.push({
            id: createId(),
            ingredientId,
            batchId: batch.id,
            type: movementType,
            quantity: -deducted,
            note,
            createdAt: now,
          });

          remaining -= deducted;
        }

        set((current) => ({
          batches: current.batches.map((batch) => {
            const deduction = deductions.get(batch.id) ?? 0;

            if (deduction === 0) return batch;

            return {
              ...batch,
              quantity: Math.max(
                0,
                Math.round((batch.quantity - deduction) * 1000000) / 1000000,
              ),
            };
          }),
          movements: [...newMovements, ...current.movements],
        }));

        return null;
      },
    }),
    {
      name: INVENTORY_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        batches: state.batches,
        movements: state.movements,
      }),
    },
  ),
);
