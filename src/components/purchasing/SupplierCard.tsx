import dayjs from "dayjs";
import { Mail, Truck } from "lucide-react";

import type { Supplier } from "@/types/purchasing";
import { formatCurrency } from "@/utils/dashboard";

interface SupplierCardProps {
  supplier: Supplier;
}

function SupplierCard({ supplier }: SupplierCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <Truck className="size-5" />
        </div>

        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
          {supplier.leadTimeDays} day
          {supplier.leadTimeDays !== 1 ? "s" : ""} lead time
        </span>
      </div>

      <h3 className="mt-4 font-semibold text-slate-900">{supplier.name}</h3>

      <p className="mt-2 flex items-center gap-2 truncate text-xs text-slate-500">
        <Mail className="size-3.5" />
        {supplier.contactEmail}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs text-slate-500">Minimum order</p>
          <p className="mt-1 font-semibold text-slate-800">
            {formatCurrency(supplier.minimumOrderValue)}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Expected if ordered today</p>
          <p className="mt-1 font-semibold text-slate-800">
            {dayjs().add(supplier.leadTimeDays, "day").format("DD MMM")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SupplierCard;
