/**
 * Frontend permissions constants
 * Mirrors the backend permissions for consistency
 * Used by usePermission hook and permission checks
 */

const PERMISSIONS = {
  // Dashboard & Overview
  DASHBOARD_VIEW: "dashboard.view",
  ANALYTICS_VIEW: "analytics.view",

  // Inventory Management
  INVENTORY_VIEW: "inventory.view",
  INVENTORY_CREATE: "inventory.create",
  INVENTORY_UPDATE: "inventory.update",
  INVENTORY_DELETE: "inventory.delete",

  INVENTORY_TRANSACTIONS_VIEW: "inventory.transactions.view",
  INVENTORY_TRANSACTIONS_CREATE: "inventory.transactions.create",
  INVENTORY_TRANSACTIONS_DELETE: "inventory.transactions.delete",

  STOCK_COUNTS_VIEW: "stock.counts.view",
  STOCK_COUNTS_CREATE: "stock.counts.create",
  STOCK_COUNTS_UPDATE: "stock.counts.update",
  STOCK_COUNTS_DELETE: "stock.counts.delete",

  LOW_STOCK_VIEW: "low.stock.view",

  // Recipes & Menu
  RECIPES_VIEW: "recipes.view",
  RECIPES_CREATE: "recipes.create",
  RECIPES_UPDATE: "recipes.update",
  RECIPES_DELETE: "recipes.delete",
  RECIPES_RECALCULATE: "recipes.recalculate",

  RECIPE_INGREDIENTS_VIEW: "recipe.ingredients.view",
  RECIPE_INGREDIENTS_CREATE: "recipe.ingredients.create",
  RECIPE_INGREDIENTS_UPDATE: "recipe.ingredients.update",
  RECIPE_INGREDIENTS_DELETE: "recipe.ingredients.delete",

  // Food Cost & Consumption
  FOOD_COST_VIEW: "food.cost.view",
  INVENTORY_CONSUMPTION_VIEW: "inventory.consumption.view",
  INVENTORY_CONSUMPTION_CREATE: "inventory.consumption.create",
  INVENTORY_CONSUMPTION_UPDATE: "inventory.consumption.update",

  // Waste & Leakage
  WASTE_VIEW: "waste.view",
  WASTE_CREATE: "waste.create",
  WASTE_UPDATE: "waste.update",
  WASTE_DELETE: "waste.delete",

  LEAKAGE_VIEW: "leakage.view",

  // Profitability & Reports
  PROFITABILITY_VIEW: "profitability.view",
  REPORTS_VIEW: "reports.view",

  // Purchase & Suppliers
  PURCHASES_VIEW: "purchases.view",
  PURCHASES_CREATE: "purchases.create",
  PURCHASES_UPDATE: "purchases.update",
  PURCHASES_DELETE: "purchases.delete",
  PURCHASES_STATUS_CHANGE: "purchases.status.change",

  SUPPLIERS_VIEW: "suppliers.view",
  SUPPLIERS_CREATE: "suppliers.create",
  SUPPLIERS_UPDATE: "suppliers.update",
  SUPPLIERS_DELETE: "suppliers.delete",

  MEASUREMENT_UNITS_VIEW: "measurement.units.view",
  MEASUREMENT_UNITS_MANAGE: "measurement.units.manage",

  // POS & Orders
  POS_VIEW: "pos.view",
  POS_CREATE: "pos.create",
  POS_TRANSACTIONS: "pos.transactions",

  ORDERS_VIEW: "orders.view",
  ORDERS_CREATE: "orders.create",
  ORDERS_UPDATE: "orders.update",
  ORDERS_DELETE: "orders.delete",

  KITCHEN_DISPLAY_VIEW: "kitchen.display.view",

  // Notifications
  NOTIFICATIONS_VIEW: "notifications.view",
  NOTIFICATIONS_MANAGE: "notifications.manage",

  // Workforce & Attendance
  EMPLOYEES_VIEW: "employees.view",
  EMPLOYEES_CREATE: "employees.create",
  EMPLOYEES_UPDATE: "employees.update",
  EMPLOYEES_DELETE: "employees.delete",

  ATTENDANCE_VIEW: "attendance.view",
  ATTENDANCE_TERMINAL: "attendance.terminal",
  ATTENDANCE_MANAGE: "attendance.manage",

  SCHEDULES_VIEW: "schedules.view",
  SCHEDULES_CREATE: "schedules.create",
  SCHEDULES_UPDATE: "schedules.update",
  SCHEDULES_DELETE: "schedules.delete",

  WORKFORCE_REPORTS_VIEW: "workforce.reports.view",

  // Room Operations & Housekeeping
  ROOMS_VIEW: "rooms.view",
  ROOMS_MANAGE: "rooms.manage",

  RESERVATIONS_VIEW: "reservations.view",
  RESERVATIONS_CREATE: "reservations.create",
  RESERVATIONS_UPDATE: "reservations.update",
  RESERVATIONS_DELETE: "reservations.delete",

  HOUSEKEEPING_VIEW: "housekeeping.view",
  HOUSEKEEPING_ASSIGN: "housekeeping.assign",
  HOUSEKEEPING_UPDATE: "housekeeping.update",

  LATE_CHECKOUT_VIEW: "late.checkout.view",
  LATE_CHECKOUT_MANAGE: "late.checkout.manage",

  // Settings & Administration
  SETTINGS_VIEW: "settings.view",
  SETTINGS_MANAGE: "settings.manage",

  USERS_CREATE: "users.create",
  USERS_VIEW: "users.view",
  USERS_UPDATE: "users.update",
  USERS_DELETE: "users.delete",

  BRANCH_MANAGE: "branch.manage",
  HOTEL_MANAGE: "hotel.manage",
};

export const {
  DASHBOARD_VIEW,
  ANALYTICS_VIEW,
  INVENTORY_VIEW,
  INVENTORY_CREATE,
  INVENTORY_UPDATE,
  INVENTORY_DELETE,
  INVENTORY_TRANSACTIONS_VIEW,
  INVENTORY_TRANSACTIONS_CREATE,
  INVENTORY_TRANSACTIONS_DELETE,
  STOCK_COUNTS_VIEW,
  STOCK_COUNTS_CREATE,
  STOCK_COUNTS_UPDATE,
  STOCK_COUNTS_DELETE,
  LOW_STOCK_VIEW,
  RECIPES_VIEW,
  RECIPES_CREATE,
  RECIPES_UPDATE,
  RECIPES_DELETE,
  RECIPES_RECALCULATE,
  RECIPE_INGREDIENTS_VIEW,
  RECIPE_INGREDIENTS_CREATE,
  RECIPE_INGREDIENTS_UPDATE,
  RECIPE_INGREDIENTS_DELETE,
  FOOD_COST_VIEW,
  INVENTORY_CONSUMPTION_VIEW,
  INVENTORY_CONSUMPTION_CREATE,
  INVENTORY_CONSUMPTION_UPDATE,
  WASTE_VIEW,
  WASTE_CREATE,
  WASTE_UPDATE,
  WASTE_DELETE,
  LEAKAGE_VIEW,
  PROFITABILITY_VIEW,
  REPORTS_VIEW,
  PURCHASES_VIEW,
  PURCHASES_CREATE,
  PURCHASES_UPDATE,
  PURCHASES_DELETE,
  PURCHASES_STATUS_CHANGE,
  SUPPLIERS_VIEW,
  SUPPLIERS_CREATE,
  SUPPLIERS_UPDATE,
  SUPPLIERS_DELETE,
  MEASUREMENT_UNITS_VIEW,
  MEASUREMENT_UNITS_MANAGE,
  POS_VIEW,
  POS_CREATE,
  POS_TRANSACTIONS,
  ORDERS_VIEW,
  ORDERS_CREATE,
  ORDERS_UPDATE,
  ORDERS_DELETE,
  KITCHEN_DISPLAY_VIEW,
  NOTIFICATIONS_VIEW, // <-- This fixes the current error in AppRouter
  NOTIFICATIONS_MANAGE,
  EMPLOYEES_VIEW,
  EMPLOYEES_CREATE,
  EMPLOYEES_UPDATE,
  EMPLOYEES_DELETE,
  ATTENDANCE_VIEW,
  ATTENDANCE_TERMINAL,
  ATTENDANCE_MANAGE,
  SCHEDULES_VIEW,
  SCHEDULES_CREATE,
  SCHEDULES_UPDATE,
  SCHEDULES_DELETE,
  WORKFORCE_REPORTS_VIEW,
  ROOMS_VIEW,
  ROOMS_MANAGE,
  RESERVATIONS_VIEW,
  RESERVATIONS_CREATE,
  RESERVATIONS_UPDATE,
  RESERVATIONS_DELETE,
  HOUSEKEEPING_VIEW,
  HOUSEKEEPING_ASSIGN,
  HOUSEKEEPING_UPDATE,
  LATE_CHECKOUT_VIEW,
  LATE_CHECKOUT_MANAGE,
  SETTINGS_VIEW,
  SETTINGS_MANAGE,
  USERS_CREATE,
  USERS_VIEW,
  USERS_UPDATE,
  USERS_DELETE,
  BRANCH_MANAGE,
  HOTEL_MANAGE,
} = PERMISSIONS;

export default PERMISSIONS;
