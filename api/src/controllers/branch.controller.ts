import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getBranches = async (req: Request, res: Response) => {
    try {
        const branches = await prisma.branch.findMany({
            include: {
                _count: {
                    select: { customers: true, inventory: true }
                }
            }
        });
        res.json(branches);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching branches' });
    }
};

export const createBranch = async (req: Request, res: Response) => {
    try {
        const { name, address, phone } = req.body;
        const branch = await prisma.branch.create({
            data: { name, address, phone }
        });
        res.status(201).json(branch);
    } catch (error) {
        res.status(500).json({ error: 'Error creating branch' });
    }
};

export const updateBranch = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, address, phone } = req.body;
        const branch = await prisma.branch.update({
            where: { id },
            data: { name, address, phone }
        });
        res.json(branch);
    } catch (error) {
        res.status(500).json({ error: 'Error updating branch' });
    }
};

export const deleteBranch = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.branch.delete({
            where: { id }
        });
        res.json({ message: 'Branch deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting branch' });
    }
};
