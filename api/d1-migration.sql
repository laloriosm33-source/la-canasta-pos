-- La Canasta ERP - Simplified D1 Migration
-- Step 1: Create all tables without foreign keys

-- Core tables first
CREATE TABLE IF NOT EXISTS "Branch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT
);

CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "Provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "rfc" TEXT,
    "address" TEXT
);

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "permissions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "branchId" TEXT
);

CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "cost" REAL,
    "priceRetail" REAL,
    "priceWholesale" REAL,
    "unit" TEXT NOT NULL,
    "isActive" INTEGER NOT NULL DEFAULT 1,
    "minStock" REAL DEFAULT 0,
    "expiresAt" DATETIME,
    "providerId" TEXT,
    "categoryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "ProductBranch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "quantity" REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "rfc" TEXT,
    "taxRegime" TEXT,
    "address" TEXT,
    "zipCode" TEXT,
    "creditLimit" REAL NOT NULL DEFAULT 0,
    "currentBalance" REAL NOT NULL DEFAULT 0,
    "branchId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "EmployeeShift" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "initialCash" REAL NOT NULL,
    "finalCashExpected" REAL,
    "finalCashActual" REAL,
    "difference" REAL
);

CREATE TABLE IF NOT EXISTS "SaleHeader" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" REAL NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "userId" TEXT,
    "shiftId" TEXT,
    "customerId" TEXT
);

CREATE TABLE IF NOT EXISTS "SaleDetail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "subtotal" REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS "Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "imageUrl" TEXT,
    "branchId" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "Purchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "CreditPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" REAL NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "saleId" TEXT
);

CREATE TABLE IF NOT EXISTS "CashCount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shiftId" TEXT NOT NULL,
    "denomination" REAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "type" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "CashMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "reason" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "InventoryAdjustment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantity" REAL NOT NULL,
    "reason" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "SystemLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "userId" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "StockTransfer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sourceBranchId" TEXT NOT NULL,
    "destBranchId" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "StockTransferDetail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transferId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS "SystemSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL UNIQUE,
    "value" TEXT NOT NULL
);

-- Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Product_code_key" ON "Product"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "ProductBranch_productId_branchId_key" ON "ProductBranch"("productId", "branchId");
CREATE UNIQUE INDEX IF NOT EXISTS "SystemSetting_key_key" ON "SystemSetting"("key");
