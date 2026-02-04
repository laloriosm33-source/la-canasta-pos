import { Router } from 'express';
import * as systemController from '../controllers/system.controller';

const router = Router();

router.get('/logs', systemController.getSystemLogs);

export default router;
