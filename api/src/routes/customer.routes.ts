import { Router } from 'express';
import { getCustomers, createCustomer, updateCustomer, recordPayment, deleteCustomer } from '../controllers/customer.controller';

const router = Router();

router.get('/', getCustomers);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);
router.post('/payment', recordPayment);

export default router;
