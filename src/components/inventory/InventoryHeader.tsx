import { Loader2, Plus, RefreshCw, Search } from "lucide-react";

interface InventoryHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onAddIngredient: () => void;
  onRefresh: () => void;
  refreshing: boolean;
}

function InventoryHeader({
  search,
  onSearchChange,
  onAddIngredient,
  onRefresh,
  refreshing,
}: InventoryHeaderProps) {
  return (
    <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
      <div>
        <p className="mb-1 text-sm font-medium text-emerald-700">
          Stock Management
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Inventory
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Track ingredients, manage stock movements, and prevent unnecessary
          waste.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />

          <input
            type="search"
            aria-label="Search inventory"
            placeholder="Search ingredients..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-4 pl-10 text-sm outline-none focus:border-emerald-500 sm:w-64"
          />
        </div>

        <button
          type="button"
          title="Refresh inventory"
          aria-label="Refresh inventory"
          disabled={refreshing}
          onClick={onRefresh}
          className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {refreshing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Refresh
        </button>

        <button
          type="button"
          onClick={onAddIngredient}
          className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
        >
          <Plus className="size-4" />
          Add Ingredient
        </button>
      </div>
    </header>
  );
}

export default InventoryHeader;
