import { Router } from 'express';
import { getMe, updateProfile, updatePassword } from '../controllers/user.controller';
import authenticateToken from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/me', getMe as any);
router.put('/profile', updateProfile as any);
router.put('/password', updatePassword as any);

export default router;
