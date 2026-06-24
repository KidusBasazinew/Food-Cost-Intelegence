/**
 * Frontend permission configuration for navigation
 * Maps routes to required permissions
 * Used by Sidebar and PermissionRoute to control access
 */

import {
  DASHBOARD_VIEW,
  ANALYTICS_VIEW,
  INVENTORY_VIEW,
  INVENTORY_CREATE,
  RECIPES_VIEW,
  RECIPES_CREATE,
  FOOD_COST_VIEW,
  INVENTORY_CONSUMPTION_VIEW,
  WASTE_VIEW,
  LEAKAGE_VIEW,
  PROFITABILITY_VIEW,
  PURCHASES_VIEW,
  PURCHASES_CREATE,
  SUPPLIERS_VIEW,
  SUPPLIERS_CREATE,
  POS_VIEW,
  POS_CREATE,
  ORDERS_VIEW,
  KITCHEN_DISPLAY_VIEW,
  NOTIFICATIONS_VIEW,
  EMPLOYEES_VIEW,
  EMPLOYEES_CREATE,
  ATTENDANCE_VIEW,
  WORKFORCE_REPORTS_VIEW,
  ROOMS_VIEW,
  ROOMS_MANAGE,
  RESERVATIONS_VIEW,
  RESERVATIONS_CREATE,
  HOUSEKEEPING_VIEW,
  HOUSEKEEPING_ASSIGN,
  LATE_CHECKOUT_VIEW,
  LATE_CHECKOUT_MANAGE,
  REPORTS_VIEW,
  SETTINGS_VIEW,
} from "@/lib/permissions";

/**
 * Navigation item interface
 * @typedef {Object} NavItem
 * @property {string} to - Route path
 * @property {string} label - Display label
 * @property {string|string[]} permission - Required permission(s)
 * @property {boolean} [visible] - Whether to show in menu
 */

export const NAVIGATION_PERMISSIONS = {
  // Overview
  DASHBOARD: {
    path: "/dashboard",
    permission: DASHBOARD_VIEW,
  },
  ANALYTICS: {
    path: "/analytics",
    permission: ANALYTICS_VIEW,
  },

  // Inventory
  INVENTORY_DASHBOARD: {
    path: "/inventory/dashboard",
    permission: INVENTORY_VIEW,
  },
  INVENTORY_ITEMS: {
    path: "/inventory/items",
    permission: INVENTORY_VIEW,
  },
  INVENTORY_MEASUREMENT_UNITS: {
    path: "/inventory/measurement-units",
    permission: INVENTORY_VIEW,
  },
  INVENTORY_TRANSACTIONS: {
    path: "/inventory/transactions",
    permission: INVENTORY_VIEW,
  },
  INVENTORY_LOW_STOCK: {
    path: "/inventory/low-stock",
    permission: INVENTORY_VIEW,
  },

  // Recipes
  RECIPES: {
    path: "/recipes",
    permission: RECIPES_VIEW,
  },
  RECIPE_BUILDER: {
    path: "/recipes/:id/builder",
    permission: RECIPES_VIEW,
  },

  // Food Cost & Analytics
  FOOD_COST: {
    path: "/food-cost",
    permission: FOOD_COST_VIEW,
  },
  CONSUMPTION: {
    path: "/consumption",
    permission: INVENTORY_CONSUMPTION_VIEW,
  },
  WASTE: {
    path: "/waste",
    permission: WASTE_VIEW,
  },
  LEAKAGE: {
    path: "/reports/leakage",
    permission: LEAKAGE_VIEW,
  },
  PROFITABILITY: {
    path: "/profitability",
    permission: PROFITABILITY_VIEW,
  },

  // Purchases & Suppliers
  PURCHASES: {
    path: "/purchases",
    permission: PURCHASES_VIEW,
  },
  SUPPLIERS: {
    path: "/suppliers",
    permission: SUPPLIERS_VIEW,
  },

  // POS
  POS: {
    path: "/pos",
    permission: POS_VIEW,
  },
  ORDERS: {
    path: "/orders",
    permission: ORDERS_VIEW,
  },
  KITCHEN: {
    path: "/kitchen",
    permission: KITCHEN_DISPLAY_VIEW,
  },

  // Notifications
  NOTIFICATIONS: {
    path: "/notifications",
    permission: NOTIFICATIONS_VIEW,
  },

  // Workforce
  EMPLOYEES: {
    path: "/workforce/employees",
    permission: EMPLOYEES_VIEW,
  },
  ATTENDANCE: {
    path: "/workforce/attendance",
    permission: ATTENDANCE_VIEW,
  },
  WORKFORCE_REPORTS: {
    path: "/workforce/reports",
    permission: WORKFORCE_REPORTS_VIEW,
  },

  // Room Operations
  ROOMS: {
    path: "/ops/rooms",
    permission: ROOMS_VIEW,
  },
  RESERVATIONS: {
    path: "/ops/reservations",
    permission: RESERVATIONS_VIEW,
  },
  HOUSEKEEPING: {
    path: "/ops/housekeeping",
    permission: HOUSEKEEPING_VIEW,
  },
  LATE_CHECKOUT: {
    path: "/ops/late-checkout",
    permission: LATE_CHECKOUT_VIEW,
  },

  // Reports
  REPORTS: {
    path: "/reports",
    permission: REPORTS_VIEW,
  },

  // Settings
  SETTINGS: {
    path: "/settings",
    permission: SETTINGS_VIEW,
  },
};

export default NAVIGATION_PERMISSIONS;
