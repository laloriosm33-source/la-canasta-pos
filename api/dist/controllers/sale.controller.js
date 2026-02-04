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
exports.createSale = exports.getSaleById = exports.getSales = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getSales = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sales = yield prisma_1.default.saleHeader.findMany({
            include: { user: true, branch: true, customer: true, details: true },
            orderBy: { date: 'desc' }
        });
        res.json(sales);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching sales' });
    }
});
exports.getSales = getSales;
const getSaleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const sale = yield prisma_1.default.saleHeader.findUnique({
            where: { id },
            include: { user: true, branch: true, customer: true, details: { include: { product: true } } }
        });
        if (!sale)
            return res.status(404).json({ error: 'Sale not found' });
        res.json(sale);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching sale' });
    }
});
exports.getSaleById = getSaleById;
const createSale = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { branchId, userId, customerId, total, paymentMethod, details } = req.body;
        // details: [{ productId, quantity, unitPrice, subtotal }]
        // Use transaction
        const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Create Sale Header
            const sale = yield tx.saleHeader.create({
                data: {
                    branchId,
                    userId,
                    customerId,
                    total,
                    paymentMethod,
                    status: 'COMPLETED',
                    details: {
                        create: details.map((d) => ({
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
                const currentStock = yield tx.productBranch.findUnique({
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
                yield tx.productBranch.update({
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
                yield tx.customer.update({
                    where: { id: customerId },
                    data: {
                        currentBalance: { increment: total }
                    }
                });
            }
            return sale;
        }));
        res.status(201).json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Error processing sale' });
    }
});
exports.createSale = createSale;
