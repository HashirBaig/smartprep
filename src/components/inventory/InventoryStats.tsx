import { AlertTriangle, Boxes, CircleDollarSign, Clock3 } from "lucide-react";

import StatCard from "@/components/dashboard/StatCard";
import type { Ingredient } from "@/types/dashboard";
import { formatCurrency } from "@/utils/dashboard";

interface InventoryStatsProps {
  ingredients: Ingredient[];
}

function InventoryStats({ ingredients }: InventoryStatsProps) {
  const lowStock = ingredients.filter(
    (item) => item.stock < item.minimumStock,
  ).length;

  const expiring = ingredients.filter(
    (item) => item.expiresInDays !== null && item.expiresInDays <= 7,
  ).length;

  const stockValue = ingredients.reduce(
    (sum, item) => sum + item.stock * item.unitCost,
    0,
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total Ingredients"
        value={ingredients.length}
        description="Registered inventory items"
        icon={Boxes}
        tone="green"
      />

      <StatCard
        title="Low Stock"
        value={lowStock}
        description="Below minimum threshold"
        icon={AlertTriangle}
        tone="amber"
      />

      <StatCard
        title="Inventory Value"
        value={formatCurrency(stockValue)}
        description="Estimated value of on-hand stock"
        icon={CircleDollarSign}
        tone="blue"
      />

      <StatCard
        title="Expiry Alerts"
        value={expiring}
        description="Items expiring within 7 days"
        icon={Clock3}
        tone="red"
      />
    </div>
  );
}

export default InventoryStats;
