import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { PermissionRoute } from "@/components/auth/PermissionRoute";
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
import { LeakageReportPage } from "@/features/analytics/pages/LeakageReportPage";
import { NotificationsPage } from "@/features/notifications/pages/NotificationsPage";
import EmployeesPage from "@/features/workforce/pages/EmployeesPage";
import AttendanceTerminal from "@/features/workforce/pages/AttendanceTerminal";
import AttendanceDashboard from "@/features/workforce/pages/AttendanceDashboard";
import RoomsDashboard from "@/features/roomops/pages/RoomsDashboard";
import ReservationsPage from "@/features/roomops/pages/ReservationsPage";
import HousekeepingBoard from "@/features/roomops/pages/HousekeepingBoard";
import CleanerMobileView from "@/features/roomops/pages/CleanerMobileView";
import LateCheckoutMonitoring from "@/features/roomops/pages/LateCheckoutMonitoring";
import ElitePOS from "@/pages/restaurant/components/ElitePOS";
import { KitchenDisplayPage } from "@/pages/restaurant/KitchenDisplayPage";
import { PosAnalyticsPage } from "@/pages/restaurant/PosAnalyticsPage";
import { PosOrderHistoryPage } from "@/pages/restaurant/PosOrderHistoryPage";
import {
  DASHBOARD_VIEW,
  ANALYTICS_VIEW,
  INVENTORY_VIEW,
  RECIPES_VIEW,
  FOOD_COST_VIEW,
  INVENTORY_CONSUMPTION_VIEW,
  WASTE_VIEW,
  PROFITABILITY_VIEW,
  LEAKAGE_VIEW,
  PURCHASES_VIEW,
  SUPPLIERS_VIEW,
  REPORTS_VIEW,
  NOTIFICATIONS_VIEW,
  EMPLOYEES_VIEW,
  ATTENDANCE_VIEW,
  WORKFORCE_REPORTS_VIEW,
  ROOMS_VIEW,
  RESERVATIONS_VIEW,
  HOUSEKEEPING_VIEW,
  LATE_CHECKOUT_VIEW,
  POS_VIEW,
  ORDERS_VIEW,
  KITCHEN_DISPLAY_VIEW,
  SETTINGS_VIEW,
} from "@/lib/permissions";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireAuth />}>
          <Route element={<DashboardLayout />}>
            <Route
              path="/dashboard"
              element={
                <PermissionRoute
                  permission={DASHBOARD_VIEW}
                  element={<DashboardHomePage />}
                />
              }
            />
            <Route
              path="/inventory"
              element={<Navigate to="/inventory/dashboard" replace />}
            />
            <Route
              path="/inventory/dashboard"
              element={
                <PermissionRoute
                  permission={INVENTORY_VIEW}
                  element={<InventoryDashboardPage />}
                />
              }
            />
            <Route
              path="/inventory/items"
              element={
                <PermissionRoute
                  permission={INVENTORY_VIEW}
                  element={<InventoryItemsPage />}
                />
              }
            />
            <Route
              path="/inventory/measurement-units"
              element={
                <PermissionRoute
                  permission={INVENTORY_VIEW}
                  element={<MeasurementUnitsAdminPage />}
                />
              }
            />
            <Route
              path="/inventory/items/:id"
              element={
                <PermissionRoute
                  permission={INVENTORY_VIEW}
                  element={<InventoryItemDetailsPage />}
                />
              }
            />
            <Route
              path="/inventory/transactions"
              element={
                <PermissionRoute
                  permission={INVENTORY_VIEW}
                  element={<InventoryTransactionsPage />}
                />
              }
            />
            <Route
              path="/inventory/low-stock"
              element={
                <PermissionRoute
                  permission={INVENTORY_VIEW}
                  element={<LowStockAlertsPage />}
                />
              }
            />
            <Route
              path="/recipes"
              element={
                <PermissionRoute
                  permission={RECIPES_VIEW}
                  element={<RecipeManagementPage />}
                />
              }
            />
            <Route
              path="/recipes/:id"
              element={
                <PermissionRoute
                  permission={RECIPES_VIEW}
                  element={<RecipeDetailsPage />}
                />
              }
            />
            <Route
              path="/recipes/:id/builder"
              element={
                <PermissionRoute
                  permission={RECIPES_VIEW}
                  element={<RecipeBuilderPage />}
                />
              }
            />
            <Route
              path="/food-cost"
              element={
                <PermissionRoute
                  permission={FOOD_COST_VIEW}
                  element={<FoodCostDashboardPage />}
                />
              }
            />
            <Route
              path="/consumption"
              element={
                <PermissionRoute
                  permission={INVENTORY_CONSUMPTION_VIEW}
                  element={<InventoryConsumptionDashboardPage />}
                />
              }
            />
            <Route
              path="/waste"
              element={
                <PermissionRoute
                  permission={WASTE_VIEW}
                  element={<WasteAnalyticsPage />}
                />
              }
            />
            <Route
              path="/profitability"
              element={
                <PermissionRoute
                  permission={PROFITABILITY_VIEW}
                  element={<ProfitabilityReportsPage />}
                />
              }
            />
            <Route
              path="/purchases"
              element={
                <PermissionRoute
                  permission={PURCHASES_VIEW}
                  element={<PurchaseManagementPage />}
                />
              }
            />
            <Route
              path="/suppliers"
              element={
                <PermissionRoute
                  permission={SUPPLIERS_VIEW}
                  element={<SupplierManagementPage />}
                />
              }
            />
            <Route
              path="/reports"
              element={
                <PermissionRoute
                  permission={REPORTS_VIEW}
                  element={<ReportsPage />}
                />
              }
            />
            <Route
              path="/reports/leakage"
              element={
                <PermissionRoute
                  permission={LEAKAGE_VIEW}
                  element={<LeakageReportPage />}
                />
              }
            />
            <Route
              path="/notifications"
              element={
                <PermissionRoute
                  permission={NOTIFICATIONS_VIEW}
                  element={<NotificationsPage />}
                />
              }
            />
            <Route
              path="/ops/rooms"
              element={
                <PermissionRoute
                  permission={ROOMS_VIEW}
                  element={<RoomsDashboard />}
                />
              }
            />
            <Route
              path="/ops/reservations"
              element={
                <PermissionRoute
                  permission={RESERVATIONS_VIEW}
                  element={<ReservationsPage />}
                />
              }
            />
            <Route
              path="/ops/housekeeping"
              element={
                <PermissionRoute
                  permission={HOUSEKEEPING_VIEW}
                  element={<HousekeepingBoard />}
                />
              }
            />
            <Route
              path="/ops/cleaner"
              element={
                <PermissionRoute
                  permission={HOUSEKEEPING_VIEW}
                  element={<CleanerMobileView />}
                />
              }
            />
            <Route
              path="/ops/late-checkout"
              element={
                <PermissionRoute
                  permission={LATE_CHECKOUT_VIEW}
                  element={<LateCheckoutMonitoring />}
                />
              }
            />
            <Route
              path="/employees"
              element={
                <PermissionRoute
                  permission={EMPLOYEES_VIEW}
                  element={<PlaceholderPage title="Employees" />}
                />
              }
            />
            <Route
              path="/workforce/employees"
              element={
                <PermissionRoute
                  permission={EMPLOYEES_VIEW}
                  element={<EmployeesPage />}
                />
              }
            />
            <Route
              path="/workforce/attendance"
              element={
                <PermissionRoute
                  permission={ATTENDANCE_VIEW}
                  element={<AttendanceTerminal />}
                />
              }
            />
            <Route
              path="/workforce/reports"
              element={
                <PermissionRoute
                  permission={WORKFORCE_REPORTS_VIEW}
                  element={<AttendanceDashboard />}
                />
              }
            />
            <Route
              path="/analytics"
              element={
                <PermissionRoute
                  permission={ANALYTICS_VIEW}
                  element={<ExecutiveFoodOpsDashboardPage />}
                />
              }
            />

            <Route
              path="/kitchen"
              element={
                <PermissionRoute
                  permission={KITCHEN_DISPLAY_VIEW}
                  element={<KitchenDisplayPage />}
                />
              }
            />
            <Route
              path="/pos"
              element={
                <PermissionRoute permission={POS_VIEW} element={<ElitePOS />} />
              }
            />
            <Route
              path="/orders"
              element={
                <PermissionRoute
                  permission={ORDERS_VIEW}
                  element={<PosOrderHistoryPage />}
                />
              }
            />
            <Route
              path="/settings"
              element={
                <PermissionRoute
                  permission={SETTINGS_VIEW}
                  element={<SettingsPage />}
                />
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
