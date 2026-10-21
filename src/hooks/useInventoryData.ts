import { useMemo } from "react";

import { useInventoryStore } from "@/store/inventoryStore";
import { getInventoryIngredients } from "@/utils/inventory";

export function useInventoryData() {
  const items = useInventoryStore((state) => state.items);
  const batches = useInventoryStore((state) => state.batches);
  const movements = useInventoryStore((state) => state.movements);

  const ingredients = useMemo(
    () => getInventoryIngredients(items, batches),
    [items, batches],
  );

  const ingredientMap = useMemo(
    () => new Map(ingredients.map((item) => [item.id, item])),
    [ingredients],
  );

  return {
    items,
    batches,
    movements,
    ingredients,
    ingredientMap,
  };
}
