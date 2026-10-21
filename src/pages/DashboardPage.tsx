import { useMemo, useState } from "react";

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

import { getPurchaseRecommendations, getWeeklyDemand } from "@/utils/dashboard";
import { useInventoryData } from "@/hooks/useInventoryData";

function DashboardPage() {
  const { ingredients } = useInventoryData();

  const { forecasts, insights } = mockDashboard;

  const [search, setSearch] = useState("");

  const [selectedForecastId, setSelectedForecastId] = useState(
    forecasts[0]?.ingredientId ?? "",
  );

  // Search only filters the inventory table.
  const filteredIngredients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return ingredients;

    return ingredients.filter(
      (ingredient) =>
        ingredient.name.toLowerCase().includes(query) ||
        ingredient.category.toLowerCase().includes(query),
    );
  }, [ingredients, search]);

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

  const selectedForecast = forecasts.find(
    (item) => item.ingredientId === selectedForecastId,
  );

  const selectedIngredient = ingredients.find(
    (item) => item.id === selectedForecastId,
  );

  const weeklyDemand = selectedForecast ? getWeeklyDemand(selectedForecast) : 0;

  const recommendations = useMemo(
    () => getPurchaseRecommendations(ingredients, forecasts),
    [ingredients, forecasts],
  );

  return (
    <div className="mx-auto max-w-400 space-y-6">
      <DashboardHeader search={search} onSearchChange={setSearch} />

      {/* KPI cards */}
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
          value={Math.round(weeklyDemand).toLocaleString()}
          description={`Expected ${selectedIngredient?.name ?? "ingredient"} demand (${selectedIngredient?.unit ?? "units"})`}
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

      {/* Main dashboard grid */}
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
            selectedId={selectedForecastId}
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
