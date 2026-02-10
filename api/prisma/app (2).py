generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// --- Users & Auth ---
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      String   // ADMIN, MANAGER, CASHIER
  permissions String? // Comma separated: "POS,INVENTORY,CUSTOMERS,SETTINGS"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  branchId   String?
  branch     Branch?  @relation(fields: [branchId], references: [id])

  shifts             EmployeeShift[]
  sales              SaleHeader[]
  inventoryAdjustments InventoryAdjustment[]
  systemLogs         SystemLog[]
  cashMovements       CashMovement[]
}

// --- Products & Inventory ---
model Product {
  id             String   @id @default(uuid())
  name           String
  code           String?  @unique // Barcode/QR
  cost           Decimal?
  priceRetail    Decimal?
  priceWholesale Decimal?
  unit           String   // "kg", "unit", "piece"
  isActive       Boolean  @default(true)
  minStock       Decimal? @default(0)
  expiresAt      DateTime?
  
  providerId     String?
  provider       Provider? @relation(fields: [providerId], references: [id])
  
  categoryId     String?
  category       Category? @relation(fields: [categoryId], references: [id])
  
  inventory      ProductBranch[]
  saleDetails    SaleDetail[]
  adjustments    InventoryAdjustment[]
  transferDetails StockTransferDetail[]

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Category {
  id       String    @id @default(uuid())
  name     String
  products Product[]
}

model Provider {
  id        String     @id @default(uuid())
  name      String
  contact   String?
  phone     String?
  email     String?
  rfc       String?
  address   String?
  products  Product[]
  purchases Purchase[]
}

model Branch {
  id        String   @id @default(uuid())
  name      String
  address   String?
  phone     String?
  
  inventory ProductBranch[]
  sales     SaleHeader[]
  expenses  Expense[]
  purchases Purchase[]
  cashMovements CashMovement[]
  customers Customer[]
  users     User[]
  
  sentTransfers     StockTransfer[] @relation("SourceBranch")
  receivedTransfers StockTransfer[] @relation("DestBranch")
}

model ProductBranch {
  id        String  @id @default(uuid())
  productId String
  branchId  String
  quantity  Decimal // Support decimal for kg
  
  product   Product @relation(fields: [productId], references: [id])
  branch    Branch  @relation(fields: [branchId], references: [id])

  @@unique([productId, branchId])
}

// --- Sales & Customers ---
model Customer {
  id             String   @id @default(uuid())
  name           String
  phone          String?
  email          String?
  rfc            String?  // Tax ID
  taxRegime      String?
  address        String?
  zipCode        String?
  creditLimit    Decimal  @default(0)
  currentBalance Decimal  @default(0)
  
  branchId       String?
  branch         Branch?  @relation(fields: [branchId], references: [id])
  
  sales          SaleHeader[]
  creditPayments CreditPayment[]
  createdAt      DateTime @default(now())
}

model SaleHeader {
  id            String   @id @default(uuid())
  date          DateTime @default(now())
  total         Decimal
  paymentMethod String   // CASH, CARD, CREDIT, TRANSFER
  status        String   // COMPLETED, CANCELLED, PENDING
  
  branchId      String
  branch        Branch   @relation(fields: [branchId], references: [id])
  
  userId        String?
  user          User?    @relation(fields: [userId], references: [id])
  
  shiftId       String?
  shift         EmployeeShift? @relation(fields: [shiftId], references: [id])

  customerId    String?
  customer      Customer? @relation(fields: [customerId], references: [id])
  
  details       SaleDetail[]
  creditPayment CreditPayment[] // If sale is linked to a payment (rare but possible) or vice versa
}

model SaleDetail {
  id        String  @id @default(uuid())
  saleId    String
  sale      SaleHeader @relation(fields: [saleId], references: [id])
  
  productId String
  product   Product @relation(fields: [productId], references: [id])
  
  quantity  Decimal
  unitPrice Decimal
  subtotal  Decimal
}

// --- Finance & Operations ---
model Expense {
  id          String   @id @default(uuid())
  date        DateTime @default(now())
  amount      Decimal
  description String
  category    String   // "Rent", "Utilities", "Payroll"
  imageUrl    String?
  
  branchId    String
  branch      Branch   @relation(fields: [branchId], references: [id])
}

model Purchase {
  id         String   @id @default(uuid())
  date       DateTime @default(now())
  total      Decimal
  status     String   // RECEIVED, PENDING
  
  providerId String
  provider   Provider @relation(fields: [providerId], references: [id])
  
  branchId   String
  branch     Branch   @relation(fields: [branchId], references: [id])
}

model CreditPayment {
  id            String   @id @default(uuid())
  date          DateTime @default(now())
  amount        Decimal
  paymentMethod String
  
  customerId    String
  customer      Customer @relation(fields: [customerId], references: [id])
  
  saleId        String? // Optional link to specific sale
  sale          SaleHeader? @relation(fields: [saleId], references: [id])
}

model EmployeeShift {
  id                String   @id @default(uuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id])
  
  startTime         DateTime @default(now())
  endTime           DateTime?
  
  initialCash       Decimal
  finalCashExpected Decimal?
  finalCashActual   Decimal?
  difference        Decimal?
  
  cashCounts        CashCount[]
  sales             SaleHeader[]
}

model CashCount {
  id           String   @id @default(uuid())
  shiftId      String
  shift        EmployeeShift @relation(fields: [shiftId], references: [id])
  
  denomination Decimal // 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5
  quantity     Int
  type         String   // "OPENING", "CLOSING"
}

model CashMovement {
    id String @id @default(uuid())
    type String // IN / OUT
    amount Decimal
    reason String
    date DateTime @default(now())
    
    userId String
    user User @relation(fields: [userId], references: [id])
    
    branchId String
    branch Branch @relation(fields: [branchId], references: [id])
}

model InventoryAdjustment {
  id        String   @id @default(uuid())
  date      DateTime @default(now())
  quantity  Decimal
  reason    String   // "Damage", "Theft", "Expired", "Correction" (Mermas)
  
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  
  userId    String
  user      User     @relation(fields: [userId], references: [id])
}

model SystemLog {
  id        String   @id @default(uuid())
  date      DateTime @default(now())
  action    String
  details   String?
  
  userId    String
  user      User     @relation(fields: [userId], references: [id])
}

model StockTransfer {
  id              String   @id @default(uuid())
  date            DateTime @default(now())
  status          String   @default("PENDING") // PENDING, COMPLETED, CANCELLED
  
  sourceBranchId  String
  sourceBranch    Branch   @relation("SourceBranch", fields: [sourceBranchId], references: [id])
  
  destBranchId    String
  destBranch      Branch   @relation("DestBranch", fields: [destBranchId], references: [id])
  
  details         StockTransferDetail[]
}

model StockTransferDetail {
  id              String   @id @default(uuid())
  transferId      String
  transfer        StockTransfer @relation(fields: [transferId], references: [id])
  
  productId       String
  product         Product  @relation(fields: [productId], references: [id])
  
  quantity        Decimal
}

model SystemSetting {
  id    String @id @default(uuid())
  key   String @unique
  value String
}
