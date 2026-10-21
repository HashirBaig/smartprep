import { Bell, Search } from "lucide-react";
import { RESTAURANT_NAME } from "@/constants/dashboard";

interface DashboardHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
}

function DashboardHeader({ search, onSearchChange }: DashboardHeaderProps) {
  return (
    <header className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="mb-1 text-sm font-medium text-emerald-700">
          {RESTAURANT_NAME}
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Predict demand, manage stock, reduce waste.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative min-w-0 flex-1 lg:w-72 lg:flex-none">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />

          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search ingredients..."
            aria-label="Search ingredients"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pr-3 pl-10 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <button
          type="button"
          disabled
          title="Notifications coming soon"
          aria-label="Notifications coming soon"
          className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 disabled:opacity-60"
        >
          <Bell className="size-5" />
        </button>

        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800">
          RG
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
