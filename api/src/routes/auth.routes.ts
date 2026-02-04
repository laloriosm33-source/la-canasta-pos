import { Router } from 'express';
import { login, register, checkInit } from '../controllers/auth.controller';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/init-status', checkInit);

export default router;
