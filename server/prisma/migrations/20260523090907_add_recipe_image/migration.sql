-- CreateEnum
CREATE TYPE "RecipeCategory" AS ENUM ('APPETIZER', 'MAIN', 'SIDE', 'SALAD', 'SOUP', 'BREAKFAST', 'SNACK', 'DESSERT', 'DRINK', 'OTHER');

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "category" "RecipeCategory" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "imageUrl" TEXT;

-- CreateIndex
CREATE INDEX "Recipe_category_idx" ON "Recipe"("category");
