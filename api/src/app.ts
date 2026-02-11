import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes';

dotenv.config();

const app: Express = express();

// Middleware
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
    origin: corsOrigin === '*' ? '*' : corsOrigin.split(','),
    credentials: true,
}));
app.use(express.json());

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Routes
app.get('/health', async (req: Request, res: Response) => {
    let dbStatus = 'unknown';
    try {
        await prisma.$queryRaw`SELECT 1`;
        dbStatus = 'connected';
    } catch (e) {
        dbStatus = 'error: ' + (e as Error).message;
    }

    res.json({ 
        status: 'ok', 
        service: 'La Canasta API', 
        database: dbStatus,
        environment: process.env.NODE_ENV,
        timestamp: new Date() 
    });
});

app.use('/api', apiRoutes);

// Error Handling / 404
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

export default app;
