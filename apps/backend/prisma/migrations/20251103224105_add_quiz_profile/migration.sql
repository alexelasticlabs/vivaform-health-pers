-- CreateTable
CREATE TABLE "QuizProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "answers" JSONB NOT NULL,
    "dietPlan" TEXT,
    "heightCm" DOUBLE PRECISION,
    "weightKg" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "goalType" TEXT,
    "goalDeltaKg" DOUBLE PRECISION,
    "etaMonths" INTEGER,
    "mealsPerDay" INTEGER,
    "cookingTimeMinutes" INTEGER,
    "exerciseRegularly" BOOLEAN,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuizProfile_userId_key" ON "QuizProfile"("userId");

-- CreateIndex
CREATE INDEX "QuizProfile_userId_idx" ON "QuizProfile"("userId");

-- CreateIndex
CREATE INDEX "QuizProfile_clientId_idx" ON "QuizProfile"("clientId");

-- AddForeignKey
ALTER TABLE "QuizProfile" ADD CONSTRAINT "QuizProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
