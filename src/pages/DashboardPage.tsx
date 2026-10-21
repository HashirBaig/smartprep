import { useMemo, useState } from "react";
import dayjs from "dayjs";

import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Boxes,
  Clock3,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { toast } from "sonner";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import InventoryTable from "@/components/dashboard/InventoryTable";
import DemandForecast from "@/components/dashboard/DemandForecast";
import PurchasePlan from "@/components/dashboard/PurchasePlan";
import WasteRisk from "@/components/dashboard/WasteRisk";
import AIInsights from "@/components/dashboard/AIInsights";

import { mockDashboard } from "@/data/mockDashboard";
import { EXPIRY_WARNING_DAYS } from "@/constants/dashboard";

import { useForecastData } from "@/hooks/useForecastData";
import { getApiErrorMessage } from "@/utils/apiError";

import type {
  IngredientForecast,
  PurchaseRecommendation,
} from "@/types/dashboard";

function DashboardPage() {
  const {
    ingredients,
    ingredientDemands,
    totalForecastPortions,
    inventoryLoading,
    inventoryError,
    refreshInventory,
  } = useForecastData();

  const { insights } = mockDashboard;

  const [search, setSearch] = useState("");
  const [selectedForecastId, setSelectedForecastId] = useState("");

  const [retrying, setRetrying] = useState(false);

  // Filter inventory by ingredient name or category.
  const filteredIngredients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return ingredients;

    return ingredients.filter(
      (ingredient) =>
        ingredient.name.toLowerCase().includes(query) ||
        ingredient.category.toLowerCase().includes(query),
    );
  }, [ingredients, search]);

  // Calculate dashboard statistics using MongoDB inventory.
  const lowStockCount = useMemo(
    () =>
      ingredients.filter(
        (ingredient) => ingredient.stock < ingredient.minimumStock,
      ).length,
    [ingredients],
  );

  const expiringCount = useMemo(
    () =>
      ingredients.filter(
        (ingredient) =>
          ingredient.expiresInDays !== null &&
          ingredient.expiresInDays <= EXPIRY_WARNING_DAYS,
      ).length,
    [ingredients],
  );

  // Convert the ingredient demand into chart-compatible data.
  const forecasts: IngredientForecast[] = useMemo(
    () =>
      ingredientDemands.map((demand) => ({
        ingredientId: demand.ingredientId,
        changePercent: 0,
        dailyDemand: demand.dailyDemand.map((day) => ({
          day: dayjs(day.date).format("ddd"),
          quantity: day.quantity,
        })),
      })),
    [ingredientDemands],
  );

  // Derive valid selection instead of setting state in an effect.
  const activeForecastId = forecasts.some(
    (forecast) => forecast.ingredientId === selectedForecastId,
  )
    ? selectedForecastId
    : (forecasts[0]?.ingredientId ?? "");

  // Convert forecast requirements into PurchasePlan props.
  const recommendations: PurchaseRecommendation[] = useMemo(() => {
    const ingredientMap = new Map(
      ingredients.map((ingredient) => [ingredient.id, ingredient]),
    );

    return ingredientDemands.flatMap((demand) => {
      if (demand.recommendedOrder <= 0) return [];

      const ingredient = ingredientMap.get(demand.ingredientId);

      if (!ingredient) return [];

      return [
        {
          ingredient,
          quantity: demand.recommendedOrder,
          estimatedCost: demand.estimatedCost,
        },
      ];
    });
  }, [ingredients, ingredientDemands]);

  async function handleRetry() {
    try {
      setRetrying(true);
      await refreshInventory();
      toast.success("Dashboard data refreshed.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setRetrying(false);
    }
  }

  // Initial API loading state.
  if (inventoryLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-7 animate-spin text-emerald-700" />

        <p className="text-sm text-slate-500">Loading restaurant data...</p>
      </div>
    );
  }

  // API error state with retry.
  if (inventoryError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div
          role="alert"
          className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-7 text-center shadow-sm"
        >
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="size-6 text-red-600" />
          </div>

          <h2 className="text-lg font-semibold text-slate-900">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-500">{inventoryError}</p>

          <button
            type="button"
            disabled={retrying}
            onClick={() => void handleRetry()}
            className="mx-auto mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {retrying ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}

            {retrying ? "Retrying..." : "Try Again"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-400 space-y-6">
      <DashboardHeader search={search} onSearchChange={setSearch} />

      {/* Summary statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Ingredients"
          value={ingredients.length}
          description="Ingredients being tracked"
          icon={Boxes}
          tone="green"
        />

        <StatCard
          title="Low Stock Items"
          value={lowStockCount}
          description="Below minimum stock threshold"
          icon={AlertTriangle}
          tone="amber"
        />

        <StatCard
          title="7-Day Forecast"
          value={totalForecastPortions.toLocaleString()}
          description="Expected menu portions sold"
          icon={BarChart3}
          tone="blue"
        />

        <StatCard
          title="Expiring Soon"
          value={expiringCount}
          description={`Expiring within ${EXPIRY_WARNING_DAYS} days`}
          icon={Clock3}
          tone="red"
        />
      </div>

      {/* Dashboard content */}
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
        {/* Left column */}
        <div className="min-w-0 space-y-5">
          <InventoryTable ingredients={filteredIngredients} />

          <WasteRisk ingredients={ingredients} />
        </div>

        {/* Right column */}
        <div className="min-w-0 space-y-5">
          <DemandForecast
            ingredients={ingredients}
            forecasts={forecasts}
            selectedId={activeForecastId}
            onSelectedIdChange={setSelectedForecastId}
          />

          <PurchasePlan recommendations={recommendations} />

          <AIInsights insights={insights} />
        </div>
      </div>

      <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        Purchase recommendations are based on recorded stock, not
        expiry-adjusted usable stock. Verify expiring batches before placing
        orders.
      </div>

      <footer className="pt-4 text-center text-xs text-slate-400">
        SmartPrep · MongoDB Inventory · Synthetic Forecasting
      </footer>
    </div>
  );
}

export default DashboardPage;
