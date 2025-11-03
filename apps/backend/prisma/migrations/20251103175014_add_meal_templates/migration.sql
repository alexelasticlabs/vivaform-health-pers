-- CreateTable
CREATE TABLE "MealTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "dietPlans" TEXT[],
    "calories" INTEGER NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "cookingTimeMinutes" INTEGER NOT NULL,
    "complexity" TEXT NOT NULL,
    "allergens" TEXT[],
    "avoidedIngredients" TEXT[],
    "ingredients" TEXT[],
    "instructions" TEXT,
    "servings" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MealTemplate_category_idx" ON "MealTemplate"("category");

-- CreateIndex
CREATE INDEX "MealTemplate_dietPlans_idx" ON "MealTemplate"("dietPlans");
