import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import authenticateToken from '../middleware/auth.middleware';

const router = Router();

router.get('/stats', authenticateToken, dashboardController.getStats);

export default router;
