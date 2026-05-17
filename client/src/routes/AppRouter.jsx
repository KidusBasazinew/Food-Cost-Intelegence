import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { DashboardHomePage } from "@/pages/DashboardHomePage";
import { InventoryPage } from "@/pages/InventoryPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";
import { RecipesPage } from "@/pages/RecipesPage";
import { SettingsPage } from "@/pages/SettingsPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireAuth />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHomePage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route
              path="/food-cost"
              element={<PlaceholderPage title="Food Cost" />}
            />
            <Route
              path="/purchases"
              element={<PlaceholderPage title="Purchases" />}
            />
            <Route
              path="/reports"
              element={<PlaceholderPage title="Reports" />}
            />
            <Route
              path="/employees"
              element={<PlaceholderPage title="Employees" />}
            />
            <Route
              path="/analytics"
              element={<PlaceholderPage title="Analytics" />}
            />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
