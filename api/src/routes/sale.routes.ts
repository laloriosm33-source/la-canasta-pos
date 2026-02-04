import { Router } from 'express';
import { getSales, createSale, getSaleById } from '../controllers/sale.controller';

const router = Router();

router.get('/', getSales);
router.get('/:id', getSaleById);
router.post('/', createSale);

export default router;
