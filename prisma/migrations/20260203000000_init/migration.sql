-- CreateTable
CREATE TABLE "Entry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "weightKg" REAL,
    "trainedBjj" BOOLEAN NOT NULL DEFAULT false,
    "wentGym" BOOLEAN NOT NULL DEFAULT false,
    "ratingStars" INTEGER,
    "bjjComment" TEXT,
    "gymComment" TEXT,
    "ratingComment" TEXT,
    "bjjRatingStars" INTEGER,
    "gymRatingStars" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
    -- AlterTable
);

-- CreateIndex
CREATE UNIQUE INDEX "Entry_date_key" ON "Entry"("date");
