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
exports.adjustInventory = exports.updateStock = exports.getInventoryByBranch = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
// Get inventory for a specific branch
const getInventoryByBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { branchId } = req.params;
        const inventory = yield prisma_1.default.productBranch.findMany({
            where: { branchId },
            include: { product: true }
        });
        res.json(inventory);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching inventory' });
    }
});
exports.getInventoryByBranch = getInventoryByBranch;
// Set stock directly (initialization) or update
const updateStock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { branchId, productId, quantity } = req.body;
        const stock = yield prisma_1.default.productBranch.upsert({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating stock' });
    }
});
exports.updateStock = updateStock;
// Adjust inventory (Mermas, correction, etc)
const adjustInventory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { branchId, productId, quantity, reason, userId } = req.body;
        // 1. Record the adjustment
        const adjustment = yield prisma_1.default.inventoryAdjustment.create({
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
        const currentStock = yield prisma_1.default.productBranch.findUnique({
            where: {
                productId_branchId: {
                    branchId,
                    productId
                }
            }
        });
        const newQuantity = (Number((currentStock === null || currentStock === void 0 ? void 0 : currentStock.quantity) || 0) + Number(quantity));
        yield prisma_1.default.productBranch.upsert({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error adjusting inventory' });
    }
});
exports.adjustInventory = adjustInventory;
