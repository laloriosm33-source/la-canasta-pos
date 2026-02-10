import { Router } from 'express';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import branchRoutes from './branch.routes';
import inventoryRoutes from './inventory.routes';
import saleRoutes from './sale.routes';
import customerRoutes from './customer.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import transferRoutes from './transfer.routes';
import providerRoutes from './provider.routes';
import financeRoutes from './finance.routes';
import systemRoutes from './system.routes';
import settingsRoutes from './settings.routes';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 🚑 Ruta de Emergencia para Reparar Base de Datos
router.get('/setup-db', async (req, res) => {
    // Protección simple
    if (req.query.key !== 'lacanasta123') {
        return res.status(403).json({ error: 'Acceso Denegado' });
    }
    
    try {
        const { exec } = require('child_process');
        // Ejecutar migración de base de datos
        exec('npx prisma migrate deploy', (error: any, stdout: any, stderr: any) => {
            if (error) {
                console.error(`Error de migración: ${error}`);
                return res.status(500).json({ 
                    status: 'error', 
                    mensaje: 'Falló la reparación de la base de datos',
                    detalle: error.message,
                    stderr 
                });
            }
            res.json({ 
                status: 'success', 
                mensaje: '¡Base de datos reparada correctamente!', 
                output: stdout 
            });
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.use('/auth', authRoutes);

// Protect all following routes
router.use(authMiddleware);

router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/branches', branchRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/sales', saleRoutes);
router.use('/customers', customerRoutes);
router.use('/users', userRoutes);
router.use('/transfers', transferRoutes);
router.use('/providers', providerRoutes);
router.use('/finance', financeRoutes);
router.use('/system', systemRoutes);
router.use('/settings', settingsRoutes);

router.get('/', (req, res) => {
    res.json({ message: 'La Canasta API v1' });
});

export default router;
