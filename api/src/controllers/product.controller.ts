import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
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
    } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id },
            include: { category: true, provider: true }
        });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching product' });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, code, cost, priceRetail, priceWholesale, unit, categoryId, providerId, minStock, expiresAt } = req.body;

        // Check if code exists (only if code is provided)
        if (code) {
            const existing = await prisma.product.findUnique({ where: { code } });
            if (existing) return res.status(400).json({ error: 'Product code already exists' });
        }

        const product = await prisma.product.create({
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
    } catch (error) {
        res.status(500).json({ error: 'Error creating product' });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, code, cost, priceRetail, priceWholesale, unit, categoryId, providerId, minStock, expiresAt, isActive } = req.body;

        const product = await prisma.product.update({
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
    } catch (error) {
        res.status(500).json({ error: 'Error updating product' });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // Soft delete
        await prisma.product.update({
            where: { id },
            data: { isActive: false }
        });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting product' });
    }
};
