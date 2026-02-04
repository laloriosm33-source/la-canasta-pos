import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getSystemLogs = async (req: Request, res: Response) => {
    try {
        const logs = await prisma.systemLog.findMany({
            include: { user: { select: { name: true } } },
            orderBy: { date: 'desc' },
            take: 100
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching logs' });
    }
};

export const logAction = async (userId: string, action: string, details?: string) => {
    try {
        await prisma.systemLog.create({
            data: { userId, action, details }
        });
    } catch (error) {
        console.error('Logging error:', error);
    }
};
