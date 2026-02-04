import { Router } from 'express';
import { getInventoryByBranch, updateStock, adjustInventory, getInventoryHistory } from '../controllers/inventory.controller';

const router = Router();

router.get('/history', getInventoryHistory);
router.get('/:branchId', getInventoryByBranch);
router.post('/stock', updateStock);
router.post('/adjust', adjustInventory);

export default router;
