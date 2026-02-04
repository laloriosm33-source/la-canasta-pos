import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getProviders = async (req: Request, res: Response) => {
    try {
        const providers = await prisma.provider.findMany();
        res.json(providers);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching providers' });
    }
};

export const createProvider = async (req: Request, res: Response) => {
    try {
        const { name, contact, phone, email, rfc, address } = req.body;
        const provider = await prisma.provider.create({
            data: { name, contact, phone, email, rfc, address }
        });
        res.status(201).json(provider);
    } catch (error) {
        res.status(500).json({ error: 'Error creating provider' });
    }
};

export const updateProvider = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, contact, phone, email, rfc, address } = req.body;
        const provider = await prisma.provider.update({
            where: { id },
            data: { name, contact, phone, email, rfc, address }
        });
        res.json(provider);
    } catch (error) {
        res.status(500).json({ error: 'Error updating provider' });
    }
};

export const deleteProvider = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.provider.delete({ where: { id } });
        res.json({ message: 'Provider deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting provider' });
    }
};
