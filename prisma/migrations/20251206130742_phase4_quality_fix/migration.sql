-- CreateTable
CREATE TABLE "ApiFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "apiId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "badge" TEXT,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApiFeedback_apiId_fkey" FOREIGN KEY ("apiId") REFERENCES "Api" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ApiFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Api" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "longDescription" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subCategory" TEXT,
    "tags" TEXT NOT NULL,
    "pricingType" TEXT NOT NULL,
    "regionSupport" TEXT,
    "dxScore" INTEGER NOT NULL DEFAULT 0,
    "popularityScore" INTEGER NOT NULL DEFAULT 0,
    "logoUrl" TEXT,
    "logoSymbol" TEXT,
    "docsUrl" TEXT NOT NULL,
    "providerUrl" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "confidenceScore" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "uptimeSla" TEXT,
    "sampleEndpointUrl" TEXT,
    "playgroundExampleResponse" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "status" TEXT NOT NULL DEFAULT 'active',
    "affiliateUrl" TEXT,
    "referralNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastChecked" DATETIME,
    "latency" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Api" ("affiliateUrl", "category", "confidenceScore", "createdAt", "docsUrl", "dxScore", "featured", "id", "logoSymbol", "logoUrl", "longDescription", "name", "playgroundExampleResponse", "popularityScore", "pricingType", "providerName", "providerUrl", "rating", "referralNote", "regionSupport", "reviewCount", "sampleEndpointUrl", "shortDescription", "slug", "source", "status", "subCategory", "tags", "updatedAt", "uptimeSla") SELECT "affiliateUrl", "category", "confidenceScore", "createdAt", "docsUrl", "dxScore", "featured", "id", "logoSymbol", "logoUrl", "longDescription", "name", "playgroundExampleResponse", "popularityScore", "pricingType", "providerName", "providerUrl", "rating", "referralNote", "regionSupport", "reviewCount", "sampleEndpointUrl", "shortDescription", "slug", "source", "status", "subCategory", "tags", "updatedAt", "uptimeSla" FROM "Api";
DROP TABLE "Api";
ALTER TABLE "new_Api" RENAME TO "Api";
CREATE UNIQUE INDEX "Api_slug_key" ON "Api"("slug");
CREATE INDEX "Api_category_idx" ON "Api"("category");
CREATE INDEX "Api_pricingType_idx" ON "Api"("pricingType");
CREATE INDEX "Api_status_idx" ON "Api"("status");
CREATE INDEX "Api_featured_idx" ON "Api"("featured");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ApiFeedback_userId_apiId_key" ON "ApiFeedback"("userId", "apiId");
