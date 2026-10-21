import { BarChart3, ChefHat, PackageCheck, ShoppingCart } from "lucide-react";

import StatCard from "@/components/dashboard/StatCard";

import ForecastHeader from "@/components/forecasting/ForecastHeader";

import ForecastChart from "@/components/forecasting/ForecastChart";

import IngredientDemandTable from "@/components/forecasting/IngredientDemandTable";

import RecipeTable from "@/components/forecasting/RecipeTable";

import SalesHistoryTable from "@/components/forecasting/SalesHistoryTable";

import { useForecastData } from "@/hooks/useForecastData";
import { formatCurrency } from "@/utils/dashboard";

function ForecastPage() {
  const {
    ingredients,
    recipes,
    sales,
    settings,
    setSettings,
    dishForecasts,
    ingredientDemands,
    totalForecastPortions,
    estimatedPurchaseCost,
  } = useForecastData();

  const ingredientsToOrder = ingredientDemands.filter(
    (item) => item.recommendedOrder > 0,
  ).length;

  return (
    <div className="mx-auto max-w-400 space-y-6">
      <ForecastHeader settings={settings} onSettingsChange={setSettings} />

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Predicted Sales"
          value={totalForecastPortions.toLocaleString()}
          description="Portions expected over 7 days"
          icon={BarChart3}
          tone="green"
        />

        <StatCard
          title="Menu Dishes"
          value={recipes.length}
          description="Recipes included in forecasting"
          icon={ChefHat}
          tone="blue"
        />

        <StatCard
          title="Ingredients to Order"
          value={ingredientsToOrder}
          description="Ingredients requiring replenishment"
          icon={PackageCheck}
          tone="amber"
        />

        <StatCard
          title="Estimated Purchases"
          value={formatCurrency(estimatedPurchaseCost)}
          description="Cost of recommended quantities"
          icon={ShoppingCart}
          tone="red"
        />
      </div>

      {/* Forecast chart */}
      <ForecastChart
        sales={sales}
        forecasts={dishForecasts}
        recipes={recipes}
      />

      {/* Ingredient requirements */}
      <IngredientDemandTable
        demands={ingredientDemands}
        ingredients={ingredients}
      />

      {/* Recipe and sales history */}
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
        <RecipeTable recipes={recipes} ingredients={ingredients} />

        <SalesHistoryTable sales={sales} />
      </div>

      {/* Methodology */}
      <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
        <h2 className="font-semibold text-emerald-900">
          How are these forecasts calculated?
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-emerald-900/80">
          SmartPrep analyzes 28 days of synthetic historical sales, giving
          greater weight to recent observations from the same weekday. It then
          applies an optional bounded sales trend and converts predicted dish
          quantities into ingredient demand using recipe consumption data.
        </p>

        <p className="mt-3 text-sm leading-relaxed text-emerald-900/80">
          Purchase recommendations compare expected ingredient demand against
          recorded stock, with a configurable safety buffer of{" "}
          {settings.safetyBufferPercent}%. Results are illustrative and are not
          yet validated against real sales data.
        </p>
      </section>

      <footer className="pt-4 text-center text-xs text-slate-400">
        SmartPrep · Demand Forecasting · Synthetic Data
      </footer>
    </div>
  );
}

export default ForecastPage;
