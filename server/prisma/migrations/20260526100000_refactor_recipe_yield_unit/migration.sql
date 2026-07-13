-- Refactor Recipe yield unit from MeasurementUnit relation -> dedicated enum

-- CreateEnum
CREATE TYPE "RecipeYieldUnit" AS ENUM (
  'PORTION',
  'PLATE',
  'BOWL',
  'CUP',
  'PIECE',
  'TRAY',
  'BOTTLE',
  'BATCH',
  'LITER',
  'KILOGRAM'
);

-- Add new yieldUnit column with default
ALTER TABLE "Recipe"
ADD COLUMN "yieldUnit" "RecipeYieldUnit" NOT NULL DEFAULT 'PORTION';

-- Migrate existing rows based on prior yieldUnitId -> MeasurementUnit.symbol
UPDATE "Recipe" r
SET "yieldUnit" = CASE
  WHEN mu."symbol" = 'kg' THEN 'KILOGRAM'::"RecipeYieldUnit"
  WHEN mu."symbol" = 'l' THEN 'LITER'::"RecipeYieldUnit"
  WHEN mu."symbol" = 'piece' THEN 'PIECE'::"RecipeYieldUnit"
  ELSE 'PORTION'::"RecipeYieldUnit"
END
FROM "MeasurementUnit" mu
WHERE r."yieldUnitId" = mu."id";

-- Drop old FK + column
ALTER TABLE "Recipe" DROP CONSTRAINT "Recipe_yieldUnitId_fkey";
ALTER TABLE "Recipe" DROP COLUMN "yieldUnitId";
