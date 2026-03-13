import { Router } from 'express';
import * as sessionController from '../controllers/session.controller';
import authenticateToken from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, sessionController.getSessions);
router.post('/', authenticateToken, sessionController.createSession);
router.put('/:id', authenticateToken, sessionController.updateSession);
router.delete('/:id', authenticateToken, sessionController.deleteSession);

export default router;
