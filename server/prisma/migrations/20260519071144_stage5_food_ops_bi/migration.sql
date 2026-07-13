-- CreateEnum
CREATE TYPE "MenuEngineeringCategory" AS ENUM ('STAR', 'PUZZLE', 'PLOWHORSE', 'DOG');

-- CreateEnum
CREATE TYPE "AnalyticsPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "SalesOrderStatus" AS ENUM ('OPEN', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "SalesOrder" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "branchId" TEXT,
    "status" "SalesOrderStatus" NOT NULL DEFAULT 'COMPLETED',
    "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalRevenueCents" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrderItem" (
    "id" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "unitPriceCents" DECIMAL(65,30) NOT NULL,
    "totalRevenueCents" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuAnalyticsSnapshot" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "period" "AnalyticsPeriod" NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "totalSalesCount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalRevenueCents" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalIngredientCostCents" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalProfitCents" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "foodCostPercentage" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "grossMarginPercentage" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "engineeringCategory" "MenuEngineeringCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MenuAnalyticsSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryForecastSnapshot" (
    "id" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "averageDailyConsumption" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "estimatedDaysRemaining" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "projectedWeeklyUsage" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "projectedMonthlyUsage" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryForecastSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SalesOrder_hotelId_idx" ON "SalesOrder"("hotelId");

-- CreateIndex
CREATE INDEX "SalesOrder_branchId_idx" ON "SalesOrder"("branchId");

-- CreateIndex
CREATE INDEX "SalesOrder_status_idx" ON "SalesOrder"("status");

-- CreateIndex
CREATE INDEX "SalesOrder_orderedAt_idx" ON "SalesOrder"("orderedAt");

-- CreateIndex
CREATE INDEX "SalesOrder_createdAt_idx" ON "SalesOrder"("createdAt");

-- CreateIndex
CREATE INDEX "SalesOrderItem_salesOrderId_idx" ON "SalesOrderItem"("salesOrderId");

-- CreateIndex
CREATE INDEX "SalesOrderItem_recipeId_idx" ON "SalesOrderItem"("recipeId");

-- CreateIndex
CREATE INDEX "SalesOrderItem_createdAt_idx" ON "SalesOrderItem"("createdAt");

-- CreateIndex
CREATE INDEX "MenuAnalyticsSnapshot_branchId_idx" ON "MenuAnalyticsSnapshot"("branchId");

-- CreateIndex
CREATE INDEX "MenuAnalyticsSnapshot_period_idx" ON "MenuAnalyticsSnapshot"("period");

-- CreateIndex
CREATE INDEX "MenuAnalyticsSnapshot_snapshotDate_idx" ON "MenuAnalyticsSnapshot"("snapshotDate");

-- CreateIndex
CREATE INDEX "MenuAnalyticsSnapshot_createdAt_idx" ON "MenuAnalyticsSnapshot"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MenuAnalyticsSnapshot_menuItemId_branchId_period_snapshotDa_key" ON "MenuAnalyticsSnapshot"("menuItemId", "branchId", "period", "snapshotDate");

-- CreateIndex
CREATE INDEX "InventoryForecastSnapshot_inventoryItemId_idx" ON "InventoryForecastSnapshot"("inventoryItemId");

-- CreateIndex
CREATE INDEX "InventoryForecastSnapshot_branchId_idx" ON "InventoryForecastSnapshot"("branchId");

-- CreateIndex
CREATE INDEX "InventoryForecastSnapshot_createdAt_idx" ON "InventoryForecastSnapshot"("createdAt");

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuAnalyticsSnapshot" ADD CONSTRAINT "MenuAnalyticsSnapshot_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuAnalyticsSnapshot" ADD CONSTRAINT "MenuAnalyticsSnapshot_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryForecastSnapshot" ADD CONSTRAINT "InventoryForecastSnapshot_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryForecastSnapshot" ADD CONSTRAINT "InventoryForecastSnapshot_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
