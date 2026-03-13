import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import authenticateToken from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, taskController.getTasks);
router.post('/', authenticateToken, taskController.createTask);
router.put('/:id', authenticateToken, taskController.updateTask);
router.delete('/:id', authenticateToken, taskController.deleteTask);

export default router;
