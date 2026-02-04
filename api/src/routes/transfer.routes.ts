import { Router } from 'express';
import { getTransfers, createTransfer, completeTransfer, cancelTransfer } from '../controllers/transfer.controller';

const router = Router();

router.get('/', getTransfers);
router.post('/', createTransfer);
router.post('/:id/complete', completeTransfer);
router.post('/:id/cancel', cancelTransfer);

export default router;
