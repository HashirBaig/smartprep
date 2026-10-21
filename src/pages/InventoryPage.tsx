import { useState } from "react";

import InventoryHeader from "@/components/inventory/InventoryHeader";
import InventoryStats from "@/components/inventory/InventoryStats";
import InventoryTable from "@/components/inventory/InventoryTable";
import IngredientDialog from "@/components/inventory/IngredientDialog";
import StockDialog from "@/components/inventory/StockDialog";
import MovementHistory from "@/components/inventory/MovementHistory";
import ExpiryPanel from "@/components/inventory/ExpiryPanel";

import { useInventoryData } from "@/hooks/useInventoryData";

import type { Ingredient } from "@/types/dashboard";

function InventoryPage() {
  const { items, batches, movements, ingredients } = useInventoryData();

  const [search, setSearch] = useState("");

  const [showIngredientDialog, setShowIngredientDialog] = useState(false);

  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null,
  );

  const [adjustingIngredient, setAdjustingIngredient] =
    useState<Ingredient | null>(null);

  const filteredIngredients = ingredients.filter((ingredient) => {
    const query = search.trim().toLowerCase();

    return (
      ingredient.name.toLowerCase().includes(query) ||
      ingredient.category.toLowerCase().includes(query)
    );
  });

  function handleAddIngredient() {
    setEditingIngredient(null);
    setShowIngredientDialog(true);
  }

  function handleEditIngredient(ingredient: Ingredient) {
    setEditingIngredient(ingredient);
    setShowIngredientDialog(true);
  }

  return (
    <div className="mx-auto max-w-400 space-y-6">
      <InventoryHeader
        search={search}
        onSearchChange={setSearch}
        onAddIngredient={handleAddIngredient}
      />

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
        SmartPrep · Inventory Management · Local Demo Data
      </footer>

      {showIngredientDialog && (
        <IngredientDialog
          ingredient={editingIngredient}
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
          onClose={() => setAdjustingIngredient(null)}
        />
      )}
    </div>
  );
}

export default InventoryPage;
