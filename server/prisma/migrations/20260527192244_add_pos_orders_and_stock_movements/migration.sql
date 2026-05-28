-- CreateEnum
CREATE TYPE "PosOrderStatus" AS ENUM ('DRAFT', 'SENT_TO_KITCHEN', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('PURCHASE', 'SALE_CONSUMPTION', 'WASTE', 'ADJUSTMENT', 'RETURN', 'MANUAL_CORRECTION');

-- AlterTable
ALTER TABLE "InventoryConsumption" ADD COLUMN     "posOrderId" TEXT;

-- CreateTable
CREATE TABLE "PosOrder" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "branchId" TEXT,
    "orderNumber" TEXT NOT NULL,
    "tableNumber" INTEGER NOT NULL,
    "waiterName" TEXT NOT NULL,
    "customerCount" INTEGER NOT NULL DEFAULT 1,
    "subtotalCents" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "taxCents" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "serviceChargeCents" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalCents" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" "PosOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "sentToKitchenAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PosOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "unitPriceCents" DECIMAL(65,30) NOT NULL,
    "totalPriceCents" DECIMAL(65,30) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PosOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "branchId" TEXT,
    "inventoryItemId" TEXT NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "quantityBefore" DECIMAL(65,30) NOT NULL,
    "quantityChanged" DECIMAL(65,30) NOT NULL,
    "quantityAfter" DECIMAL(65,30) NOT NULL,
    "unitCostCents" DECIMAL(65,30),
    "totalCostCents" DECIMAL(65,30),
    "referenceType" TEXT,
    "referenceId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PosOrder_orderNumber_key" ON "PosOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "PosOrder_hotelId_idx" ON "PosOrder"("hotelId");

-- CreateIndex
CREATE INDEX "PosOrder_branchId_idx" ON "PosOrder"("branchId");

-- CreateIndex
CREATE INDEX "PosOrder_status_idx" ON "PosOrder"("status");

-- CreateIndex
CREATE INDEX "PosOrder_createdAt_idx" ON "PosOrder"("createdAt");

-- CreateIndex
CREATE INDEX "PosOrderItem_orderId_idx" ON "PosOrderItem"("orderId");

-- CreateIndex
CREATE INDEX "PosOrderItem_recipeId_idx" ON "PosOrderItem"("recipeId");

-- CreateIndex
CREATE INDEX "PosOrderItem_createdAt_idx" ON "PosOrderItem"("createdAt");

-- CreateIndex
CREATE INDEX "StockMovement_inventoryItemId_idx" ON "StockMovement"("inventoryItemId");

-- CreateIndex
CREATE INDEX "StockMovement_type_idx" ON "StockMovement"("type");

-- CreateIndex
CREATE INDEX "StockMovement_createdAt_idx" ON "StockMovement"("createdAt");

-- CreateIndex
CREATE INDEX "InventoryConsumption_posOrderId_idx" ON "InventoryConsumption"("posOrderId");

-- AddForeignKey
ALTER TABLE "InventoryConsumption" ADD CONSTRAINT "InventoryConsumption_posOrderId_fkey" FOREIGN KEY ("posOrderId") REFERENCES "PosOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosOrder" ADD CONSTRAINT "PosOrder_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosOrder" ADD CONSTRAINT "PosOrder_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosOrderItem" ADD CONSTRAINT "PosOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PosOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosOrderItem" ADD CONSTRAINT "PosOrderItem_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
