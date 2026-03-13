import { Router } from 'express';
import { getRecommendations, generatePlan } from '../controllers/planner.controller';
import authenticateToken from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/recommendations', getRecommendations as any);
router.get('/generate', generatePlan as any);

export default router;
