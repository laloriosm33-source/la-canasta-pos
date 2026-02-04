import { Request, Response } from 'express';
import prisma from '../config/prisma';

// Get inventory for a specific branch
export const getInventoryByBranch = async (req: Request, res: Response) => {
    try {
        const { branchId } = req.params;
        const inventory = await prisma.productBranch.findMany({
            where: { branchId },
            include: { product: true }
        });
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching inventory' });
    }
};

// Set stock directly (initialization) or update
export const updateStock = async (req: Request, res: Response) => {
    try {
        const { branchId, productId, quantity } = req.body;

        const stock = await prisma.productBranch.upsert({
            where: {
                productId_branchId: {
                    branchId,
                    productId
                }
            },
            update: { quantity },
            create: {
                branchId,
                productId,
                quantity
            }
        });
        res.json(stock);
    } catch (error) {
        res.status(500).json({ error: 'Error updating stock' });
    }
};

// Adjust inventory (Mermas, correction, etc)
export const adjustInventory = async (req: Request, res: Response) => {
    try {
        const { branchId, productId, quantity, reason, userId } = req.body;

        // 1. Record the adjustment
        const adjustment = await prisma.inventoryAdjustment.create({
            data: {
                productId,
                userId,
                quantity,
                reason
            }
        });

        // 2. Update the actual stock
        // Note: quantity can be negative (loss) or positive (correction)
        // We need to fetch current stock first
        const currentStock = await prisma.productBranch.findUnique({
            where: {
                productId_branchId: {
                    branchId,
                    productId
                }
            }
        });

        const newQuantity = (Number(currentStock?.quantity || 0) + Number(quantity));

        await prisma.productBranch.upsert({
            where: {
                productId_branchId: {
                    branchId,
                    productId
                }
            },
            update: { quantity: newQuantity },
            create: {
                branchId,
                productId,
                quantity: newQuantity
            }
        });

        res.json(adjustment);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error adjusting inventory' });
    }
};

export const getInventoryHistory = async (req: Request, res: Response) => {
    try {
        const history = await prisma.inventoryAdjustment.findMany({
            include: {
                product: { select: { name: true, unit: true } },
                user: { select: { name: true } }
            },
            orderBy: { date: 'desc' },
            take: 50
        });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching history' });
    }
};
