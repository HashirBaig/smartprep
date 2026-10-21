import { ShoppingBasket } from "lucide-react";

function PurchaseHeader() {
  return (
    <header>
      <p className="mb-1 flex items-center gap-2 text-sm font-medium text-emerald-700">
        <ShoppingBasket className="size-4" />
        Procurement Management
      </p>

      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
        Purchase Planning
      </h1>

      <p className="mt-2 max-w-2xl text-sm text-slate-500">
        Convert predicted ingredient demand into supplier purchase orders, track
        deliveries, and update your inventory when stock arrives.
      </p>
    </header>
  );
}

export default PurchaseHeader;
