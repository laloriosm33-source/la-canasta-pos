import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { logAction } from './system.controller';

// --- Cash Movements ---
export const getCashMovements = async (req: Request, res: Response) => {
    try {
        const { branchId } = req.query;
        const movements = await prisma.cashMovement.findMany({
            where: branchId ? { branchId: String(branchId) } : {},
            include: { user: true, branch: true },
            orderBy: { date: 'desc' }
        });
        res.json(movements);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching cash movements' });
    }
};

export const createCashMovement = async (req: Request, res: Response) => {
    try {
        const { type, amount, reason, branchId, userId } = req.body;
        const movement = await prisma.cashMovement.create({
            data: { type, amount, reason, branchId, userId }
        });
        await logAction(userId, 'FLUJO_CAJA', `${type}: $${amount} - ${reason}`);
        res.status(201).json(movement);
    } catch (error) {
        res.status(500).json({ error: 'Error creating cash movement' });
    }
};

// --- Shifts ---
export const getShifts = async (req: Request, res: Response) => {
    try {
        const { branchId } = req.query;
        const shifts = await prisma.employeeShift.findMany({
            where: branchId ? { user: { branchId: String(branchId) } } : {},
            include: { user: true, cashCounts: true },
            orderBy: { startTime: 'desc' }
        });
        res.json(shifts);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching shifts' });
    }
};

export const openShift = async (req: Request, res: Response) => {
    try {
        const { userId, initialCash } = req.body;

        // Close any existing open shift for this user first
        await prisma.employeeShift.updateMany({
            where: { userId, endTime: null },
            data: { endTime: new Date() }
        });

        const shift = await prisma.employeeShift.create({
            data: {
                userId,
                initialCash,
                startTime: new Date()
            }
        });
        await logAction(userId, 'TURNO_ABIERTO', `Inicio jornada con fondo de $${initialCash}`);
        res.status(201).json(shift);
    } catch (error) {
        res.status(500).json({ error: 'Error opening shift' });
    }
};

export const closeShift = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { finalCashActual } = req.body;

        const shift = await prisma.employeeShift.findUnique({
            where: { id },
            include: { user: true }
        });
        if (!shift) return res.status(404).json({ error: 'Turno no encontrado' });

        // 1. Get CASH Sales during shift
        const sales = await prisma.saleHeader.findMany({
            where: {
                userId: shift.userId,
                date: { gte: shift.startTime, lte: new Date() },
                paymentMethod: 'CASH',
                status: 'COMPLETED'
            }
        });
        const totalSales = sales.reduce((acc, s) => acc + Number(s.total), 0);

        // 2. Get Cash Movements (IN/OUT)
        const movements = await prisma.cashMovement.findMany({
            where: {
                userId: shift.userId,
                date: { gte: shift.startTime, lte: new Date() }
            }
        });
        const totalMovements = movements.reduce((acc, m) => {
            return acc + (m.type === 'IN' ? Number(m.amount) : -Number(m.amount));
        }, 0);

        const expected = Number(shift.initialCash) + totalSales + totalMovements;
        const difference = Number(finalCashActual) - expected;

        const updatedShift = await prisma.employeeShift.update({
            where: { id },
            data: {
                endTime: new Date(),
                finalCashExpected: expected,
                finalCashActual,
                difference
            }
        });
        await logAction(shift.userId, 'TURNO_CERRADO', `Fin jornada. Efectivo: $${finalCashActual}. Diferencia: $${difference}`);
        res.json(updatedShift);
    } catch (error) {
        res.status(500).json({ error: 'Error al cerrar turno y calcular balance' });
    }
};

// --- Expenses ---
export const getExpenses = async (req: Request, res: Response) => {
    try {
        const { branchId } = req.query;
        const expenses = await prisma.expense.findMany({
            where: branchId ? { branchId: String(branchId) } : {},
            include: { branch: true },
            orderBy: { date: 'desc' }
        });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching expenses' });
    }
};

export const createExpense = async (req: Request, res: Response) => {
    try {
        const { amount, description, category, branchId } = req.body;
        const expense = await prisma.expense.create({
            data: { amount, description, category, branchId }
        });
        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ error: 'Error creating expense' });
    }
};
