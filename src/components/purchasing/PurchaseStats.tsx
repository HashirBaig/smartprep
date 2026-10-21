import { ClipboardList, PackageCheck, ShoppingCart, Truck } from "lucide-react";

import StatCard from "@/components/dashboard/StatCard";

import type { PurchaseOrder, PurchaseSuggestion } from "@/types/purchasing";

import { formatCurrency } from "@/utils/dashboard";

interface PurchaseStatsProps {
  orders: PurchaseOrder[];
  suggestions: PurchaseSuggestion[];
  plannedCost: number;
}

function PurchaseStats({
  orders,
  suggestions,
  plannedCost,
}: PurchaseStatsProps) {
  const activeOrders = orders.filter((order) => order.status === "ordered");

  const drafts = orders.filter((order) => order.status === "draft");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Suggested Items"
        value={suggestions.length}
        description="Items needing a purchase plan"
        icon={ShoppingCart}
        tone="green"
      />

      <StatCard
        title="Planned Cost"
        value={formatCurrency(plannedCost)}
        description="Estimated new purchase requirements"
        icon={ClipboardList}
        tone="blue"
      />

      <StatCard
        title="Draft Orders"
        value={drafts.length}
        description="Awaiting confirmation"
        icon={PackageCheck}
        tone="amber"
      />

      <StatCard
        title="Awaiting Delivery"
        value={activeOrders.length}
        description="Supplier orders not yet received"
        icon={Truck}
        tone="red"
      />
    </div>
  );
}

export default PurchaseStats;
