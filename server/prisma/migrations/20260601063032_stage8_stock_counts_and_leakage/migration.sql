-- CreateEnum
CREATE TYPE "StockCountStatus" AS ENUM ('DRAFT', 'COMPLETED');

-- CreateTable
CREATE TABLE "StockCount" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "branchId" TEXT,
    "status" "StockCountStatus" NOT NULL DEFAULT 'DRAFT',
    "countedBy" TEXT,
    "notes" TEXT,
    "countedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockCountItem" (
    "id" TEXT NOT NULL,
    "stockCountId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "systemQuantity" DECIMAL(65,30) NOT NULL,
    "physicalQuantity" DECIMAL(65,30) NOT NULL,
    "varianceQuantity" DECIMAL(65,30) NOT NULL,
    "variancePercentage" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "StockCountItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockCount_hotelId_idx" ON "StockCount"("hotelId");

-- CreateIndex
CREATE INDEX "StockCount_branchId_idx" ON "StockCount"("branchId");

-- CreateIndex
CREATE INDEX "StockCount_status_idx" ON "StockCount"("status");

-- CreateIndex
CREATE INDEX "StockCount_countedAt_idx" ON "StockCount"("countedAt");

-- CreateIndex
CREATE INDEX "StockCount_createdAt_idx" ON "StockCount"("createdAt");

-- CreateIndex
CREATE INDEX "StockCountItem_stockCountId_idx" ON "StockCountItem"("stockCountId");

-- CreateIndex
CREATE INDEX "StockCountItem_inventoryItemId_idx" ON "StockCountItem"("inventoryItemId");

-- CreateIndex
CREATE UNIQUE INDEX "StockCountItem_stockCountId_inventoryItemId_key" ON "StockCountItem"("stockCountId", "inventoryItemId");

-- AddForeignKey
ALTER TABLE "StockCount" ADD CONSTRAINT "StockCount_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockCount" ADD CONSTRAINT "StockCount_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockCountItem" ADD CONSTRAINT "StockCountItem_stockCountId_fkey" FOREIGN KEY ("stockCountId") REFERENCES "StockCount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockCountItem" ADD CONSTRAINT "StockCountItem_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
