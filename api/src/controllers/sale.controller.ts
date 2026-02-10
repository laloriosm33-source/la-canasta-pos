import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { logAction } from './system.controller';

export const getSales = async (req: Request, res: Response) => {
    try {
        const sales = await prisma.saleHeader.findMany({
            include: {
                user: true,
                branch: true,
                customer: true,
                details: {
                    include: {
                        product: {
                            include: { category: true }
                        }
                    }
                }
            },
            orderBy: { date: 'desc' }
        });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching sales' });
    }
};

export const getSaleById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const sale = await prisma.saleHeader.findUnique({
            where: { id },
            include: { user: true, branch: true, customer: true, details: { include: { product: true } } }
        });
        if (!sale) return res.status(404).json({ error: 'Sale not found' });
        res.json(sale);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching sale' });
    }
};

export const createSale = async (req: Request, res: Response) => {
    try {
        const { branchId, userId, shiftId, customerId, total, paymentMethod, details } = req.body;
        // details: [{ productId, quantity, unitPrice, subtotal }]

        // Use transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Sale Header
            const sale = await tx.saleHeader.create({
                data: {
                    branchId,
                    userId,
                    shiftId,
                    customerId,
                    total,
                    paymentMethod,
                    status: 'COMPLETED',
                    details: {
                        create: details.map((d: any) => ({
                            productId: d.productId,
                            quantity: d.quantity,
                            unitPrice: d.unitPrice,
                            subtotal: d.subtotal
                        }))
                    }
                },
                include: { details: true }
            });

            // 2. Update Inventory
            for (const item of details) {
                // Check if product exists in branch first (Upsert logic or check)
                const currentStock = await tx.productBranch.findUnique({
                    where: {
                        productId_branchId: {
                            branchId,
                            productId: item.productId
                        }
                    }
                });

                if (!currentStock) {
                    throw new Error(`Product ${item.productId} not found in branch ${branchId}`);
                }

                if (Number(currentStock.quantity) < Number(item.quantity)) {
                    // Depending on policy, we might allow negative stock or block it. 
                    // For now, let's allow it but maybe warn? Or strictly:
                    // throw new Error(`Insufficient stock for product ${item.productId}`);
                }

                await tx.productBranch.update({
                    where: {
                        productId_branchId: {
                            branchId,
                            productId: item.productId
                        }
                    },
                    data: {
                        quantity: { decrement: item.quantity }
                    }
                });
            }

            // 3. Update Customer Balance if CREDIT
            if (paymentMethod === 'CREDIT' && customerId) {
                await tx.customer.update({
                    where: { id: customerId },
                    data: {
                        currentBalance: { increment: total }
                    }
                });
            }

            return sale;
        });

        // 4. Log Action
        await logAction(userId, 'VENTA_REALIZADA', `Venta con éxito por un total de $${total} - ID: ${result.id}`);

        res.status(201).json(result);

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Error processing sale' });
    }
};
