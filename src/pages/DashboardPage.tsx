import { useMemo, useState } from "react";
import dayjs from "dayjs";

import { AlertTriangle, BarChart3, Boxes, Clock3 } from "lucide-react";

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

import type {
  IngredientForecast,
  PurchaseRecommendation,
} from "@/types/dashboard";

function DashboardPage() {
  const { ingredients, ingredientDemands, totalForecastPortions } =
    useForecastData();

  const { insights } = mockDashboard;

  const [search, setSearch] = useState("");
  const [selectedForecastId, setSelectedForecastId] = useState("");

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

  // Calculate dashboard statistics.
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

  // Convert ingredient demand into the format
  // expected by the existing DemandForecast component.
  const forecasts: IngredientForecast[] = useMemo(
    () =>
      ingredientDemands.map((demand) => ({
        ingredientId: demand.ingredientId,
        changePercent: 0, // Placeholder: not calculated yet.
        dailyDemand: demand.dailyDemand.map((day) => ({
          day: dayjs(day.date).format("ddd"),
          quantity: day.quantity,
        })),
      })),
    [ingredientDemands],
  );

  // Ensure a valid selection without updating state in an effect.
  const activeForecastId = forecasts.some(
    (forecast) => forecast.ingredientId === selectedForecastId,
  )
    ? selectedForecastId
    : (forecasts[0]?.ingredientId ?? "");

  // Adapt forecasting results for the existing PurchasePlan.
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

      <footer className="pt-4 text-center text-xs text-slate-400">
        SmartPrep · Restaurant Intelligence · Demo Data
      </footer>
    </div>
  );
}

export default DashboardPage;
