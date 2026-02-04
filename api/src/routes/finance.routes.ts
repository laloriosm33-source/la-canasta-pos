import { Router } from 'express';
import * as financeController from '../controllers/finance.controller';

const router = Router();

// Cash Movements
router.get('/movements', financeController.getCashMovements);
router.post('/movements', financeController.createCashMovement);

// Shifts
router.get('/shifts', financeController.getShifts);
router.post('/shifts/open', financeController.openShift);
router.post('/shifts/:id/close', financeController.closeShift);

// Expenses
router.get('/expenses', financeController.getExpenses);
router.post('/expenses', financeController.createExpense);

export default router;
