
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Starting System Verification...");

    // 0. Clean (Optional, careful in prod)
    // await prisma.saleDetail.deleteMany();
    // await prisma.sale.deleteMany();
    // await prisma.kardex.deleteMany();
    // await prisma.creditPayment.deleteMany();

    // 1. Create Branch
    console.log("1. Checking Branches...");
    let branch = await prisma.branch.findFirst();
    if (!branch) {
        branch = await prisma.branch.create({
            data: { name: 'Test Branch', address: 'Test St 123' }
        });
        console.log("   ✅ Created Default Branch");
    } else {
        console.log("   ✅ Branch Exists");
    }

    if (!branch) throw new Error("Branch creation failed");

    // 2. Create Product
    console.log("2. Creating Product...");
    const product = await prisma.product.create({
        data: {
            name: `Test Prod ${Date.now()}`,
            code: `TP-${Date.now()}`,
            priceRetail: 100,
            cost: 50,
            categoryId: null, // Optional
            unit: 'unit'
        }
    });
    console.log(`   ✅ Product Created: ${product.name}`);

    // 3. Add Inventory
    console.log("3. Adding Inventory...");
    await prisma.productBranch.create({
        data: {
            productId: product.id,
            branchId: branch.id,
            quantity: 10
        }
    });
    console.log("   ✅ Inventory Added (10 units)");

    // 4. Create Customer
    console.log("4. Creating Customer...");
    const customer = await prisma.customer.create({
        data: {
            name: `Test Customer ${Date.now()}`,
            currentBalance: 0
        }
    });
    console.log(`   ✅ Customer Created: ${customer.name}`);

    // 5. Perform Credit Sale
    console.log("5. Performing Credit Sale (2 units @ $100)...");
    const saleTotal = 200;

    // Transaction simulate Sale Controller logic
    await prisma.$transaction(async (tx) => {
        // Sale Header
        const sale = await tx.saleHeader.create({
            data: {
                branchId: branch!.id,
                total: saleTotal,
                paymentMethod: 'CREDIT',
                status: 'COMPLETED',
                customerId: customer.id,
                userId: null // Guest
            }
        });

        // Loop items (1 item)
        await tx.saleDetail.create({
            data: {
                saleId: sale.id,
                productId: product.id,
                quantity: 2,
                unitPrice: 100,
                subtotal: 200
            }
        });

        // Update Stock
        await tx.productBranch.update({
            where: { productId_branchId: { branchId: branch!.id, productId: product.id } },
            data: { quantity: { decrement: 2 } }
        });

        // Update Customer Balance
        await tx.customer.update({
            where: { id: customer.id },
            data: { currentBalance: { increment: saleTotal } }
        });
    });
    console.log("   ✅ Sale Completed. Stock reduced, Debt increased.");

    // 6. Verify Post-Sale State
    const updatedCust = await prisma.customer.findUnique({ where: { id: customer.id } });
    const updatedStock = await prisma.productBranch.findUnique({ where: { productId_branchId: { branchId: branch.id, productId: product.id } } });

    console.log(`   🔎 Start Check: Balance=${updatedCust?.currentBalance} (Expected 200), Stock=${updatedStock?.quantity} (Expected 8)`);

    if (Number(updatedCust?.currentBalance) !== 200) throw new Error("Balance Mismatch!");
    if (Number(updatedStock?.quantity) !== 8) throw new Error("Stock Mismatch!");

    // 7. Pay Debt
    console.log("7. Paying Debt ($100 partial)...");
    const paymentAmount = 100;

    await prisma.$transaction(async (tx) => {
        await tx.creditPayment.create({
            data: {
                customerId: customer.id,
                amount: paymentAmount,
                paymentMethod: 'CASH'
            }
        });

        await tx.customer.update({
            where: { id: customer.id },
            data: { currentBalance: { decrement: paymentAmount } }
        });
    });

    const finalCust = await prisma.customer.findUnique({ where: { id: customer.id } });
    console.log(`   ✅ Payment Record. Final Balance: ${finalCust?.currentBalance} (Expected 100)`);

    if (Number(finalCust?.currentBalance) !== 100) throw new Error("Final Balance Mismatch!");

    console.log("🎉 SYSTEM VERIFICATION SUCCESSFUL! ALL SYSTEMS GO.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
