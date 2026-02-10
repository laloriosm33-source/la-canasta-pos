"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExpense = exports.getExpenses = exports.closeShift = exports.openShift = exports.getShifts = exports.createCashMovement = exports.getCashMovements = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const system_controller_1 = require("./system.controller");
// --- Cash Movements ---
const getCashMovements = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { branchId } = req.query;
        const movements = yield prisma_1.default.cashMovement.findMany({
            where: branchId ? { branchId: String(branchId) } : {},
            include: { user: true, branch: true },
            orderBy: { date: 'desc' }
        });
        res.json(movements);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching cash movements' });
    }
});
exports.getCashMovements = getCashMovements;
const createCashMovement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, amount, reason, branchId, userId } = req.body;
        const movement = yield prisma_1.default.cashMovement.create({
            data: { type, amount, reason, branchId, userId }
        });
        yield (0, system_controller_1.logAction)(userId, 'FLUJO_CAJA', `${type}: $${amount} - ${reason}`);
        res.status(201).json(movement);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating cash movement' });
    }
});
exports.createCashMovement = createCashMovement;
// --- Shifts ---
const getShifts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { branchId } = req.query;
        const shifts = yield prisma_1.default.employeeShift.findMany({
            where: branchId ? { user: { branchId: String(branchId) } } : {},
            include: { user: true, cashCounts: true },
            orderBy: { startTime: 'desc' }
        });
        res.json(shifts);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching shifts' });
    }
});
exports.getShifts = getShifts;
const openShift = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, initialCash } = req.body;
        // Close any existing open shift for this user first
        yield prisma_1.default.employeeShift.updateMany({
            where: { userId, endTime: null },
            data: { endTime: new Date() }
        });
        const shift = yield prisma_1.default.employeeShift.create({
            data: {
                userId,
                initialCash,
                startTime: new Date()
            }
        });
        yield (0, system_controller_1.logAction)(userId, 'TURNO_ABIERTO', `Inicio jornada con fondo de $${initialCash}`);
        res.status(201).json(shift);
    }
    catch (error) {
        res.status(500).json({ error: 'Error opening shift' });
    }
});
exports.openShift = openShift;
const closeShift = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { finalCashActual } = req.body;
        const shift = yield prisma_1.default.employeeShift.findUnique({
            where: { id },
            include: { user: true }
        });
        if (!shift)
            return res.status(404).json({ error: 'Turno no encontrado' });
        // 1. Get CASH Sales during shift
        const sales = yield prisma_1.default.saleHeader.findMany({
            where: {
                userId: shift.userId,
                date: { gte: shift.startTime, lte: new Date() },
                paymentMethod: 'CASH',
                status: 'COMPLETED'
            }
        });
        const totalSales = sales.reduce((acc, s) => acc + Number(s.total), 0);
        // 2. Get Cash Movements (IN/OUT)
        const movements = yield prisma_1.default.cashMovement.findMany({
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
        const updatedShift = yield prisma_1.default.employeeShift.update({
            where: { id },
            data: {
                endTime: new Date(),
                finalCashExpected: expected,
                finalCashActual,
                difference
            }
        });
        yield (0, system_controller_1.logAction)(shift.userId, 'TURNO_CERRADO', `Fin jornada. Efectivo: $${finalCashActual}. Diferencia: $${difference}`);
        res.json(updatedShift);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al cerrar turno y calcular balance' });
    }
});
exports.closeShift = closeShift;
// --- Expenses ---
const getExpenses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { branchId } = req.query;
        const expenses = yield prisma_1.default.expense.findMany({
            where: branchId ? { branchId: String(branchId) } : {},
            include: { branch: true },
            orderBy: { date: 'desc' }
        });
        res.json(expenses);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching expenses' });
    }
});
exports.getExpenses = getExpenses;
const createExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, description, category, branchId } = req.body;
        const expense = yield prisma_1.default.expense.create({
            data: { amount, description, category, branchId }
        });
        res.status(201).json(expense);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating expense' });
    }
});
exports.createExpense = createExpense;
