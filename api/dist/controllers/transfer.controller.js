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
exports.cancelTransfer = exports.completeTransfer = exports.createTransfer = exports.getTransfers = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getTransfers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transfers = yield prisma_1.default.stockTransfer.findMany({
            include: {
                sourceBranch: true,
                destBranch: true,
                details: { include: { product: true } }
            },
            orderBy: { date: 'desc' }
        });
        res.json(transfers);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching transfers' });
    }
});
exports.getTransfers = getTransfers;
const createTransfer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sourceBranchId, destBranchId, details } = req.body;
        // details: [{ productId, quantity }]
        const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Create Transfer Record
            const transfer = yield tx.stockTransfer.create({
                data: {
                    sourceBranchId,
                    destBranchId,
                    status: 'PENDING',
                    details: {
                        create: details.map((d) => ({
                            productId: d.productId,
                            quantity: d.quantity
                        }))
                    }
                }
            });
            // 2. Discount from source branch immediately
            for (const item of details) {
                yield tx.productBranch.update({
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
        }));
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Error creating transfer' });
    }
});
exports.createTransfer = createTransfer;
const completeTransfer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const transfer = yield prisma_1.default.stockTransfer.findUnique({
            where: { id },
            include: { details: true }
        });
        if (!transfer)
            return res.status(404).json({ error: 'Transfer not found' });
        if (transfer.status !== 'PENDING')
            return res.status(400).json({ error: 'Transfer already processed' });
        yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Update status
            yield tx.stockTransfer.update({
                where: { id },
                data: { status: 'COMPLETED' }
            });
            // 2. Add to destination branch
            for (const item of transfer.details) {
                yield tx.productBranch.upsert({
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
        }));
        res.json({ message: 'Transfer completed successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error completing transfer' });
    }
});
exports.completeTransfer = completeTransfer;
const cancelTransfer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const transfer = yield prisma_1.default.stockTransfer.findUnique({
            where: { id },
            include: { details: true }
        });
        if (!transfer)
            return res.status(404).json({ error: 'Transfer not found' });
        if (transfer.status !== 'PENDING')
            return res.status(400).json({ error: 'Cannot cancel non-pending transfer' });
        yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Update status
            yield tx.stockTransfer.update({
                where: { id },
                data: { status: 'CANCELLED' }
            });
            // 2. Return to source branch
            for (const item of transfer.details) {
                yield tx.productBranch.update({
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
        }));
        res.json({ message: 'Transfer cancelled' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error cancelling transfer' });
    }
});
exports.cancelTransfer = cancelTransfer;
