import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getTransfers = async (req: Request, res: Response) => {
    try {
        const transfers = await prisma.stockTransfer.findMany({
            include: {
                sourceBranch: true,
                destBranch: true,
                details: { include: { product: true } }
            },
            orderBy: { date: 'desc' }
        });
        res.json(transfers);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching transfers' });
    }
};

export const createTransfer = async (req: Request, res: Response) => {
    try {
        const { sourceBranchId, destBranchId, details } = req.body;
        // details: [{ productId, quantity }]

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Transfer Record
            const transfer = await tx.stockTransfer.create({
                data: {
                    sourceBranchId,
                    destBranchId,
                    status: 'PENDING',
                    details: {
                        create: details.map((d: any) => ({
                            productId: d.productId,
                            quantity: d.quantity
                        }))
                    }
                }
            });

            // 2. Discount from source branch immediately
            for (const item of details) {
                await tx.productBranch.update({
                    where: {
                        productId_branchId: {
                            productId: item.productId,
                            branchId: sourceBranchId
                        }
                    },
                    data: {
                        quantity: { decrement: item.quantity }
                    }
                });
            }

            return transfer;
        });

        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error creating transfer' });
    }
};

export const completeTransfer = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const transfer = await prisma.stockTransfer.findUnique({
            where: { id },
            include: { details: true }
        });

        if (!transfer) return res.status(404).json({ error: 'Transfer not found' });
        if (transfer.status !== 'PENDING') return res.status(400).json({ error: 'Transfer already processed' });

        await prisma.$transaction(async (tx) => {
            // 1. Update status
            await tx.stockTransfer.update({
                where: { id },
                data: { status: 'COMPLETED' }
            });

            // 2. Add to destination branch
            for (const item of transfer.details) {
                await tx.productBranch.upsert({
                    where: {
                        productId_branchId: {
                            productId: item.productId,
                            branchId: transfer.destBranchId
                        }
                    },
                    update: {
                        quantity: { increment: item.quantity }
                    },
                    create: {
                        productId: item.productId,
                        branchId: transfer.destBranchId,
                        quantity: item.quantity
                    }
                });
            }
        });

        res.json({ message: 'Transfer completed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error completing transfer' });
    }
};

export const cancelTransfer = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const transfer = await prisma.stockTransfer.findUnique({
            where: { id },
            include: { details: true }
        });

        if (!transfer) return res.status(404).json({ error: 'Transfer not found' });
        if (transfer.status !== 'PENDING') return res.status(400).json({ error: 'Cannot cancel non-pending transfer' });

        await prisma.$transaction(async (tx) => {
            // 1. Update status
            await tx.stockTransfer.update({
                where: { id },
                data: { status: 'CANCELLED' }
            });

            // 2. Return to source branch
            for (const item of transfer.details) {
                await tx.productBranch.update({
                    where: {
                        productId_branchId: {
                            productId: item.productId,
                            branchId: transfer.sourceBranchId
                        }
                    },
                    data: {
                        quantity: { increment: item.quantity }
                    }
                });
            }
        });

        res.json({ message: 'Transfer cancelled' });
    } catch (error) {
        res.status(500).json({ error: 'Error cancelling transfer' });
    }
};
