import { z } from "zod";

const uuid = z.string().uuid();
const datetime = z.string().datetime();

const reportType = z.enum([
  "FOOD_COST",
  "WASTE",
  "MENU_PROFITABILITY",
  "PURCHASES",
  "SUPPLIERS",
  "INVENTORY_VALUATION",
  "KITCHEN_PERFORMANCE",
  "LEAKAGE",
]);

export const listReportsSchema = {
  query: z.object({}),
};

export const reportExportSchema = {
  query: z.object({
    type: reportType,
    format: z.enum(["csv", "xlsx", "pdf"]).default("csv"),
    from: datetime.optional(),
    to: datetime.optional(),
    branchId: uuid.optional(),
    supplierId: uuid.optional(),
    inventoryItemId: uuid.optional(),
  }),
};
