import { useState } from "react";

import PurchaseHeader from "@/components/purchasing/PurchaseHeader";
import PurchaseStats from "@/components/purchasing/PurchaseStats";
import SupplierCard from "@/components/purchasing/SupplierCard";
import PurchaseRecommendations from "@/components/purchasing/PurchaseRecommendations";
import PurchaseOrdersTable from "@/components/purchasing/PurchaseOrdersTable";
import ReceiveOrderDialog from "@/components/purchasing/ReceiveOrderDialog";

import { usePurchasePlanning } from "@/hooks/usePurchasePlanning";
import type { PurchaseOrder } from "@/types/purchasing";

function PurchasePlanningPage() {
  const { suppliers, orders, suggestions, supplierGroups, plannedCost } =
    usePurchasePlanning();

  const [receivingOrderId, setReceivingOrderId] = useState<string | null>(null);

  const activeReceivingOrder = orders.find(
    (order) => order.id === receivingOrderId,
  );

  return (
    <div className="mx-auto max-w-400 space-y-6">
      <PurchaseHeader />

      <PurchaseStats
        orders={orders}
        suggestions={suggestions}
        plannedCost={plannedCost}
      />

      {/* Supplier overview */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Suppliers</h2>

          <p className="mt-1 text-sm text-slate-500">
            Supplier delivery times and minimum order values.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {suppliers.map((supplier) => (
            <SupplierCard key={supplier.id} supplier={supplier} />
          ))}
        </div>
      </section>

      {/* Suggested orders */}
      <PurchaseRecommendations groups={supplierGroups} />

      {/* Purchase order history */}
      <PurchaseOrdersTable
        orders={orders}
        suppliers={suppliers}
        onReceive={(order: PurchaseOrder) => setReceivingOrderId(order.id)}
      />

      <section className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
        <strong>Planning assumptions:</strong> All recommendations are based on
        a seven-day forecast and synthetic supplier data. Delivery dates use
        calendar-day lead times. Supplier orders are recorded locally and are
        not electronically transmitted.
      </section>

      <footer className="pt-4 text-center text-xs text-slate-400">
        SmartPrep · Purchase Planning · Demo Data
      </footer>

      {activeReceivingOrder?.status === "ordered" && (
        <ReceiveOrderDialog
          order={activeReceivingOrder}
          onClose={() => setReceivingOrderId(null)}
        />
      )}
    </div>
  );
}

export default PurchasePlanningPage;
