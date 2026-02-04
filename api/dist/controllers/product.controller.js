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
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield prisma_1.default.product.findMany({
            where: { isActive: true },
            include: {
                category: true,
                provider: true,
                inventory: {
                    include: { branch: true }
                }
            }
        });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
    }
});
exports.getProducts = getProducts;
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield prisma_1.default.product.findUnique({
            where: { id },
            include: { category: true, provider: true }
        });
        if (!product)
            return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching product' });
    }
});
exports.getProductById = getProductById;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, code, cost, priceRetail, priceWholesale, unit, categoryId, providerId, minStock, expiresAt } = req.body;
        // Check if code exists (only if code is provided)
        if (code) {
            const existing = yield prisma_1.default.product.findUnique({ where: { code } });
            if (existing)
                return res.status(400).json({ error: 'Product code already exists' });
        }
        const product = yield prisma_1.default.product.create({
            data: {
                name,
                code,
                cost,
                priceRetail,
                priceWholesale,
                unit,
                categoryId,
                providerId,
                minStock,
                expiresAt: expiresAt ? new Date(expiresAt) : null
            }
        });
        res.status(201).json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating product' });
    }
});
exports.createProduct = createProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, code, cost, priceRetail, priceWholesale, unit, categoryId, providerId, minStock, expiresAt, isActive } = req.body;
        const product = yield prisma_1.default.product.update({
            where: { id },
            data: {
                name,
                code,
                cost,
                priceRetail,
                priceWholesale,
                unit,
                categoryId,
                providerId,
                minStock,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                isActive
            }
        });
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating product' });
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Soft delete
        yield prisma_1.default.product.update({
            where: { id },
            data: { isActive: false }
        });
        res.json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error deleting product' });
    }
});
exports.deleteProduct = deleteProduct;
