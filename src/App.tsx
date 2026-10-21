import { Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import AppSidebar from "@/components/AppSidebar";

import DashboardPage from "@/pages/DashboardPage";
import InventoryPage from "@/pages/InventoryPage";
import ForecastPage from "@/pages/ForecastPage";

import "./App.css";

function App() {
  return (
    <div className="app min-h-screen bg-slate-50">
      <AppSidebar />

      <main className="min-h-screen px-4 pt-6 pb-28 sm:ml-64 sm:px-6 sm:pt-8 sm:pb-10 lg:px-8">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/forecasts" element={<ForecastPage />} />
        </Routes>
      </main>

      <Toaster richColors position="bottom-center" />
    </div>
  );
}

export default App;
