-- CreateEnum
CREATE TYPE "RecipeStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ConsumptionSourceType" AS ENUM ('ORDER', 'MANUAL_WASTE', 'TESTING', 'ADJUSTMENT');

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "branchId" TEXT,
    "menuItemId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "yieldQuantity" DECIMAL(65,30) NOT NULL DEFAULT 1,
    "yieldUnitId" TEXT NOT NULL,
    "preparationInstructions" TEXT,
    "status" "RecipeStatus" NOT NULL DEFAULT 'ACTIVE',
    "totalCostCents" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "sellingPriceCents" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "estimatedProfitCents" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "estimatedProfitMargin" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "unitId" TEXT NOT NULL,
    "quantityInBaseUnit" DECIMAL(65,30) NOT NULL,
    "costPerBaseUnitCents" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalCostCents" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryConsumption" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "branchId" TEXT,
    "recipeId" TEXT,
    "recipeIngredientId" TEXT,
    "inventoryItemId" TEXT NOT NULL,
    "sourceType" "ConsumptionSourceType" NOT NULL,
    "sourceId" TEXT,
    "quantityConsumed" DECIMAL(65,30) NOT NULL,
    "quantityConsumedBaseUnit" DECIMAL(65,30) NOT NULL,
    "unitCostCents" DECIMAL(65,30) NOT NULL,
    "totalCostCents" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryConsumption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Recipe_hotelId_idx" ON "Recipe"("hotelId");

-- CreateIndex
CREATE INDEX "Recipe_branchId_idx" ON "Recipe"("branchId");

-- CreateIndex
CREATE INDEX "Recipe_status_idx" ON "Recipe"("status");

-- CreateIndex
CREATE INDEX "Recipe_createdAt_idx" ON "Recipe"("createdAt");

-- CreateIndex
CREATE INDEX "RecipeIngredient_recipeId_idx" ON "RecipeIngredient"("recipeId");

-- CreateIndex
CREATE INDEX "RecipeIngredient_inventoryItemId_idx" ON "RecipeIngredient"("inventoryItemId");

-- CreateIndex
CREATE INDEX "RecipeIngredient_unitId_idx" ON "RecipeIngredient"("unitId");

-- CreateIndex
CREATE INDEX "InventoryConsumption_hotelId_idx" ON "InventoryConsumption"("hotelId");

-- CreateIndex
CREATE INDEX "InventoryConsumption_branchId_idx" ON "InventoryConsumption"("branchId");

-- CreateIndex
CREATE INDEX "InventoryConsumption_inventoryItemId_idx" ON "InventoryConsumption"("inventoryItemId");

-- CreateIndex
CREATE INDEX "InventoryConsumption_recipeId_idx" ON "InventoryConsumption"("recipeId");

-- CreateIndex
CREATE INDEX "InventoryConsumption_recipeIngredientId_idx" ON "InventoryConsumption"("recipeIngredientId");

-- CreateIndex
CREATE INDEX "InventoryConsumption_sourceType_idx" ON "InventoryConsumption"("sourceType");

-- CreateIndex
CREATE INDEX "InventoryConsumption_createdAt_idx" ON "InventoryConsumption"("createdAt");

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_yieldUnitId_fkey" FOREIGN KEY ("yieldUnitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryConsumption" ADD CONSTRAINT "InventoryConsumption_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryConsumption" ADD CONSTRAINT "InventoryConsumption_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryConsumption" ADD CONSTRAINT "InventoryConsumption_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryConsumption" ADD CONSTRAINT "InventoryConsumption_recipeIngredientId_fkey" FOREIGN KEY ("recipeIngredientId") REFERENCES "RecipeIngredient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryConsumption" ADD CONSTRAINT "InventoryConsumption_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
