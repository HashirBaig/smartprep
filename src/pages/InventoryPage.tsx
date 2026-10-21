import { useMemo, useState } from "react";

import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

import { toast } from "sonner";

import InventoryHeader from "@/components/inventory/InventoryHeader";

import InventoryStats from "@/components/inventory/InventoryStats";

import InventoryTable from "@/components/inventory/InventoryTable";

import IngredientDialog from "@/components/inventory/IngredientDialog";

import StockDialog from "@/components/inventory/StockDialog";

import MovementHistory from "@/components/inventory/MovementHistory";

import ExpiryPanel from "@/components/inventory/ExpiryPanel";

import { useInventoryData } from "@/hooks/useInventoryData";

import { getApiErrorMessage } from "@/utils/apiError";

import type { Ingredient } from "@/types/dashboard";

import type { IngredientInput } from "@/types/inventory";

function InventoryPage() {
  const {
    items,
    ingredients,
    batches,
    movements,

    loading,
    refreshing,
    error,

    refresh,
    createIngredient,
    updateIngredient,
    adjustStock,
  } = useInventoryData();

  const [search, setSearch] = useState("");

  const [showIngredientDialog, setShowIngredientDialog] = useState(false);

  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null,
  );

  const [adjustingIngredient, setAdjustingIngredient] =
    useState<Ingredient | null>(null);

  const filteredIngredients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return ingredients;

    return ingredients.filter(
      (ingredient) =>
        ingredient.name.toLowerCase().includes(query) ||
        ingredient.category.toLowerCase().includes(query),
    );
  }, [ingredients, search]);

  function handleAddIngredient() {
    setEditingIngredient(null);
    setShowIngredientDialog(true);
  }

  function handleEditIngredient(ingredient: Ingredient) {
    setEditingIngredient(ingredient);
    setShowIngredientDialog(true);
  }

  async function handleSaveIngredient(payload: IngredientInput) {
    if (editingIngredient) {
      await updateIngredient(editingIngredient.id, payload);
    } else {
      await createIngredient(payload);
    }
  }

  async function handleRefresh() {
    try {
      await refresh();
      toast.success("Inventory refreshed.");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  if (loading && ingredients.length === 0) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-emerald-700" />

        <p className="text-sm text-slate-500">
          Loading inventory from MongoDB...
        </p>
      </div>
    );
  }

  if (error && ingredients.length === 0) {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-md flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-red-50 p-4">
          <AlertCircle className="size-7 text-red-600" />
        </div>

        <h2 className="text-xl font-semibold text-slate-900">
          Unable to load inventory
        </h2>

        <p className="mt-2 text-sm text-slate-500">{error}</p>

        <button
          type="button"
          onClick={() => void handleRefresh()}
          className="mt-5 flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white"
        >
          <RefreshCw className="size-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-400 space-y-6">
      <InventoryHeader
        search={search}
        onSearchChange={setSearch}
        onAddIngredient={handleAddIngredient}
        onRefresh={() => void handleRefresh()}
        refreshing={refreshing}
      />

      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          <AlertCircle className="size-5 shrink-0" />
          <span>Could not refresh inventory: {error}</span>
        </div>
      )}

      <InventoryStats ingredients={ingredients} />

      <InventoryTable
        ingredients={filteredIngredients}
        onEdit={handleEditIngredient}
        onAdjust={setAdjustingIngredient}
      />

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
        <MovementHistory movements={movements} ingredients={items} />

        <ExpiryPanel batches={batches} ingredients={items} />
      </div>

      <footer className="pt-4 text-center text-xs text-slate-400">
        SmartPrep · Inventory Management · MongoDB
      </footer>

      {showIngredientDialog && (
        <IngredientDialog
          ingredient={editingIngredient}
          onSubmit={handleSaveIngredient}
          onClose={() => {
            setShowIngredientDialog(false);
            setEditingIngredient(null);
          }}
        />
      )}

      {adjustingIngredient && (
        <StockDialog
          ingredient={
            ingredients.find((item) => item.id === adjustingIngredient.id) ??
            adjustingIngredient
          }
          onSubmit={adjustStock}
          onClose={() => setAdjustingIngredient(null)}
        />
      )}
    </div>
  );
}

export default InventoryPage;
