import { Router } from 'express';
import * as subjectController from '../controllers/subject.controller';
import authenticateToken from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, subjectController.getSubjects);
router.post('/', authenticateToken, subjectController.createSubject);
router.put('/:id', authenticateToken, subjectController.updateSubject);
router.delete('/:id', authenticateToken, subjectController.deleteSubject);

export default router;
