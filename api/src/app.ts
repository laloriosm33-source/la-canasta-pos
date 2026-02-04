import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import apiRoutes from './routes';

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'La Canasta API', timestamp: new Date() });
});

app.use('/api', apiRoutes);

export default app;
