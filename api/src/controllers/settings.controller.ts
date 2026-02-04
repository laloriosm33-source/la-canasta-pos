import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getSettings = async (req: Request, res: Response) => {
    try {
        const settings = await prisma.systemSetting.findMany();
        // Convert array to object key-value
        const settingsObj = settings.reduce((acc: any, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.json(settingsObj);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener configuración maestra' });
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    try {
        const updates = req.body; // { businessName: '...', rfc: '...' }
        const transactions = Object.entries(updates).map(([key, value]) => {
            return prisma.systemSetting.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) }
            });
        });

        await prisma.$transaction(transactions);
        res.json({ message: 'Parámetros del sistema actualizados con éxito' });
    } catch (error) {
        res.status(500).json({ error: 'Error al persistir configuración' });
    }
};
