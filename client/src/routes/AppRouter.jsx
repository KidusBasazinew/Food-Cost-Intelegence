import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { InventoryDashboardPage } from "@/features/inventory/pages/InventoryDashboardPage";
import { InventoryItemDetailsPage } from "@/features/inventory/pages/InventoryItemDetailsPage";
import { InventoryItemsPage } from "@/features/inventory/pages/InventoryItemsPage";
import { InventoryTransactionsPage } from "@/features/inventory/pages/InventoryTransactionsPage";
import { LowStockAlertsPage } from "@/features/inventory/pages/LowStockAlertsPage";
import { MeasurementUnitsAdminPage } from "@/features/inventory/pages/MeasurementUnitsAdminPage";
import { PurchaseManagementPage } from "@/features/inventory/pages/PurchaseManagementPage";
import { SupplierManagementPage } from "@/features/inventory/pages/SupplierManagementPage";
import { RecipeBuilderPage } from "@/features/recipes/pages/RecipeBuilderPage";
import { RecipeDetailsPage } from "@/features/recipes/pages/RecipeDetailsPage";
import { RecipeManagementPage } from "@/features/recipes/pages/RecipeManagementPage";
import { FoodCostDashboardPage } from "@/features/intelligence/pages/FoodCostDashboardPage";
import { InventoryConsumptionDashboardPage } from "@/features/intelligence/pages/InventoryConsumptionDashboardPage";
import { WasteAnalyticsPage } from "@/features/intelligence/pages/WasteAnalyticsPage";
import { ProfitabilityReportsPage } from "@/features/intelligence/pages/ProfitabilityReportsPage";
import { DashboardHomePage } from "@/pages/DashboardHomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ExecutiveFoodOpsDashboardPage } from "@/features/analytics/pages/ExecutiveFoodOpsDashboardPage";
import { ReportsPage } from "@/features/analytics/pages/ReportsPage";
import ElitePOS from "@/pages/restaurant/components/ElitePOS";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/ops" element={<ElitePOS />} />

        <Route element={<RequireAuth />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHomePage />} />
            <Route
              path="/inventory"
              element={<Navigate to="/inventory/dashboard" replace />}
            />
            <Route
              path="/inventory/dashboard"
              element={<InventoryDashboardPage />}
            />
            <Route path="/inventory/items" element={<InventoryItemsPage />} />
            <Route
              path="/inventory/measurement-units"
              element={<MeasurementUnitsAdminPage />}
            />
            <Route
              path="/inventory/items/:id"
              element={<InventoryItemDetailsPage />}
            />
            <Route
              path="/inventory/transactions"
              element={<InventoryTransactionsPage />}
            />
            <Route
              path="/inventory/low-stock"
              element={<LowStockAlertsPage />}
            />
            <Route path="/recipes" element={<RecipeManagementPage />} />
            <Route path="/recipes/:id" element={<RecipeDetailsPage />} />
            <Route
              path="/recipes/:id/builder"
              element={<RecipeBuilderPage />}
            />
            <Route path="/food-cost" element={<FoodCostDashboardPage />} />
            <Route
              path="/consumption"
              element={<InventoryConsumptionDashboardPage />}
            />
            <Route path="/waste" element={<WasteAnalyticsPage />} />
            <Route
              path="/profitability"
              element={<ProfitabilityReportsPage />}
            />
            <Route path="/purchases" element={<PurchaseManagementPage />} />
            <Route path="/suppliers" element={<SupplierManagementPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route
              path="/employees"
              element={<PlaceholderPage title="Employees" />}
            />
            <Route
              path="/analytics"
              element={<ExecutiveFoodOpsDashboardPage />}
            />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
