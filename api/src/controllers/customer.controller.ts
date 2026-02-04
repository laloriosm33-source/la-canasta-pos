import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getCustomers = async (req: Request, res: Response) => {
    try {
        const { branchId } = req.query;
        const customers = await prisma.customer.findMany({
            where: branchId ? { branchId: String(branchId) } : {},
            include: { branch: true }
        });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching customers' });
    }
};

export const createCustomer = async (req: Request, res: Response) => {
    try {
        const { name, phone, email, rfc, taxRegime, address, zipCode, creditLimit, branchId } = req.body;
        const customer = await prisma.customer.create({
            data: { name, phone, email, rfc, taxRegime, address, zipCode, creditLimit, branchId }
        });
        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({ error: 'Error creating customer' });
    }
};

export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const customer = await prisma.customer.update({
            where: { id },
            data
        });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: 'Error updating customer' });
    }
};

export const recordPayment = async (req: Request, res: Response) => {
    try {
        const { customerId, amount, paymentMethod } = req.body;

        const result = await prisma.$transaction(async (tx) => {
            // Create payment record
            const payment = await tx.creditPayment.create({
                data: {
                    customerId,
                    amount,
                    paymentMethod
                }
            });

            // Update customer balance (decrement debt)
            await tx.customer.update({
                where: { id: customerId },
                data: {
                    currentBalance: { decrement: amount }
                }
            });

            return payment;
        });

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error recording payment' });
    }
};

export const deleteCustomer = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.customer.delete({ where: { id } });
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting customer' });
    }
};
